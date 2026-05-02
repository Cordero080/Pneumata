import { CATEGORY_COLORS } from "../../data/categories";
export { CATEGORY_COLORS };
import * as THREE from "three";

// 24 intervertebral disc levels, top → bottom.
export const SPINAL_LEVELS = [
  { level: "C2–C3", category: "logic", innervates: "Occiput & neck muscles" },
  { level: "C3–C4", category: "logic", innervates: "Neck, upper shoulder" },
  {
    level: "C4–C5",
    category: "thermal",
    innervates: "Diaphragm (phrenic nerve)",
  },
  { level: "C5–C6", category: "sensory", innervates: "Deltoid, biceps" },
  { level: "C6–C7", category: "sensory", innervates: "Wrist extensors, thumb" },
  { level: "C7–T1", category: "sensory", innervates: "Triceps, fingers" },
  {
    level: "T1–T2",
    category: "power",
    innervates: "Hand intrinsics, upper chest",
  },
  {
    level: "T2–T3",
    category: "power",
    innervates: "Cardiac accelerator nerve",
  },
  { level: "T3–T4", category: "power", innervates: "Heart & lungs" },
  { level: "T4–T5", category: "thermal", innervates: "Lungs & bronchi" },
  { level: "T5–T6", category: "digestive", innervates: "Esophagus & aorta" },
  { level: "T6–T7", category: "digestive", innervates: "Stomach" },
  { level: "T7–T8", category: "digestive", innervates: "Stomach & liver" },
  { level: "T8–T9", category: "digestive", innervates: "Liver & gallbladder" },
  { level: "T9–T10", category: "digestive", innervates: "Pancreas & spleen" },
  { level: "T10–T11", category: "renal", innervates: "Kidneys & adrenals" },
  { level: "T11–T12", category: "renal", innervates: "Kidneys & ureters" },
  { level: "T12–L1", category: "digestive", innervates: "Small intestine" },
  { level: "L1–L2", category: "digestive", innervates: "Large intestine" },
  { level: "L2–L3", category: "renal", innervates: "Appendix & bladder" },
  {
    level: "L3–L4",
    category: "renal",
    innervates: "Bladder & reproductive organs",
  },
  { level: "L4–L5", category: "immune", innervates: "Lower extremities" },
  { level: "L5–S1", category: "immune", innervates: "Bladder, rectum, feet" },
  { level: "S1–S2", category: "immune", innervates: "Bladder & pelvic floor" },
];

// Smooth z-values with a 3-point moving average to remove sampling noise
export function smoothPoints(pts, passes = 2) {
  let out = pts.map((p) => [...p]);
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 1; i < out.length - 1; i++) {
      out[i][2] = (out[i - 1][2] + out[i][2] + out[i + 1][2]) / 3;
      out[i][1] = (out[i - 1][1] + out[i][1] + out[i + 1][1]) / 3;
    }
  }
  return out;
}

// Build N-1 shortened segments between disc points, leaving a gap at each disc
export function buildSegments(pts, gapHalf = 0.007) {
  const segments = [];
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const dir = new THREE.Vector3();
  for (let i = 0; i < pts.length - 1; i++) {
    v1.set(...pts[i]);
    v2.set(...pts[i + 1]);
    dir.subVectors(v2, v1).normalize();
    segments.push([
      [v1.x + dir.x * gapHalf, v1.y + dir.y * gapHalf, v1.z + dir.z * gapHalf],
      [v2.x - dir.x * gapHalf, v2.y - dir.y * gapHalf, v2.z - dir.z * gapHalf],
    ]);
  }
  return segments;
}

// Disc marker visual styles — dark and light separated for independent tuning
export const DISC_STYLES = {
  dark: {
    baseOpacity: 0.5,
    emissive: 0.28,
    metalness: 0.82,
    roughness: 0.08,
    hoverOpacity: 1.0,
    activeOpacity: 0.9,
  },
  light: {
    baseOpacity: 0.32,
    emissive: 0.12,
    metalness: 0.75,
    roughness: 0.12,
    hoverOpacity: 0.9,
    activeOpacity: 0.75,
  },
};

// Format: [x, y, z] — x is always 0 (spine is centered)
// y = height (1.585 = top near skull base, 0.877 = bottom of lumbar)
// z = forward/back depth — less negative = closer to viewer/forward, more negative = further back
// Brain stem sits at z = -0.052 — top disc should be near this value to connect underneath it
export const MALE_SPINE_POINTS = [
  [0, 1.58, -0.035], // C2 — top disc, sits just below brain stem (z ≈ brain stem z)
  [0, 1.554, -0.01], // C3 — nudge z to curve neck
  [0, 1.523, -0.035], // C4 — cervical curve continues back
  [0, 1.493, -0.033], // C5
  [0, 1.462, -0.042], // C6
  [0, 1.431, -0.095], // C7 — base of neck, spine shifts further back
  [0, 1.4, -0.096], // T1
  [0, 1.369, -0.102], // T2
  [0, 1.338, -0.105], // T3 — thoracic kyphosis peak (most posterior)
  [0, 1.307, -0.104], // T4
  [0, 1.277, -0.1], // T5
  [0, 1.245, -0.091], // T6
  [0, 1.212, -0.079], // T7
  [0, 1.182, -0.068], // T8 — thoracic curve straightening
  [0, 1.152, -0.062], // T9
  [0, 1.122, -0.061], // T10
  [0, 1.09, -0.059], // T11
  [0, 1.06, -0.06], // T12
  [0, 1.03, -0.067], // L1 — lumbar curve begins
  [0, 1.001, -0.069], // L2
  [0, 0.967, -0.075], // L3
  [0, 0.938, -0.098], // L4
  [0, 0.907, -0.103], // L5 — lumbar lordosis base
  [0, 0.877, -0.1], // S1 — sacrum top
];
