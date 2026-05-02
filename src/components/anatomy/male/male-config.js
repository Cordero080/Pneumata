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

// Scale multiplier applied to TARGET_HEIGHT before dividing by RAW.height
export const HEIGHT_SCALE = 1;

// Extra Y offset added after positioning (compensates for model-specific floor placement)
export const Y_OFFSET = 0;

// SPINE_OPTS = null → use the hardcoded MALE_SPINE_POINTS constant instead of sampling
export const SPINE_OPTS = null;
export { MALE_SPINE_POINTS };

// Female-only sheen layer is absent on the male model
export const HAS_SHEEN = false;

// Material colors used across all mesh modes and dark/light variants
export const COLORS = {
  obsColor: "#030306", // dark mode: base surface tint
  obsEmissive: "#880000", // dark mode: inner glow (crimson)
  ghostColor: "#eef2f6", // light mode: ghost shell tint
  ghostDark: "#1a1a2a", // light ghost mode 0: charcoal
  alColor: "#c8d5e0", // aluminum layer (light mode)
  alColorDark: "#c8d5e0", // aluminum layer (dark mode) — same for male
  whiteColor: "#f0f4ff", // white ghost mode 3 tint
  whiteAlColor: "#a8bcd4", // aluminum in white ghost mode (light)
  whiteAlColorDark: "#a8bcd4", // aluminum in white ghost mode (dark) — same for male
  whiteEmissiveLight: "#c8a060", // emissive in white ghost mode (light)
  whiteEmissiveDark: "#9966ff", // emissive in white ghost mode (dark)
};
