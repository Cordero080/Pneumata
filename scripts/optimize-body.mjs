import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression, KHRMaterialsPBRSpecularGlossiness } from "@gltf-transform/extensions";
import { draco, weld, textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { copyFileSync } from "fs";
import { resolve } from "path";

const filename = process.argv[2];
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
console.log(`✓ Loaded — ${(before / 1024 / 1024).toFixed(1)} MB`);

await doc.transform(textureCompress({ encoder: sharp, targetFormat: "webp", quality: 80 }));
console.log("✓ Textures → WebP");

await doc.transform(weld());
await doc.transform(draco({ method: "edgebreaker", encodeSpeed: 0, decodeSpeed: 0, quantizePosition: 14, quantizeNormal: 10 }));
console.log("✓ Draco compressed (no simplification)");

await io.write(OUTPUT, doc);
const after = (await import("fs")).statSync(OUTPUT).size;
console.log(`✓ Done — ${(before/1024/1024).toFixed(1)} MB → ${(after/1024/1024).toFixed(1)} MB (${Math.round((1-after/before)*100)}% smaller)`);
