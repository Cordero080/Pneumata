// Female body model configuration
// All GLB dimensions, material colors, and spine sampling options live here.

// Raw GLB bounding dimensions — measured once on a clean load.
export const RAW = {
  height: 14.2881,
  yMin: -7.1065,
  centerX: 0,
  centerZ: 0.17,
};

// Female figure is scaled to 88% of TARGET_HEIGHT to match real proportional difference
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

// Female model gets an extra sheen layer (velvet/peach-fuzz upper body)
export const HAS_SHEEN = true;

// Material colors — shifted to a pink/mauve palette vs the blue-steel male defaults
export const COLORS = {
  obsColor: "#060305", // dark mode: base surface tint (warm dark)
  obsEmissive: "#880044", // dark mode: inner glow (deep magenta)
  ghostColor: "#f0edf2", // light mode: ghost shell tint (warm white)
  ghostDark: "#1c1520", // light ghost mode 0: warm charcoal
  alColor: "#d0c8d8", // aluminum layer (light mode) — barely-pink silver
  alColorDark: "#c4bcd0", // aluminum layer (dark mode) — cooler mauve
  whiteColor: "#f4f0f8", // white ghost mode 3 tint
  whiteAlColor: "#bab0c0", // aluminum in white ghost mode (light)
  whiteAlColorDark: "#b8b0c4", // aluminum in white ghost mode (dark)
  whiteEmissiveLight: "#c06080", // emissive in white ghost mode (light)
  whiteEmissiveDark: "#cc4488", // emissive in white ghost mode (dark)
};
