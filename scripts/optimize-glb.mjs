import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { draco, simplify, weld, textureCompress } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { copyFileSync, existsSync } from "fs";
import { resolve } from "path";

const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/optimize-glb.mjs <filename.glb>");
  console.error("Example: node scripts/optimize-glb.mjs new-lungs.glb");
  process.exit(1);
}

const INPUT  = resolve("public", filename);
const OUTPUT = resolve("public", filename);
const BACKUP = resolve("public", filename.replace(".glb", ".backup.glb"));

if (!existsSync(INPUT)) {
  console.error(`File not found: ${INPUT}`);
  process.exit(1);
}

copyFileSync(INPUT, BACKUP);
console.log(`✓ Backed up to ${BACKUP}`);

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression])
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(INPUT);
const before = (await io.writeBinary(doc)).byteLength;
console.log(`✓ Loaded — ${(before / 1024 / 1024).toFixed(1)} MB`);

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 80 })
);
console.log("✓ Textures → WebP");

await doc.transform(weld());
await MeshoptSimplifier.ready;
await doc.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.001 })
);
console.log("✓ Geometry simplified");

await doc.transform(
  draco({ method: "edgebreaker", encodeSpeed: 0, decodeSpeed: 0, quantizePosition: 14, quantizeNormal: 10 })
);
console.log("✓ Draco compressed");

await io.write(OUTPUT, doc);
const after = (await import("fs")).statSync(OUTPUT).size;
console.log(`✓ Done — ${(before / 1024 / 1024).toFixed(1)} MB → ${(after / 1024 / 1024).toFixed(1)} MB (${Math.round((1 - after / before) * 100)}% smaller)`);
