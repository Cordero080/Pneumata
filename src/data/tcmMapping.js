// TCM element and meridian mapping for each organ node.
// Elements follow the 5-Phase (Wu Xing) system.
// meridianId links to the meridians.js id field; null = governed by that element but no named channel.

export const TCM_ELEMENTS = {
  wood: { label: "Wood", color: "#4ade80" },
  fire: { label: "Fire", color: "#f87171" },
  earth: { label: "Earth", color: "#fbbf24" },
  metal: { label: "Metal", color: "#c0c8d8" },
  water: { label: "Water", color: "#60a5fa" },
  spirit: { label: "Spirit", color: "#c4b5fd" },
};

// element     — Wu Xing element
// meridianId  — id in meridians.js (null = no direct channel node)
// meridianName — human-readable channel name for display
export const ORGAN_TCM = {
  // ── SPIRIT ──────────────────────────────────────────────────────────────
  consciousness: {
    element: "spirit",
    meridianId: null,
    meridianName: "Shen — Spirit Field",
  },

  // ── BRAIN / LOGIC — TCM: Brain = Sea of Marrow, governed by Kidney ─────
  frontal_lobe: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Sea of Marrow)",
  },
  left_hemisphere: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Sea of Marrow)",
  },
  right_hemisphere: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Sea of Marrow)",
  },
  thalamus: {
    element: "fire",
    meridianId: null,
    meridianName: "Heart (Shen Gateway)",
  },
  hippocampus: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Memory Root)",
  },
  amygdala: {
    element: "fire",
    meridianId: null,
    meridianName: "Heart (Emotion Seat)",
  },
  hypothalamus: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney Yang (Regulation)",
  },
  pituitary: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney Essence (Jing)",
  },
  cerebellum: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Marrow)",
  },
  brain_stem: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Marrow Stem)",
  },
  spinal_cord: {
    element: "water",
    meridianId: "gv",
    meridianName: "Governing Vessel (Du Mai)",
  },

  // ── SENSORY ─────────────────────────────────────────────────────────────
  right_eye: {
    element: "wood",
    meridianId: null,
    meridianName: "Liver (Opens to Eyes)",
  },
  left_eye: {
    element: "wood",
    meridianId: null,
    meridianName: "Liver (Opens to Eyes)",
  },
  right_ear: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Opens to Ears)",
  },
  left_ear: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Opens to Ears)",
  },
  vocal_cords: {
    element: "metal",
    meridianId: null,
    meridianName: "Lung (Governs Voice)",
  },
  skin: {
    element: "metal",
    meridianId: null,
    meridianName: "Lung (Governs Skin)",
  },

  // ── POWER / THERMAL ─────────────────────────────────────────────────────
  thyroid: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney Yang (Metabolism)",
  },
  heart: {
    element: "fire",
    meridianId: "ht",
    meridianName: "Heart Meridian (Shao Yin)",
  },
  adrenals: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney Yang (Adrenal Root)",
  },
  left_lung: {
    element: "metal",
    meridianId: "lu",
    meridianName: "Lung Meridian (Tai Yin)",
  },
  right_lung: {
    element: "metal",
    meridianId: "lu",
    meridianName: "Lung Meridian (Tai Yin)",
  },
  diaphragm: {
    element: "metal",
    meridianId: null,
    meridianName: "Lung (Governs Breath)",
  },

  // ── DIGESTIVE ───────────────────────────────────────────────────────────
  esophagus: {
    element: "earth",
    meridianId: null,
    meridianName: "Stomach Channel",
  },
  stomach: {
    element: "earth",
    meridianId: "st",
    meridianName: "Stomach Meridian (Yang Ming)",
  },
  liver: {
    element: "wood",
    meridianId: "lv",
    meridianName: "Liver Meridian (Jue Yin)",
  },
  gallbladder: {
    element: "wood",
    meridianId: "gb",
    meridianName: "Gallbladder Meridian (Shao Yang)",
  },
  pancreas: {
    element: "earth",
    meridianId: "sp",
    meridianName: "Spleen Meridian (TCM Spleen)",
  },
  small_intestine: {
    element: "fire",
    meridianId: "si",
    meridianName: "Small Intestine Meridian (Tai Yang)",
  },
  large_intestine: {
    element: "metal",
    meridianId: "li",
    meridianName: "Large Intestine Meridian (Yang Ming)",
  },

  // ── RENAL ───────────────────────────────────────────────────────────────
  right_kidney: {
    element: "water",
    meridianId: "kd",
    meridianName: "Kidney Meridian (Shao Yin)",
  },
  left_kidney: {
    element: "water",
    meridianId: "kd",
    meridianName: "Kidney Meridian (Shao Yin)",
  },
  bladder: {
    element: "water",
    meridianId: "bl",
    meridianName: "Bladder Meridian (Tai Yang)",
  },

  // ── IMMUNE ──────────────────────────────────────────────────────────────
  spleen: {
    element: "earth",
    meridianId: "sp",
    meridianName: "Spleen Meridian (Tai Yin)",
  },
  lymph_cervical: {
    element: "metal",
    meridianId: null,
    meridianName: "Wei Qi (Defensive Qi)",
  },
  lymph_axillary: {
    element: "metal",
    meridianId: null,
    meridianName: "Wei Qi (Defensive Qi)",
  },
  lymph_inguinal: {
    element: "metal",
    meridianId: null,
    meridianName: "Wei Qi (Defensive Qi)",
  },
  bone_marrow: {
    element: "water",
    meridianId: null,
    meridianName: "Kidney (Governs Marrow)",
  },
};
