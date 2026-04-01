import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Samples the posterior midline vertices from all meshes in the scene to
// auto-trace the vertebral column. No bone names required.
//
// Strategy:
//   1. After normalization, updateMatrixWorld so every vertex has correct world coords.
//   2. Iterate every vertex across all meshes. Apply the mesh's world matrix so
//      the position is in the same space as the organ node coordinates.
//   3. Filter to the posterior-midline corridor: |x| < 0.025, z < -0.015,
//      y in the known spine height range (0.86 → 1.60).
//   4. Bucket the survivors into N equal y-bands. Average z per band → centerline.
//   5. Return as [[0, y, z], ...] sorted top → bottom.
function sampleSpinePoints(scene, numBins = 24) {
  scene.updateMatrixWorld(true);

  const Y_MIN = 0.86,
    Y_MAX = 1.6;
  const bins = Array.from({ length: numBins }, () => ({
    sumY: 0,
    sumZ: 0,
    n: 0,
  }));
  const tmp = new THREE.Vector3();

  scene.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry?.attributes?.position;
    if (!pos) return;
    const mat = child.matrixWorld;

    for (let i = 0; i < pos.count; i++) {
      tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mat);
      if (
        Math.abs(tmp.x) < 0.025 &&
        tmp.z < -0.015 &&
        tmp.y > Y_MIN &&
        tmp.y < Y_MAX
      ) {
        const bi = Math.min(
          Math.floor(((tmp.y - Y_MIN) / (Y_MAX - Y_MIN)) * numBins),
          numBins - 1,
        );
        bins[bi].sumY += tmp.y;
        bins[bi].sumZ += tmp.z;
        bins[bi].n++;
      }
    }
  });

  const points = bins
    .filter((b) => b.n >= 3)
    .map((b) => [0, b.sumY / b.n, b.sumZ / b.n])
    .sort((a, b) => b[1] - a[1]); // descending y = top to bottom

  console.log(`[SpineSampler] ${points.length} points extracted:`);
  points.forEach(([, y, z]) =>
    console.log(`  y=${y.toFixed(3)}  z=${z.toFixed(3)}`),
  );

  return points.length >= 4 ? points : null;
}

const TARGET_HEIGHT = 1.75;

function AnatomyModel({ viewMode, onSpineExtracted }) {
  const { scene } = useGLTF("/male-body.glb");
  const materialRef = useRef(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;

    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);

    // Harvest first available map from GLB to use as emissive mask.
    // AO map settles glow into crevices/valleys; roughness map works similarly.
    let emissiveMap = null;
    scene.traverse((child) => {
      if (child.isMesh && !emissiveMap) {
        const m = child.material;
        emissiveMap = m?.aoMap ?? m?.roughnessMap ?? null;
      }
    });

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#050505"),
      transparent: true,
      transmission: 0.9,
      opacity: 0.4,
      roughness: 0.2,
      depthWrite: false,
      emissive: new THREE.Color("#880000"),
      emissiveIntensity: 0,
    });

    if (emissiveMap) mat.emissiveMap = emissiveMap;

    materialRef.current = mat;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 0;
      }
    });

    // Sample posterior-midline vertices to auto-trace the vertebral column
    const spinePoints = sampleSpinePoints(scene);
    if (spinePoints && onSpineExtracted) onSpineExtracted(spinePoints);
  }, [scene]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle underlayer — complements the aorta surge without competing
    let base = 0;
    if (viewMode === "power") base = 0.55;
    else if (viewMode === "unified") base = 0.25;

    const pulse = base > 0 ? Math.sin(t * 1.2) * 0.15 * base : 0;
    const target = base + pulse;

    materialRef.current.emissiveIntensity +=
      (target - materialRef.current.emissiveIntensity) * 0.05;
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/male-body.glb");

export default AnatomyModel;
