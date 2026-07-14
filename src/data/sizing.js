// Every "how big / where" constant for the body GLB, the standalone brain
// mesh overlay, and organ node markers lives here — previously scattered
// across AnatomyModel.jsx, BrainModel.jsx, and OrganNode.jsx.

// Whole-body GLB — normalized height in world units (both male/female models
// scale to this via their own HEIGHT_SCALE in male-config.js/female-config.js).
export const BODY_TARGET_HEIGHT = 1.75;

// Standalone brain mesh overlay (src/components/brain/BrainModel.jsx)
export const BRAIN_MESH = {
  targetHeight: 0.17,
  femaleTargetHeight: 0.17 * 0.94,
  centerY: 1.66,
  femaleCenterY: 1.615,
  zOffset: -0.011,
};

// Organ node marker radii — glow halo / main faceted core / inner core / hit
// target — per size tier ("small"/"large"/"eye"/default), sectioned by
// breakpoint. "small"/"large" are brain-only tiers (see OrganNode.jsx) and
// "eye" pins the eyes to their original size — none of these three scale
// with the "default" tier. Only "main"/"inner"/"hit" grow on "default";
// "glow" is left untouched everywhere since it's the halo that gets
// multiplied again on hover (see OrganNode.jsx glowRef scale) — bumping its
// base radius here would compound into hover feeling more dramatic.
export const ORGAN_NODE_SIZES = {
  mobile: {
    small: { glow: 0.008, main: 0.011, inner: 0.005, hit: 0.0175 },
    default: { glow: 0.012, main: 0.0184, inner: 0.0081, hit: 0.0259 },
    large: { glow: 0.016, main: 0.021, inner: 0.009, hit: 0.03 },
    eye: { glow: 0.012, main: 0.016, inner: 0.007, hit: 0.0225 },
  },
  desktop: {
    small: { glow: 0.008, main: 0.011, inner: 0.005, hit: 0.007 },
    default: { glow: 0.012, main: 0.0184, inner: 0.0081, hit: 0.0104 },
    large: { glow: 0.016, main: 0.021, inner: 0.009, hit: 0.012 },
    eye: { glow: 0.012, main: 0.016, inner: 0.007, hit: 0.009 },
  },
  largeMonitor: {
    // Same as desktop today — placeholder tier so a future "nodes read too
    // small on a big display" tweak has a home without re-splitting files.
    small: { glow: 0.008, main: 0.011, inner: 0.005, hit: 0.007 },
    default: { glow: 0.012, main: 0.0184, inner: 0.0081, hit: 0.0104 },
    large: { glow: 0.016, main: 0.021, inner: 0.009, hit: 0.012 },
    eye: { glow: 0.012, main: 0.016, inner: 0.007, hit: 0.009 },
  },
};

export function getOrganNodeSizeTier() {
  if (window.innerWidth <= 768) return ORGAN_NODE_SIZES.mobile;
  if (window.innerWidth >= 1920) return ORGAN_NODE_SIZES.largeMonitor;
  return ORGAN_NODE_SIZES.desktop;
}
