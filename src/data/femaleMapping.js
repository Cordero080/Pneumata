// ---------------------------------------------------------------------------
// Landmark-anchored female organ positioning
//
// Instead of a flat Y offset, we use anatomical landmarks sampled from both
// the male and female GLB meshes as vertical anchor points. Each organ's Y
// position is interpolated between the two nearest anchors — so the torso
// can compress more than the head, the pelvis can widen, etc.
//
// Anchors are built from averaged left/right landmark pairs so lateral
// asymmetry cancels out.
// ---------------------------------------------------------------------------

// The vertical anchor names we use, ordered bottom → top.
// Each pair of landmarks is averaged to get a single Y value.
const ANCHOR_PAIRS = [
  { name: "ankle", left: "ankle_left", right: "ankle_right" },
  { name: "knee", left: "knee_left", right: "knee_right" },
  { name: "groin", left: "groin_left", right: "groin_right" },
  { name: "hip", left: "hip_left", right: "hip_right" },
  { name: "elbow", left: "elbow_left", right: "elbow_right" },
  { name: "axilla", left: "axilla_left", right: "axilla_right" },
  { name: "shoulder", left: "shoulder_left", right: "shoulder_right" },
  { name: "neck", left: "neck_left", right: "neck_right" },
];

// Synthetic skull-top anchor offsets (above neck, below ceiling)
const SKULL_TOP_OFFSET = 0.18;

// Hardcoded floor and ceiling — feet and top of head
const FLOOR_Y = 0;
const MALE_CEILING_Y = 1.75;

/**
 * Build sorted anchor array from landmark dict.
 * Returns [{ name, y }] sorted ascending by y.
 */
function buildAnchors(landmarks, floor, ceiling) {
  const anchors = [{ name: "_floor", y: floor }];

  for (const { name, left, right } of ANCHOR_PAIRS) {
    const l = landmarks[left];
    const r = landmarks[right];
    if (!l && !r) continue;
    const y = l && r ? (l[1] + r[1]) / 2 : (l || r)[1];
    anchors.push({ name, y });
  }

  // Add synthetic skull_top anchor above neck
  const neckAnchor = anchors.find((a) => a.name === "neck");
  if (neckAnchor) {
    anchors.push({ name: "skull_top", y: neckAnchor.y + SKULL_TOP_OFFSET });
  }

  anchors.push({ name: "_ceiling", y: ceiling });
  anchors.sort((a, b) => a.y - b.y);
  return anchors;
}

/**
 * Map a male Y coordinate to the female Y coordinate using piecewise
 * linear interpolation between landmark anchors.
 *
 * @param {number} maleY - Y position calibrated to the male body
 * @param {Array} maleAnchors - sorted [{ name, y }] from male landmarks
 * @param {Array} femaleAnchors - sorted [{ name, y }] from female landmarks
 * @returns {number} interpolated female Y
 */
function interpY(maleY, maleAnchors, femaleAnchors) {
  // Clamp to anchor range
  if (maleY <= maleAnchors[0].y) return femaleAnchors[0].y;
  if (maleY >= maleAnchors[maleAnchors.length - 1].y)
    return femaleAnchors[femaleAnchors.length - 1].y;

  // Find the bracketing segment
  for (let i = 0; i < maleAnchors.length - 1; i++) {
    const lo = maleAnchors[i].y;
    const hi = maleAnchors[i + 1].y;
    if (maleY >= lo && maleY <= hi) {
      const t = hi === lo ? 0 : (maleY - lo) / (hi - lo);
      return (
        femaleAnchors[i].y + t * (femaleAnchors[i + 1].y - femaleAnchors[i].y)
      );
    }
  }

  // Fallback — shouldn't reach here
  return maleY;
}

/**
 * Map a male organ position [x, y, z] to a female position using
 * landmark-anchored interpolation.
 *
 * Y: piecewise linear interpolation between anchor pairs.
 * X: scaled proportionally to body width change at that vertical level.
 * Z: scaled proportionally (female body depth is ~88% of male).
 *
 * @param {number[]} malePos - [x, y, z] male organ position
 * @param {Object} maleLandmarks - { name: [x, y, z] } from male GLB
 * @param {Object} femaleLandmarks - { name: [x, y, z] } from female GLB
 * @returns {number[]} [x, y, z] female organ position
 */
