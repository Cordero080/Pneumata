import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { draco, simplify, weld, textureCompress } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { copyFileSync } from "fs";
import { resolve } from "path";

const INPUT  = resolve("public/lungs-red-hybrid.glb");
const OUTPUT = resolve("public/lungs-red-hybrid.glb");
const BACKUP = resolve("public/lungs-red-hybrid.backup.glb");

copyFileSync(INPUT, BACKUP);
console.log("✓ Backed up original");

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression])
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(INPUT);
console.log("✓ Loaded GLB");

// Compress all textures to WebP — keeps color/normal/emissive maps but at a fraction of the size
await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 80 })
);
console.log("✓ Compressed textures to WebP");

// Weld + simplify geometry — keep 50% of vertices, still plenty of detail at this scale
await doc.transform(weld());
await MeshoptSimplifier.ready;
await doc.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.001 })
);
console.log("✓ Simplified geometry");

// Re-apply Draco
await doc.transform(
  draco({ method: "edgebreaker", encodeSpeed: 0, decodeSpeed: 0, quantizePosition: 14, quantizeNormal: 10 })
);
console.log("✓ Applied Draco compression");

await io.write(OUTPUT, doc);
console.log(`✓ Done`);
