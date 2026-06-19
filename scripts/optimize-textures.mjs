// Texture-only compression — safe for GLBs that are already Draco-compressed.
// Does NOT touch geometry (no weld, no simplify, no re-Draco).
// Run: node scripts/optimize-textures.mjs models/organs/rose-heart.glb
import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression, KHRMaterialsPBRSpecularGlossiness } from "@gltf-transform/extensions";
import { textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { copyFileSync } from "fs";
import { resolve } from "path";

const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/optimize-textures.mjs <path-relative-to-public>");
  process.exit(1);
}

const INPUT  = resolve("public", filename);
const OUTPUT = resolve("public", filename);
const BACKUP = resolve("public", filename.replace(".glb", ".backup.glb"));

copyFileSync(INPUT, BACKUP);
console.log(`✓ Backed up`);

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression, KHRMaterialsPBRSpecularGlossiness])
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(INPUT);
const before = (await io.writeBinary(doc)).byteLength;
console.log(`✓ Loaded — ${(before / 1024 / 1024).toFixed(2)} MB`);

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 80 })
);
console.log("✓ Textures → WebP");

await io.write(OUTPUT, doc);
const after = (await import("fs")).statSync(OUTPUT).size;
console.log(`✓ Done — ${(before/1024/1024).toFixed(2)} MB → ${(after/1024/1024).toFixed(2)} MB (${Math.round((1-after/before)*100)}% smaller)`);
