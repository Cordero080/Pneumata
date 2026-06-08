import { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as maleConfig from "./male/male-config";
import * as femaleConfig from "./female/female-config";
import "./male/MaleModel.scss";
import "./female/FemaleModel.scss";

// Skull bounds (sampled once from GLB, y > 1.55):
//   x: -0.096 → 0.096   y: 1.550 → 1.750   z: -0.126 → 0.098

function sampleSpinePoints(scene, numBins = 24, opts = {}) {
  scene.updateMatrixWorld(true);

  const Y_MIN = opts.yMin ?? 0.86;
  const Y_MAX = opts.yMax ?? 1.6;
  const Z_NUDGE = opts.zNudge ?? 0; // positive = push forward (toward viewer)
  const Z_NUDGE_TOP = opts.zNudgeTop ?? 0; // extra forward push for upper spine
  const Z_MAX = opts.zMax ?? -0.015; // most-forward Z allowed — tighten for female
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
        tmp.z < Z_MAX &&
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
    .map((b) => {
      const y = b.sumY / b.n;
      // Graduated top nudge: ramps from 0 at 75% height to full at Y_MAX (cervical only)
      const topT = Math.max(
        0,
        (y - (Y_MIN + (Y_MAX - Y_MIN) * 0.75)) / ((Y_MAX - Y_MIN) * 0.25),
      );
      return [0, y, b.sumZ / b.n + Z_NUDGE + topT * topT * Z_NUDGE_TOP];
    })
    .sort((a, b) => b[1] - a[1]); // descending y = top to bottom

  console.log(`[SpineSampler] ${points.length} points extracted:`);
  points.forEach(([, y, z]) =>
    console.log(`  y=${y.toFixed(3)}  z=${z.toFixed(3)}`),
  );

  return points.length >= 4 ? points : null;
}

// ---------------------------------------------------------------------------
// Body landmark sampler
// ---------------------------------------------------------------------------
const LANDMARK_DEFS = {
  // Upper limb
  shoulder_left: { yMin: 1.36, yMax: 1.52, xSign: -1, outer: true },
  shoulder_right: { yMin: 1.36, yMax: 1.52, xSign: 1, outer: true },
  axilla_left: { yMin: 1.26, yMax: 1.4, xSign: -1, outer: true },
  axilla_right: { yMin: 1.26, yMax: 1.4, xSign: 1, outer: true },
  elbow_left: { yMin: 0.95, yMax: 1.1, xSign: -1, outer: true },
  elbow_right: { yMin: 0.95, yMax: 1.1, xSign: 1, outer: true },
  wrist_left: { yMin: 0.65, yMax: 0.8, xSign: -1, outer: false, absXMin: 0.3 },
  wrist_right: { yMin: 0.65, yMax: 0.8, xSign: 1, outer: false, absXMin: 0.3 },
  hand_left: {
    yMin: 0.42,
    yMax: 0.62,
    xSign: -1,
    outer: false,
    absXMin: 0.2,
    absXMax: 0.3,
    zMin: 0,
  },
  hand_right: {
    yMin: 0.42,
    yMax: 0.62,
    xSign: 1,
    outer: false,
    absXMin: 0.2,
    absXMax: 0.3,
    zMin: 0,
  },
  // Lower limb — lateral
  hip_left: {
    yMin: 0.82,
    yMax: 0.93,
    xSign: -1,
    outer: false,
    absXMax: 0.13,
    zMax: 0.02,
  },
  hip_right: {
    yMin: 0.82,
    yMax: 0.93,
    xSign: 1,
    outer: false,
    absXMax: 0.13,
    zMax: 0.02,
  },
  knee_left: { yMin: 0.38, yMax: 0.54, xSign: -1, outer: true },
  knee_right: { yMin: 0.38, yMax: 0.54, xSign: 1, outer: true },
  ankle_left: {
    yMin: 0.12,
    yMax: 0.2,
    xSign: -1,
    outer: false,
    absXMax: 0.07,
    zMax: 0.0,
  },
  ankle_right: {
    yMin: 0.12,
    yMax: 0.2,
    xSign: 1,
    outer: false,
    absXMax: 0.07,
    zMax: 0.0,
  },
  foot_left: {
    yMin: 0.0,
    yMax: 0.18,
    xSign: -1,
    outer: false,
    absXMax: 0.08,
    zMax: 0.0,
  },
  foot_right: {
    yMin: 0.0,
    yMax: 0.18,
    xSign: 1,
    outer: false,
    absXMax: 0.08,
    zMax: 0.0,
  },
  // Lower limb — medial/posterior
  groin_left: {
    yMin: 0.78,
    yMax: 0.9,
    xSign: -1,
    outer: false,
    absXMax: 0.12,
    zMin: -0.04,
  },
  groin_right: {
    yMin: 0.78,
    yMax: 0.9,
    xSign: 1,
    outer: false,
    absXMax: 0.12,
    zMin: -0.04,
  },
  posterior_thigh_left: {
    yMin: 0.52,
    yMax: 0.72,
    xSign: -1,
    outer: false,
    zMax: -0.02,
  },
  posterior_thigh_right: {
    yMin: 0.52,
    yMax: 0.72,
    xSign: 1,
    outer: false,
    zMax: -0.02,
  },
  calf_left: { yMin: 0.2, yMax: 0.36, xSign: -1, outer: false, zMax: -0.01 },
  calf_right: { yMin: 0.2, yMax: 0.36, xSign: 1, outer: false, zMax: -0.01 },
  // Neck — anterior lateral cervical region (carotid/vagus territory)
  neck_left: { yMin: 1.5, yMax: 1.62, xSign: -1, outer: false, absXMax: 0.06 },
  neck_right: { yMin: 1.5, yMax: 1.62, xSign: 1, outer: false, absXMax: 0.06 },
};

function sampleBodyLandmarks(scene, heightScale = 1) {
  scene.updateMatrixWorld(true);

  const tmp = new THREE.Vector3();
  const keys = Object.keys(LANDMARK_DEFS);

  const buckets = {};
  for (const k of keys) buckets[k] = [];

  scene.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry?.attributes?.position;
    if (!pos) return;
    const mat = child.matrixWorld;

    for (let i = 0; i < pos.count; i++) {
      tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mat);
      const { x, y, z } = tmp;

      for (const k of keys) {
        const d = LANDMARK_DEFS[k];
        if (y < d.yMin * heightScale || y > d.yMax * heightScale) continue;
        if (d.xSign === -1 && x >= 0) continue;
        if (d.xSign === 1 && x <= 0) continue;
        if (d.absXMax !== undefined && Math.abs(x) > d.absXMax) continue;
        if (d.absXMin !== undefined && Math.abs(x) < d.absXMin) continue;
        if (d.zMax !== undefined && z > d.zMax) continue;
        if (d.zMin !== undefined && z < d.zMin) continue;
        buckets[k].push([x, y, z]);
      }
    }
  });

  const landmarks = {};
  for (const k of keys) {
    let pts = buckets[k];
    if (pts.length === 0) continue;

    if (LANDMARK_DEFS[k].outer) {
      pts.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
      pts = pts.slice(0, Math.max(1, Math.floor(pts.length * 0.25)));
    }

    const n = pts.length;
    landmarks[k] = [
      pts.reduce((s, p) => s + p[0], 0) / n,
      pts.reduce((s, p) => s + p[1], 0) / n,
      pts.reduce((s, p) => s + p[2], 0) / n,
    ];
  }

  console.log("[LandmarkSampler] extracted:", landmarks);
  return landmarks;
}

