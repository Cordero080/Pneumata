// One-time calibration/debug samplers, run once per GLB load to extract spine
// points, body landmarks, and extremity profiles for placing organ nodes,
// meridians, and nerve overlays. Pure functions — take a THREE.Scene (and,
// for the spine sampler, options), log their findings, and return data.
// Console output groups: "[SpineSampler]", "[LandmarkSampler]", "[ExtremitySampler]".
import * as THREE from "three";

// Skull bounds (sampled once from GLB, y > 1.55):
//   x: -0.096 → 0.096   y: 1.550 → 1.750   z: -0.126 → 0.098

export function sampleSpinePoints(scene, numBins = 24, opts = {}) {
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
export const LANDMARK_DEFS = {
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

// ---------------------------------------------------------------------------
// Full-body extremity sampler — bins all mesh vertices into 2cm y-slices.
// For each slice it reports the body width (xMax) and, for vertices beyond
// the torso half-width (x > 0.12), the arm/extremity centroid and outer edge.
// Call once after GLB load; read the "[ExtremitySampler]" console group.
// ---------------------------------------------------------------------------
export function sampleExtremities(scene) {
  scene.updateMatrixWorld(true);
  const tmp = new THREE.Vector3();

  const NUM_BANDS = 88; // ≈ 2 cm per band at 1.76 m total
  const Y_MIN = 0.0;
  const Y_MAX = 1.76;

  const bands = Array.from({ length: NUM_BANDS }, () => ({
    xMax: -Infinity,
    zMin: Infinity,
    zMax: -Infinity,
    n: 0,
    // vertices beyond torso half-width — arm / hand / finger surface
    ext: { sumX: 0, sumZ: 0, n: 0, xMax: -Infinity, yMin: Infinity },
  }));

  scene.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry?.attributes?.position;
    if (!pos) return;
    const mat = child.matrixWorld;
    const skinned =
      child.isSkinnedMesh && typeof child.boneTransform === "function";
    if (skinned && child.skeleton) child.skeleton.update();

    for (let i = 0; i < pos.count; i++) {
      if (skinned) {
        child.boneTransform(i, tmp);
        tmp.applyMatrix4(mat);
      } else {
        tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mat);
      }
      const { x, y, z } = tmp;
      if (y < Y_MIN || y > Y_MAX) continue;

      const bi = Math.min(
        Math.floor(((y - Y_MIN) / (Y_MAX - Y_MIN)) * NUM_BANDS),
        NUM_BANDS - 1,
      );
      const b = bands[bi];
      if (x > b.xMax) b.xMax = x;
      if (z < b.zMin) b.zMin = z;
      if (z > b.zMax) b.zMax = z;
      b.n++;

      // Right-side arm / extremity — beyond torso width
      if (x > 0.12) {
        b.ext.sumX += x;
        b.ext.sumZ += z;
        b.ext.n++;
        if (x > b.ext.xMax) b.ext.xMax = x;
        if (y < b.ext.yMin) b.ext.yMin = y;
      }
    }
  });

  console.group(
    "[ExtremitySampler] y-profile · arm_ctr = centroid of x>0.12 vertices",
  );
  for (let bi = NUM_BANDS - 1; bi >= 0; bi--) {
    const b = bands[bi];
    if (b.n < 3) continue;
    const yBot = (Y_MIN + (bi / NUM_BANDS) * (Y_MAX - Y_MIN)).toFixed(2);
    const yTop = (Y_MIN + ((bi + 1) / NUM_BANDS) * (Y_MAX - Y_MIN)).toFixed(2);
    const hasExt = b.ext.n > 4;
    const extStr = hasExt
      ? `  ▶ arm  x_ctr=${(b.ext.sumX / b.ext.n).toFixed(3)}` +
        `  z_ctr=${(b.ext.sumZ / b.ext.n).toFixed(3)}` +
        `  x_max=${b.ext.xMax.toFixed(3)}`
      : "";
    console.log(
      `y[${yBot}→${yTop}]` +
        `  xMax=${b.xMax.toFixed(3)}` +
        `  z[${b.zMin.toFixed(3)},${b.zMax.toFixed(3)}]` +
        extStr,
    );
  }
  console.groupEnd();
}

export function sampleBodyLandmarks(scene, heightScale = 1) {
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
