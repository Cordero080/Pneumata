import { useRef, useEffect, useState } from "react";
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

// Pre-created to avoid per-frame allocation — lerped each frame in useFrame
const BREATH_BLUE = new THREE.Color("#334499"); // deoxygenated blood in transit
const BREATH_CYAN = new THREE.Color("#b0e8ff"); // oxygenated at peak

function AnatomyModel({
  viewMode,
  onSpineExtracted,
  heartbeatRef,
  breathingRef,
  darkMode,
}) {
  const { scene } = useGLTF("/male-body.glb");
  const materialRef = useRef(null);
  const bloodMatRef = useRef(null);
  const bloodPulseRef = useRef(0);
  const lastBeatCountRef = useRef(0);
  const [bloodScene, setBloodScene] = useState(null);
  const breathMatRef = useRef(null);
  const [breathScene, setBreathScene] = useState(null);

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

    // Blood volumetric layer — cloned mesh with additive blending
    const bloodMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#4d1515"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });
    bloodMatRef.current = bloodMat;

    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = bloodMat;
        child.renderOrder = 1;
      }
    });
    setBloodScene(clone);

    // Breath volumetric layer — color-shifts blue→cyan with breathingRef
    const breathMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#334499"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });
    breathMatRef.current = breathMat;

    const breathClone = scene.clone(true);
    breathClone.traverse((child) => {
      if (child.isMesh) {
        child.material = breathMat;
        child.renderOrder = 2;
      }
    });
    setBreathScene(breathClone);
  }, [scene]);

  // Swap material properties when darkMode changes
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    if (darkMode) {
      mat.color.set("#030306");
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.transmission = 0;
      mat.opacity = 0.82;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
    } else {
      mat.color.set("#050505");
      mat.metalness = 0;
      mat.roughness = 0.2;
      mat.transmission = 0.9;
      mat.opacity = 0.4;
      mat.iridescence = 0;
      mat.clearcoat = 0;
    }
    mat.needsUpdate = true;
  }, [darkMode]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle underlayer — complements the aorta surge without competing
    let base = 0;
    if (viewMode === "power") base = 0.55;
    else if (viewMode === "unified") base = 0.25;

    if (viewMode === "breathing") {
      materialRef.current.emissiveIntensity = 0;
    } else {
      const pulse = base > 0 ? Math.sin(t * 1.2) * 0.15 * base : 0;
      const target = base + pulse;
      materialRef.current.emissiveIntensity +=
        (target - materialRef.current.emissiveIntensity) * 0.05;
    }

    // Blood volumetric pulse — synced to heartbeatRef counter
    if (!bloodMatRef.current) return;

    if (heartbeatRef && heartbeatRef.current !== lastBeatCountRef.current) {
      lastBeatCountRef.current = heartbeatRef.current;
      bloodPulseRef.current = 0.35;
    }

    if (viewMode === "power") {
      bloodPulseRef.current *= 0.94;
      const ambient = Math.sin(t * 1.2) * 0.008 + 0.012;
      bloodMatRef.current.opacity = bloodPulseRef.current + ambient;
    } else if (viewMode === "breathing") {
      bloodPulseRef.current = 0;
      bloodMatRef.current.opacity = 0;
    } else {
      bloodPulseRef.current *= 0.9;
      bloodMatRef.current.opacity = bloodPulseRef.current * 0.3;
    }

    // Breath color layer — blue (inhale/deoxygenated) → cyan (peak/oxygenated)
    if (!breathMatRef.current) return;
    const isBreathActive = viewMode === "breathing" || viewMode === "unified";
    const breathe = breathingRef?.current ?? 0;
    if (isBreathActive) {
      breathMatRef.current.color.lerpColors(BREATH_BLUE, BREATH_CYAN, breathe);
      breathMatRef.current.opacity = breathe * 0.08;
    } else {
      breathMatRef.current.opacity = 0;
    }
  });

  return (
    <>
      <primitive object={scene} />
      {bloodScene && <primitive object={bloodScene} />}
      {breathScene && <primitive object={breathScene} />}
    </>
  );
}

useGLTF.preload("/male-body.glb");

export default AnatomyModel;
