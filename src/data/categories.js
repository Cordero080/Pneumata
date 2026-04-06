// Single source of truth for category colors and metadata.
// Imported by CategoryLegend, OrganNode, NerveRoots, and spine components.

export const CATEGORY_COLORS = {
  logic: "#ffd700",
  thermal: "#00f2ff",
  power: "#ff3131",
  digestive: "#39ff14",
  sensory: "#ff8c00",
  renal: "#b06bff",
  immune: "#00e5cc",
  spirit: "#ffffff",
};

export const CATEGORY_EMISSIVE = {
  logic: "#ffaa00",
  thermal: "#0088ff",
  power: "#880000",
  digestive: "#156600",
  sensory: "#cc6600",
  renal: "#7700cc",
  immune: "#007a6e",
  spirit: "#ffffff",
};

export const CATEGORIES = [
  { key: "spirit", label: "Spirit", desc: "Emergence & Consciousness" },
  { key: "logic", label: "Logic", desc: "Cognition & Control" },
  { key: "power", label: "Power", desc: "Energy & Regulation" },
  { key: "thermal", label: "Thermal", desc: "Exchange & Cooling" },
  { key: "digestive", label: "Digestive", desc: "Processing & Filtering" },
  { key: "sensory", label: "Sensory", desc: "I/O & Signal Transduction" },
  { key: "renal", label: "Renal", desc: "Filtration & Memory Mgmt" },
  { key: "immune", label: "Immune", desc: "Defense & Threat Response" },
];
