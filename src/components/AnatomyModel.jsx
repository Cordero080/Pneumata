import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
//
// Runs once after GLB load (post-scale, same as sampleSpinePoints).
// Each landmark filters world-space vertices by y-band, x-sign, and optional
// z / absX constraints, then averages the outermost or all matching vertices.
//
// xSign: -1 = left side of body (negative x), +1 = right side.
// outer: true  → keep top-25% by |x| (finds the skin surface edge)
//        false → average all matching vertices
//
// All y values are in post-scale world space (0 = feet, 1.75 = head).
// ---------------------------------------------------------------------------
const LANDMARK_DEFS = {
  // Upper limb
  shoulder_left: { yMin: 1.36, yMax: 1.52, xSign: -1, outer: true },
  shoulder_right: { yMin: 1.36, yMax: 1.52, xSign: 1, outer: true },
  axilla_left: { yMin: 1.26, yMax: 1.4, xSign: -1, outer: true },
  axilla_right: { yMin: 1.26, yMax: 1.4, xSign: 1, outer: true },
  elbow_left: { yMin: 0.95, yMax: 1.1, xSign: -1, outer: true },
  elbow_right: { yMin: 0.95, yMax: 1.1, xSign: 1, outer: true },
  wrist_left: { yMin: 0.65, yMax: 0.8, xSign: -1, outer: true },
  wrist_right: { yMin: 0.65, yMax: 0.8, xSign: 1, outer: true },
  // Lower limb — lateral
  // hip: arms hang at this y-level, so outer:true grabs arm verts; constrain absXMax + posterior z instead
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
  ankle_left: { yMin: 0.05, yMax: 0.16, xSign: -1, outer: true },
  ankle_right: { yMin: 0.05, yMax: 0.16, xSign: 1, outer: true },
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
  // Neck — anterior lateral cervical region (carotid/vagus territory).
  // outer:true at this height grabs ear/jaw verts; use absXMax to stay medial.
  neck_left: { yMin: 1.5, yMax: 1.62, xSign: -1, outer: false, absXMax: 0.06 },
  neck_right: { yMin: 1.5, yMax: 1.62, xSign: 1, outer: false, absXMax: 0.06 },
};

function sampleBodyLandmarks(scene, heightScale = 1) {
  scene.updateMatrixWorld(true);

  const tmp = new THREE.Vector3();
  const keys = Object.keys(LANDMARK_DEFS);

  // One bucket per landmark — collect matching world-space vertices
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
        // Scale y-bands by model height so female's shorter stature is covered
        if (y < d.yMin * heightScale || y > d.yMax * heightScale) continue;
        if (d.xSign === -1 && x >= 0) continue;
        if (d.xSign === 1 && x <= 0) continue;
        if (d.absXMax !== undefined && Math.abs(x) > d.absXMax) continue;
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
      // Sort descending by |x|, keep outermost 25%
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

// Pre-created to avoid per-frame allocation — lerped each frame in useFrame
const BREATH_BLUE = new THREE.Color("#334499"); // deoxygenated blood in transit
const BREATH_CYAN = new THREE.Color("#b0e8ff"); // oxygenated at peak

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
  const { scene } = useGLTF(modelPath);
  const materialRef = useRef(null);
  const bloodMatRef = useRef(null);
  const bloodPulseRef = useRef(0);
  const lastBeatCountRef = useRef(0);
  const [bloodScene, setBloodScene] = useState(null);
  const breathMatRef = useRef(null);
  const [breathScene, setBreathScene] = useState(null);
  const aluminumMatRef = useRef(null);
  const [aluminumScene, setAluminumScene] = useState(null);
  const [sheenScene, setSheenScene] = useState(null);

  useEffect(() => {
    // Reset any mutations from the GLTF cache before measuring
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = (femaleMode ? TARGET_HEIGHT * 0.88 : TARGET_HEIGHT) / size.y;

    scene.scale.setScalar(s);
    scene.position.set(
      -center.x * s,
      -box.min.y * s + (femaleMode ? 0.08 : 0),
      -center.z * s,
    );

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

    // Sample posterior-midline vertices to auto-trace the vertebral column.
    // Female model has a different posterior profile — nudge spine z forward
    // so it doesn't protrude outside her body contour.
    const spinePoints = sampleSpinePoints(
      scene,
      24,
      femaleMode
        ? {
            zNudge: 0.005,
            zNudgeTop: 0.025,
            yMin: 0.85,
            yMax: 1.55,
            zMax: -0.035,
          }
        : {},
    );
    if (spinePoints && onSpineExtracted) onSpineExtracted(spinePoints);

    // Sample anatomical landmarks for peripheral nerve routing.
    // Pass height scale so female's shorter y-ranges are correctly covered.
    const heightScale = femaleMode ? 0.88 : 1;
    const landmarks = sampleBodyLandmarks(scene, heightScale);
    if (onLandmarksExtracted) onLandmarksExtracted(landmarks);

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

  // Female mode — override aluminum and emissive to pink/magenta palette
  useEffect(() => {
    const mat = materialRef.current;
    const al = aluminumMatRef.current;
    if (!mat || !al) return;

    if (femaleMode) {
      if (darkMode) {
        // Dark female: visible rose surface — low metalness so color shows
        mat.color.set("#b1255d");
        mat.emissive.set("#ec0b7b");
        mat.emissiveIntensity = 0.45;
        mat.opacity = 0.94;
        mat.metalness = 0.68;
        mat.roughness = 0.38;
        mat.iridescence = 0.95;
        mat.iridescenceIOR = 1.35;
        mat.iridescenceThicknessRange = [120, 320];
        mat.clearcoat = 0.6;
        mat.clearcoatRoughness = 0.12;
        mat.needsUpdate = true;
        al.opacity = 0;
        al.depthWrite = false;
        al.needsUpdate = true;
      } else {
        // Light female: rose-gold aluminum layer
        al.color.set("#ef3e8e");
        al.metalness = 0.65;
        al.roughness = 0.22;
        al.opacity = 0.94;
        al.depthWrite = true;
        al.needsUpdate = true;
        mat.emissive.set("#cc0066");
        mat.emissiveIntensity = 0.08;
        mat.needsUpdate = true;
      }
    }
  }, [femaleMode, darkMode]);

  // Sheen layer — upper-body velvet/peach-fuzz, fades out at waist
  useEffect(() => {
    if (!femaleMode) {
      setSheenScene(null);
      return;
    }

    const sheenMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e14791"),
      metalness: 0.2,
      roughness: 0.35,
      sheen: 1.0,
      sheenColor: new THREE.Color("#88a8ff"),
      sheenRoughness: 0.18,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });

    // Patch shader: fade sheen out below the waist using world-space y
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

    // Emissive pulse — crimson flush in dark mode power, complements blood layer
    let base = 0;
    if (viewMode === "power") base = darkMode ? 0.55 : 0.4;
    else if (viewMode === "unified") base = darkMode ? 0.25 : 0.15;

    // In light mode, emissive must be crimson for the flush to read as red
    if (!darkMode) {
      materialRef.current.emissive.set(
        viewMode === "power" || viewMode === "unified" ? "#bd0404" : "#ffffff",
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
      {sheenScene && <primitive object={sheenScene} />}
    </>
  );
}

useGLTF.preload("/male-body.glb");
useGLTF.preload("/female-body.glb");

export default AnatomyModel;
