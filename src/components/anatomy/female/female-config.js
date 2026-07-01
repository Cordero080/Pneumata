// Female body model configuration
// All GLB dimensions, material colors, and spine sampling options live here.

// Raw GLB bounding dimensions — measured once on a clean load.
export const RAW = {
  height: 14.2881,
  yMin: -7.1065,
  centerX: 0,
  centerZ: 0.17,
};

// Female figure is scaled to 88% of TARGET_HEIGHT to match real proportional difference.
// Further whole-scene shrinking is applied at the Scene wrapper (see FEMALE_SCALE) so
// mesh + organ nodes + meridians + spine all shrink together.
export const HEIGHT_SCALE = 0.88;

// Extra Y lift: female GLB floor sits slightly higher than the male baseline
export const Y_OFFSET = 0.08;

// Female spine is sampled dynamically (not hardcoded) with these vertex-filter opts
export const SPINE_OPTS = {
  zNudge: 0.005, // shift spine forward so it doesn't protrude through female back contour
  zNudgeTop: 0.025, // extra nudge in cervical region only
  yMin: 0.85,
  yMax: 1.55,
  zMax: -0.035, // tightest posterior z allowed (female lumbar is less pronounced)
};

// No sheen layer — kept identical to the male model for visual consistency.
export const HAS_SHEEN = false;

// Material colors — identical to male-config.js so both bodies render the same.
export const COLORS = {
  obsColor: "#080817",
  obsEmissive: "#880000",
  ghostColor: "#afc1d4",
  ghostDark: "#1a1a2a",
  alColor: "#bdd1e2",
  alColorDark: "#7890aa",
  whiteColor: "#e2e2f0",
  whiteAlColor: "#a8bcd4",
  whiteAlColorDark: "#7a9ac2",
  whiteEmissiveLight: "#f9bc07",
  whiteEmissiveDark: "#9966ff",
  onyxColor: "#030306fa",
  onyxColorDark: "#030306fa",
  onyxEmissive: "#220055",
};