const TARGET_HEIGHT = 1.75;
const IS_MOBILE = window.innerWidth <= 768;

const BREATH_BLUE = new THREE.Color("#334499");
const BREATH_CYAN = new THREE.Color("#b0e8ff");
const EMISSIVE_WHITE = new THREE.Color("#ffffff");
const EMISSIVE_POWER = new THREE.Color("#bd0404");

function AnatomyModel({
  modelPath = "/male-body.glb",
  viewMode,
  onSpineExtracted,
  onLandmarksExtracted,
  heartbeatRef,
  breathingRef,
  darkMode,
  meshMode,
  femaleMode,
}) {
  // Config is constant for this component's lifetime — AnatomyModel remounts (key=modelPath)
  // whenever femaleMode changes, so this selection never changes mid-lifecycle.
  const config = femaleMode ? femaleConfig : maleConfig;

  const gltf = useGLTF(modelPath);
  const materialRef = useRef(null);
  const bloodMatRef = useRef(null);
  const bloodPulseRef = useRef(0);
  const lastBeatCountRef = useRef(0);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const raw = config.RAW;
    const s = (TARGET_HEIGHT * config.HEIGHT_SCALE) / raw.height;
    cloned.scale.setScalar(s);
    cloned.position.set(
      -raw.centerX * s,
      -raw.yMin * s + config.Y_OFFSET,
      -raw.centerZ * s,
    );
    // Apply ghost material immediately so frame 1 never shows raw GLB materials
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eef2f6"),
      transparent: true,
      transmission: 0,
      opacity: 0.13,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      iridescence: 0.001,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 280],
      depthWrite: false,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
    });
    materialRef.current = mat;
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 1;
      }
    });
    return cloned;
  }, [gltf.scene]);
  const [bloodScene, setBloodScene] = useState(null);
  const breathMatRef = useRef(null);
  const [breathScene, setBreathScene] = useState(null);
  const aluminumMatRef = useRef(null);
  const [aluminumScene, setAluminumScene] = useState(null);
  const [sheenScene, setSheenScene] = useState(null);

  useEffect(() => {
    setBloodScene(null);
    setBreathScene(null);
    setAluminumScene(null);
    setSheenScene(null);

    const raw = config.RAW;
    const s = (TARGET_HEIGHT * config.HEIGHT_SCALE) / raw.height;

    // Scale/position already applied in useMemo; re-apply here in case effect runs
    // after a hot-reload or future change that resets the scene transform.
    scene.scale.setScalar(s);
    scene.position.set(
      -raw.centerX * s,
      -raw.yMin * s + config.Y_OFFSET,
      -raw.centerZ * s,
    );
    scene.updateMatrixWorld(true);

    let emissiveMap = null;
    scene.traverse((child) => {
      if (child.isMesh && !emissiveMap) {
        const m = child.material;
        emissiveMap = m?.aoMap ?? m?.roughnessMap ?? null;
      }
    });

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eef2f6"),
      transparent: true,
      transmission: 0,
      opacity: 0.13,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      iridescence: 0.001,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 280],
      depthWrite: false,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
    });

    if (emissiveMap) mat.emissiveMap = emissiveMap;
    mat.needsUpdate = true;
    materialRef.current = mat;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 1;
      }
    });

    // Spine — male uses hardcoded points, female samples dynamically
    if (!config.SPINE_OPTS) {
      if (onSpineExtracted) onSpineExtracted(config.MALE_SPINE_POINTS);
    } else {
      const spinePoints = sampleSpinePoints(scene, 24, config.SPINE_OPTS);
      if (spinePoints && onSpineExtracted) onSpineExtracted(spinePoints);
    }

    const landmarks = sampleBodyLandmarks(scene, config.HEIGHT_SCALE);
    if (onLandmarksExtracted) onLandmarksExtracted(landmarks);

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8d5e0"),
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
        child.renderOrder = 0;
      }
    });
    setAluminumScene(aluminumClone);

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

    // Sync dark mode immediately in case it was active before this async GLB load resolved
    if (darkMode) {
      // Colors come from male-config.js or female-config.js → COLORS object. Change colors there.
      // "mat" = ghost/base layer. "al" = aluminum layer on top.
      mat.color.set(config.COLORS.obsColor);
      mat.emissive.set(config.COLORS.obsEmissive);
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.opacity = 0.2;
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

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    const { obsColor, obsEmissive, ghostColor, alColor } = config.COLORS;

    if (darkMode) {
      mat.color.set(obsColor);
      mat.emissive.set(obsEmissive);
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.transmission = 0;
      mat.opacity = 0.82;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
      if (aluminumMatRef.current) {
        aluminumMatRef.current.opacity = 0;
        aluminumMatRef.current.depthWrite = false;
        aluminumMatRef.current.needsUpdate = true;
      }
    } else {
      mat.color.set(ghostColor);
      mat.metalness = 0;
      mat.roughness = 0.2;
      mat.transmission = 0;
      mat.opacity = 0.13;
      mat.iridescence = 0.001;
      mat.clearcoat = 0.5;
      mat.clearcoatRoughness = 0.1;
      mat.emissive.set("#ffffff");
      mat.emissiveIntensity = 0;
      if (aluminumMatRef.current) {
        aluminumMatRef.current.color.set(alColor);
        aluminumMatRef.current.opacity = 0.95;
        aluminumMatRef.current.depthWrite = true;
        aluminumMatRef.current.needsUpdate = true;
      }
    }
    mat.needsUpdate = true;
  }, [darkMode, femaleMode]);

  useEffect(() => {
    const mat = materialRef.current;
    const al = aluminumMatRef.current;
    if (!mat || !al) return;

    const {
      obsColor,
      obsEmissive,
      ghostColor,
      ghostDark,
      alColor,
      alColorDark,
      whiteColor,
      whiteAlColor,
      whiteAlColorDark,
      whiteEmissiveLight,
      whiteEmissiveDark,
      onyxColor,
      onyxColorDark,
      onyxEmissive,
    } = config.COLORS;

    const alColorResolved = darkMode ? alColorDark : alColor;
    const whiteAlResolved = darkMode ? whiteAlColorDark : whiteAlColor;
    const whiteEmissive = darkMode ? whiteEmissiveDark : whiteEmissiveLight;

    if (darkMode) {
      // DARK · MODE 6 — ONYX: solid opaque near-black. color=onyxColorDark, emissive=onyxEmissive
      if (meshMode === 6) {
        // Onyx — solid near-black with violet emissive
        mat.color.set(onyxColorDark);
        mat.emissive.set(onyxEmissive);
        mat.emissiveIntensity = 0.12;
        mat.transparent = false;
        mat.transmission = 0;
        mat.opacity = 1.0;
        mat.metalness = 0.95;
        mat.roughness = 0.05;
        mat.iridescence = 0.3;
        mat.iridescenceIOR = 1.4;
        mat.iridescenceThicknessRange = [80, 200];
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.05;
        mat.depthWrite = true;
        mat.needsUpdate = true;
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
        // DARK · MODE 4=chrome transparent / MODE 5=chrome solid. Ghost hidden, aluminum visible. color=alColorDark
      } else if (meshMode === 4 || meshMode === 5) {
        const solid = meshMode === 5;
        mat.transparent = true;
        mat.opacity = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = !solid;
        al.color.set(alColorResolved);
        al.metalness = 0.88;
        al.roughness = 0.15;
        al.opacity = solid ? 1.0 : 0.82;
        al.depthWrite = solid;
        al.needsUpdate = true;
        // DARK · MODE 3 — X-RAY/BONE: semi-transparent white. color=whiteColor, emissive=whiteEmissiveDark (purple♂ pink♀)
      } else if (meshMode === 3) {
        mat.color.set(whiteColor);
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.68;
        mat.metalness = 0.3;
        mat.roughness = 0.1;
        mat.emissive.set(whiteEmissive);
        mat.emissiveIntensity = 0.1;
        mat.iridescence = 0.001;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        // DARK · MODE 0 — GHOST: thin dark shell. color=obsColor, emissive=obsEmissive
      } else if (meshMode === 0) {
        mat.color.set(obsColor);
        mat.emissive.set(obsEmissive);
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.85;
        mat.metalness = 0.11;
        mat.roughness = 0.12;
        mat.iridescence = 0.001;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        // DARK · MODE 1=obsidian transparent / MODE 2=obsidian solid. Iridescent black. color=obsColor, emissive=obsEmissive
      } else {
        const solid = meshMode === 2;
        mat.color.set(obsColor);
        mat.emissive.set(obsEmissive);
        mat.transparent = !solid;
        mat.transmission = 0;
        mat.opacity = solid ? 1.0 : 0.82;
        mat.metalness = 0.92;
        mat.roughness = 0.08;
        mat.iridescence = .95;
        mat.depthWrite = solid;
        mat.needsUpdate = true;
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
      }
    } else {
      // LIGHT · MODE 6 — ONYX: same as dark mode 6. color=onyxColor, emissive=onyxEmissive
      if (meshMode === 6) {
        // Onyx — solid near-black, works same in light and dark mode
        mat.color.set(darkMode ? onyxColorDark : onyxColor);
        mat.emissive.set(onyxEmissive);
        mat.emissiveIntensity = 0.12;
        mat.transparent = false;
        mat.transmission = 0;
        mat.opacity = 1.0;
        mat.metalness = 0.75;
        mat.roughness = 0.05;
        mat.iridescence = 1;
        mat.iridescenceIOR = 2.4;
        mat.iridescenceThicknessRange = [80, 200];
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.05;
        mat.depthWrite = true;
        mat.needsUpdate = true;
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
        // LIGHT · MODE 0 — GHOST: dark semi-transparent. color=ghostDark (charcoal♂ warm-charcoal♀)
      } else if (meshMode === 0) {
        al.transparent = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
        mat.color.set(ghostDark);
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.45;
        mat.metalness = 15;
        mat.roughness = 0.12;
        mat.emissiveIntensity = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        // LIGHT · MODE 3 — X-RAY/BONE: white ghost + aluminum overlay. color=whiteColor, emissive=whiteEmissiveLight (amber♂ pink♀)
      } else if (meshMode === 3) {
        mat.color.set(whiteColor);
        mat.transparent = true;
        mat.transmission = 0;
        mat.opacity = 0.18;
        mat.metalness = 0.01;
        mat.roughness = 0.1;
        mat.emissive.set(whiteEmissive);
        mat.emissiveIntensity = 0.1;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = true;
        al.color.set(whiteAlResolved);
        al.metalness = 0.1;
        al.roughness = 0.1;
        al.opacity = 0.38;
        al.depthWrite = false;
        al.needsUpdate = true;
        // LIGHT · MODE 4 — METALLIC CHROME (transparent): ghost hidden, aluminum semi-transparent. color=alColor
      } else if (meshMode === 4) {
        // Ghost hidden, aluminum semi-transparent — mirrors dark mode 4 behaviour
        mat.transparent = true;
        mat.opacity = 0;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = true;
        al.color.set(alColorResolved);
        al.metalness = 0.90;
        al.roughness = 0.15;
        al.opacity = 0.62;
        al.depthWrite = false;
        al.needsUpdate = true;
        // LIGHT · MODE 1=ghost+aluminum transparent / MODE 2=ghost+aluminum solid. color=ghostColor + alColor
      } else {
        mat.color.set(ghostColor);
        mat.transmission = 0;
        mat.opacity = 0.13;
        mat.metalness = 0;
        mat.roughness = 0.2;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        al.transparent = meshMode !== 2;
        al.color.set(alColorResolved);
        al.metalness = 0.88;
        al.roughness = 0.15;
        al.opacity = meshMode === 2 ? 1.0 : 0.82;
        al.depthWrite = meshMode === 2;
        al.needsUpdate = true;
      }
    }
  }, [meshMode, darkMode, femaleMode]);

  // Sheen layer — female only: upper-body velvet/peach-fuzz, fades out at waist
  useEffect(() => {
    if (!config.HAS_SHEEN) {
      setSheenScene(null);
      return;
    }

    const sheenMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d8c0d0"),
      metalness: 0.1,
      roughness: 0.4,
      sheen: 0.6,
      sheenColor: new THREE.Color("#e0c8d8"),
      sheenRoughness: 0.3,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });

    sheenMat.onBeforeCompile = (shader) => {
      shader.vertexShader = "varying float vSheenFade;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 _wp = modelMatrix * vec4(position, 1.0);
        vSheenFade = smoothstep(0.5, 0.92, _wp.y);`,
      );
      shader.fragmentShader =
        "varying float vSheenFade;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `#include <output_fragment>
        gl_FragColor.a *= vSheenFade;`,
      );
    };

    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = sheenMat;
        child.renderOrder = 6;
      }
    });
    setSheenScene(clone);
  }, [femaleMode, scene]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    if (darkMode && materialRef.current.iridescence > 0) {
      materialRef.current.iridescenceIOR = 1.2 + Math.sin(t * 0.4) * 0.25;
      const iriRange = materialRef.current.iridescenceThicknessRange;
      iriRange[0] = 100 + Math.sin(t * 0.3) * 60;
      iriRange[1] = 260 + Math.cos(t * 0.35) * 80;
    }

    let base = 0;
    if (viewMode === "power") base = darkMode ? 0.55 : 0.4;
    else if (viewMode === "unified") base = darkMode ? 0.25 : 0.15;

    if (!darkMode) {
      materialRef.current.emissive.copy(
        viewMode === "power" || viewMode === "unified"
          ? EMISSIVE_POWER
          : EMISSIVE_WHITE,
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
      {sheenScene && <primitive object={sheenScene} />}
    </>
  );
}

useGLTF.preload("/male-body.glb");
useGLTF.preload("/female-body.glb");

export default AnatomyModel;
