// Male body model configuration
// All GLB dimensions, material colors, and spine data for the male model live here.

import { MALE_SPINE_POINTS } from "../../spine/spineData";

// Raw GLB bounding dimensions — measured once on a clean load.
// Never re-derive at runtime; GLB cache corrupts bounding box after model toggling.
export const RAW = {
  height: 15.8869,
  yMin: -8.0072,
  centerX: 0,
  centerZ: 0.17,
};

// Scale multiplier applied to TARGET_HEIGHT before dividing by RAW.height (mesh only)
export const HEIGHT_SCALE = 1;

// Extra Y offset added after positioning (compensates for model-specific floor placement)
export const Y_OFFSET = 0;

// FIGURE_SCALE — overall display size of the entire male assembly (mesh + nodes
// + organs + meridians), applied by Scene.jsx to the parent group so they scale
// together. Male is the reference figure, so 1.0. FIGURE_Y_LIFT re-centers
// vertically after scaling.
export const FIGURE_SCALE = 1.0;
export const FIGURE_Y_LIFT = 0.0;

// SPINE_OPTS = null → use the hardcoded MALE_SPINE_POINTS constant instead of sampling
export const SPINE_OPTS = null;
export { MALE_SPINE_POINTS };

// Female-only sheen layer is absent on the male model
export const HAS_SHEEN = false;

// Material colors used across all mesh modes and dark/light variants
export const COLORS = {
  obsColor: "#080817", // dark mode: base surface tint (violet-black)
  obsEmissive: "#880000", // dark mode: inner glow (crimson)
  ghostColor: "#afc1d4", // light mode: ghost shell tint
  ghostDark: "#1a1a2a", // light ghost mode 0: charcoal
  alColor: "#bdd1e2", // aluminum layer (light mode)
  alColorDark: "#7890aa", // aluminum layer (dark mode) — dark steel-blue
  whiteColor: "#e2e2f0", // white ghost mode 3 tint
  whiteAlColor: "#a8bcd4", // aluminum in white ghost mode (light)
  whiteAlColorDark: "#7a9ac2", // aluminum in white ghost mode (dark) — same for male
  whiteEmissiveLight: "#f9bc07", // emissive in white ghost mode (light)
  whiteEmissiveDark: "#9966ff", // emissive in white ghost mode (dark)
  onyxColor: "#030306fa", // onyx skin: light mode
  onyxColorDark: "#030306fa", // onyx skin: dark mode
  onyxEmissive: "#220055", // onyx skin: emissive glow (dark violet)
};