export function mapMaleToFemale(malePos, maleLandmarks, femaleLandmarks) {
  // When maleLandmarks are missing (single-model load), fall back to simple
  // proportional scaling — 0.88 height, 0.08 Y base offset.
  if (!maleLandmarks || !femaleLandmarks) {
    const [x, y, z] = malePos;
    return [x, y * 0.88 + 0.08, z * 0.95];
  }

  // Determine female ceiling from the highest available landmark + proportional headroom
  const maleAnchors = buildAnchors(maleLandmarks, FLOOR_Y, MALE_CEILING_Y);

  // Estimate female ceiling: use neck-to-ceiling ratio from male, apply to female neck
  const maleNeck = maleAnchors.find((a) => a.name === "neck");
  const femaleNeckLm =
    femaleLandmarks.neck_left && femaleLandmarks.neck_right
      ? (femaleLandmarks.neck_left[1] + femaleLandmarks.neck_right[1]) / 2
      : null;
  // Above the neck, the skull scales less — use ~95% of male head height
  const maleHeadHeight = maleNeck ? MALE_CEILING_Y - maleNeck.y : 0.19;
  const femaleCeiling = femaleNeckLm
    ? femaleNeckLm + maleHeadHeight * 0.95
    : MALE_CEILING_Y * 0.88 + 0.08;

  const femaleAnchors = buildAnchors(femaleLandmarks, FLOOR_Y, femaleCeiling);

  // Ensure both anchor arrays have matching segments by name
  // (if a landmark is missing from one set, skip it in both)
  const maleNames = new Set(maleAnchors.map((a) => a.name));
  const femaleNames = new Set(femaleAnchors.map((a) => a.name));
  const commonNames = [...maleNames].filter((n) => femaleNames.has(n));
  const mFiltered = maleAnchors.filter((a) => commonNames.includes(a.name));
  const fFiltered = femaleAnchors.filter((a) => commonNames.includes(a.name));

  const [mx, my, mz] = malePos;

  // Y — piecewise landmark interpolation
  const fy = interpY(my, mFiltered, fFiltered);

  // X — scale proportionally to body width at this level.
  // Find nearest lateral landmarks to estimate width ratio.
  let xScale = 1;
  const widthPairs = [
    ["shoulder_left", "shoulder_right"],
    ["hip_left", "hip_right"],
    ["axilla_left", "axilla_right"],
  ];
  // Find the pair whose average y is closest to the organ's maleY
  let bestDist = Infinity;
  for (const [lName, rName] of widthPairs) {
    const ml = maleLandmarks[lName];
    const mr = maleLandmarks[rName];
    const fl = femaleLandmarks[lName];
    const fr = femaleLandmarks[rName];
    if (!ml || !mr || !fl || !fr) continue;
    const pairY = (ml[1] + mr[1]) / 2;
    const dist = Math.abs(pairY - my);
    if (dist < bestDist) {
      bestDist = dist;
      const maleWidth = Math.abs(ml[0] - mr[0]);
      const femaleWidth = Math.abs(fl[0] - fr[0]);
      xScale = maleWidth > 0.01 ? femaleWidth / maleWidth : 1;
    }
  }
  const fx = mx * xScale;

  // Z — proportional depth scaling (female torso is shallower)
  // Use a conservative 0.95 ratio — most depth differences are subtle
  const fz = mz * 0.95;

  return [fx, fy, fz];
}

/**
 * Pre-compute female positions for all organs at once.
 * Returns a Map<organId, [x, y, z]>.
 */
export function buildFemalePositions(organs, maleLandmarks, femaleLandmarks) {
  const map = new Map();
  for (const organ of organs) {
    if (organ.type === "line") continue; // spinal cord handled separately

    // Use explicit override if the organ defines one, otherwise interpolate
    const femalePos = organ.femalePosition
      ? organ.femalePosition
      : mapMaleToFemale(organ.position, maleLandmarks, femaleLandmarks);
    map.set(organ.id, femalePos);

    // Also map brain positions if they exist
    if (organ.brainPosition) {
      const femaleBrain = organ.femaleBrainPosition
        ? organ.femaleBrainPosition
        : mapMaleToFemale(organ.brainPosition, maleLandmarks, femaleLandmarks);
      map.set(organ.id + ":brain", femaleBrain);
    }
  }
  return map;
}
