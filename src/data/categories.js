// Single source of truth for category colors and metadata.
// Imported by CategoryLegend, OrganNode, NerveRoots, and spine components.

export const CATEGORY_COLORS = {
  logic: "#ffd700",
  thermal: "#00f2ff", // STYLE: cyan node color — try #00ffff (pure) or #00e8ff (more saturated)
  power: "#ff3131",
  digestive: "#39ff14",
  sensory: "#ff8c00",
  renal: "#b06bff",
  immune: "#00e5cc",
  spirit: "#ffffff",
};

export const CATEGORY_EMISSIVE = {
  logic: "#ffaa00",
  thermal: "#0088ff", // STYLE: cyan emissive — try #00aaff or #00ccff for more punch
  power: "#880000",
  digestive: "#156600",
  sensory: "#cc6600",
  renal: "#7700cc",
  immune: "#007a6e",
  spirit: "#ffffff",
};

// Darkened variants for use on light surfaces (panels, labels).
// Neon colors like cyan, green, yellow are unreadable on light backgrounds.
export function darkenForLight(hex, factor = 0.62) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

// `about` — one plain-language line on what the system does.
// `hardware` — the computing analog it maps to.
// `examples` — representative organs in this category.
export const CATEGORIES = [
  {
    key: "spirit",
    label: "Consciousness",
    desc: "Witness & Operator",
    hardware: "The User",
    about:
      "The operator the hardware and software exist to serve — present, but not made of the system.",
    examples: ["Pneuma"],
  },
  {
    key: "logic",
    label: "Logic",
    desc: "Cognition & Control",
    hardware: "CPU / RAM",
    about:
      "Thinking, planning, and holding back impulses — where signals are processed and decisions made.",
    examples: ["Frontal Lobe", "Hemispheres", "Thalamus"],
  },
  {
    key: "power",
    label: "Power",
    desc: "Energy & Regulation",
    hardware: "PSU / Voltage Regulator",
    about: "Supplies and regulates the energy every other component runs on.",
    examples: ["Heart", "Adrenal Glands"],
  },
  {
    key: "thermal",
    label: "Thermal",
    desc: "Exchange & Cooling",
    hardware: "Heatsink / Fans",
    about:
      "Gas exchange and temperature control — takes in what's needed, expels what isn't.",
    examples: ["Lungs", "Diaphragm"],
  },
  {
    key: "digestive",
    label: "Digestive",
    desc: "Processing & Filtering",
    hardware: "I/O & Storage Bus",
    about:
      "Breaks input down, extracts what's usable, filters and routes the rest.",
    examples: ["Stomach", "Liver", "Intestines", "Spleen"],
  },
  {
    key: "sensory",
    label: "Sensory",
    desc: "I/O & Signal Transduction",
    hardware: "Cameras / Microphones",
    about:
      "Converts the outside world (light, sound) into signals the system can process.",
    examples: ["Eyes", "Ears"],
  },
  {
    key: "renal",
    label: "Renal",
    desc: "Filtration & Memory Mgmt",
    hardware: "Garbage Collector / VMM",
    about:
      "Filters waste from circulation and balances what's kept vs. flushed.",
    examples: ["Kidneys", "Bladder"],
  },
  {
    key: "immune",
    label: "Immune",
    desc: "Defense & Threat Response",
    hardware: "IDS / Firewall",
    about:
      "Detects threats, mounts a response, and updates its definitions of what's dangerous.",
    examples: ["Lymph Nodes", "Bone Marrow", "Spleen"],
  },
];
