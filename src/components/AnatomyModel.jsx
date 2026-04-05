import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Skull bounds (sampled once from GLB, y > 1.55):
//   x: -0.096 → 0.096   y: 1.550 → 1.750   z: -0.126 → 0.098

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
  meshMode,
}) {
  const { scene } = useGLTF("/male-body.glb");
  const materialRef = useRef(null);
  const bloodMatRef = useRef(null);
  const bloodPulseRef = useRef(0);
  const lastBeatCountRef = useRef(0);
  const [bloodScene, setBloodScene] = useState(null);
  const breathMatRef = useRef(null);
  const [breathScene, setBreathScene] = useState(null);
  const aluminumMatRef = useRef(null);
  const [aluminumScene, setAluminumScene] = useState(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;

    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);

    // Harvest first available map from GLB to use as emissive mask.
    let emissiveMap = null;
    scene.traverse((child) => {
      if (child.isMesh && !emissiveMap) {
        const m = child.material;
        emissiveMap = m?.aoMap ?? m?.roughnessMap ?? null;
      }
    });

    // Main material — ghost skin overlay (light mode default)
    // Near-invisible: lets the aluminum layer below define the body shape,
    // while this layer adds a subtle translucent skin surface on top.
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eef2f6"),
      transparent: true,
      transmission: 0,
      opacity: 0.13,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      depthWrite: false,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
    });

    if (emissiveMap) mat.emissiveMap = emissiveMap;
    materialRef.current = mat;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 1; // ghost skin renders in front of aluminum
      }
    });

    // Sample posterior-midline vertices to auto-trace the vertebral column
    const spinePoints = sampleSpinePoints(scene);
    if (spinePoints && onSpineExtracted) onSpineExtracted(spinePoints);

    // Aluminum structure layer — defines the body shape in light mode
    // Low metalness so base color (#d2d8de) shows as silver-gray without an envmap.
    // High opacity so the outer skin mesh occludes the inner bones — giving contrast.
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8dde2"),
      metalness: 0.88,
      roughness: 0.15,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
    });
    aluminumMatRef.current = aluminumMat;

    const aluminumClone = scene.clone(true);
    aluminumClone.traverse((child) => {
      if (child.isMesh) {
        child.material = aluminumMat;
        child.renderOrder = 0; // behind ghost skin
      }
    });
    setAluminumScene(aluminumClone);

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
        child.renderOrder = 2;
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
        child.renderOrder = 3;
      }
    });
    setBreathScene(breathClone);

    // Sync to current mode immediately — darkMode effect may have run before
    // materials existed (async GLB load) and returned early without applying anything
    if (darkMode) {
      mat.color.set("#030306");
      mat.emissive.set("#880000");
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.opacity = 0.82;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
      mat.needsUpdate = true;
      aluminumMat.opacity = 0;
      aluminumMat.needsUpdate = true;
    }
  }, [scene]);

  // Swap material properties when darkMode changes
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    if (darkMode) {
      // Obsidian — solid, iridescent, full presence
      mat.color.set("#030306");
      mat.emissive.set("#880000"); // crimson — power mode flush, not white
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.transmission = 0;
      mat.opacity = 0.82;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
      // Hide aluminum layer in dark mode — also disable depthWrite so invisible mesh doesn't pollute depth buffer
      if (aluminumMatRef.current) {
        aluminumMatRef.current.opacity = 0;
        aluminumMatRef.current.depthWrite = false;
        aluminumMatRef.current.needsUpdate = true;
      }
    } else {
      // Light mode — ghost skin: near-invisible aura, aluminum layer defines the shape
      mat.color.set("#eef2f6");
      mat.metalness = 0;
      mat.roughness = 0.2;
      mat.transmission = 0;
      mat.opacity = 0.13;
      mat.iridescence = 0;
      mat.clearcoat = 0.5;
      mat.clearcoatRoughness = 0.1;
      mat.emissive.set("#ffffff");
      mat.emissiveIntensity = 0;
      // Restore aluminum layer in light mode — re-enable depthWrite for solid silver look
      if (aluminumMatRef.current) {
        aluminumMatRef.current.opacity = 0.95;
        aluminumMatRef.current.depthWrite = true;
        aluminumMatRef.current.needsUpdate = true;
      }
    }
    mat.needsUpdate = true;
  }, [darkMode]);

  // Mesh mode toggle
  useEffect(() => {
    const mat = materialRef.current;
    const al = aluminumMatRef.current;
    if (!mat || !al) return;

    if (darkMode) {
      // Dark mode: 0=dark ghost, 1=semi obsidian, 2=solid obsidian, 3=white ghost, 4=semi silver, 5=solid silver
      if (meshMode === 4 || meshMode === 5) {
        const solid = meshMode === 5;
        mat.color.set("#eef2f6");
        mat.emissive.set("#ffffff");
        mat.emissiveIntensity = 0;
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.13;
        mat.metalness = 0;
        mat.roughness = 0.2;
        mat.iridescence = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = !solid;
        al.color.set("#d8dde2");
        al.metalness = 0.88;
        al.roughness = 0.15;
        al.opacity = solid ? 1.0 : 0.82;
        al.depthWrite = solid;
        al.needsUpdate = true;
      } else if (meshMode === 3) {
        mat.color.set("#f0f4ff");
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.28;
        mat.metalness = 0.05;
        mat.roughness = 0.1;
        mat.emissive.set("#c8a060");
        mat.emissiveIntensity = 0.1;
        mat.iridescence = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      } else if (meshMode === 0) {
        mat.color.set("#030306");
        mat.emissive.set("#880000");
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.45;
        mat.metalness = 0.1;
        mat.roughness = 0.12;
        mat.iridescence = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      } else {
        const solid = meshMode === 2;
        mat.color.set("#030306");
        mat.emissive.set("#880000");
        mat.transparent = !solid;
        mat.transmission = 0;
        mat.opacity = solid ? 1.0 : 0.82;
        mat.metalness = 0.92;
        mat.roughness = 0.08;
        mat.iridescence = 0.45;
        mat.depthWrite = solid;
        mat.needsUpdate = true;
        // Hide aluminum (always hidden for obsidian modes)
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
      }
    } else {
      // Light mode:
      // 0 = original ghost (dark glass, no aluminum)
      // 1 = semi-transparent silver aluminum
      // 2 = solid silver aluminum
      if (meshMode === 0) {
        // Ghost x-ray: hide aluminum, dark charcoal body — bones visible through stacked semi-transparent layers
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
        mat.color.set("#1a1a2a");
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.45;
        mat.metalness = 0.1;
        mat.roughness = 0.12;
        mat.emissiveIntensity = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      } else if (meshMode === 3) {
        // White ghost x-ray: luminous white skin, aluminum at low opacity for structure
        mat.color.set("#f0f4ff");
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.28;
        mat.metalness = 0.05;
        mat.roughness = 0.1;
        mat.emissive.set("#c8a060");
        mat.emissiveIntensity = 0.1;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = true;
        al.color.set("#a8bcd4");
        al.metalness = 0.1;
        al.roughness = 0.1;
        al.opacity = 0.55;
        al.depthWrite = false;
        al.needsUpdate = true;
      } else {
        // Restore aluminum silver for modes 1 and 2
        mat.color.set("#eef2f6");
        mat.transmission = 0;
        mat.opacity = 0.13;
        mat.metalness = 0;
        mat.roughness = 0.2;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = meshMode !== 2;
        al.color.set("#d8dde2");
        al.metalness = 0.88;
        al.roughness = 0.15;
        al.opacity = meshMode === 2 ? 1.0 : 0.82;
        al.depthWrite = meshMode === 2;
        al.needsUpdate = true;
      }
    }
  }, [meshMode, darkMode]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // Emissive pulse — crimson flush in dark mode power, complements blood layer
    let base = 0;
    if (viewMode === "power") base = darkMode ? 0.55 : 0.4;
    else if (viewMode === "unified") base = darkMode ? 0.25 : 0.15;

    // In light mode, emissive must be crimson for the flush to read as red
    if (!darkMode) {
      materialRef.current.emissive.set(
        viewMode === "power" || viewMode === "unified" ? "#880000" : "#ffffff",
      );
    }

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
      {aluminumScene && <primitive object={aluminumScene} />}
      <primitive object={scene} />
      {bloodScene && <primitive object={bloodScene} />}
      {breathScene && <primitive object={breathScene} />}
    </>
  );
}

useGLTF.preload("/male-body.glb");

export default AnatomyModel;
