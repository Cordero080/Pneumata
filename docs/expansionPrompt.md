Role: Expert React / R3F Developer.
Objective: Phase 4 — Categorical Expansion and Visual Logic.
Context: We are moving from a single-color system to a color-coded categorical system. We are also adding "Consciousness" as a unique white node with a custom hover expansion.

Task 1: Update Node Visuals (OrganNode.jsx)

Add a category prop to the OrganNode component.

Map categories to the following colors:

logic (Gold): #ffd700 / Emissive: #ffaa00

thermal (Blue): #00f2ff / Emissive: #0088ff

power (Red): #ff3131 / Emissive: #880000

digestive (Green): #39ff14 / Emissive: #156600

spirit (White): #ffffff / Emissive: #ffffff

The Consciousness Effect: If category === 'spirit', on hover, use react-spring or useFrame to expand a secondary, semi-transparent white sphere (opacity: 0.1) from scale 1 to 5. This represents an "aura" or "field" expansion.

Task 2: Data Refresh (organs.js)
Replace the contents of src/data/organs.js with this expanded and anatomically corrected array. Ensure the Spinal Cord uses the "Thoracic Kyphosis" curve (Z-depth curvature).


export const organs = [
  // --- LOGIC (GOLD) ---
  { id: "frontal_lobe", category: "logic", type: "point", organ: "Frontal Lobe", hardware: "RAM", position: [0, 1.68, 0.06], bio_function: "Active working memory.", hard_function: "Volatile workspace for current calculations.", synthesis: "Consciousness requires a volatile workspace." },
  { id: "pituitary", category: "logic", type: "point", organ: "Pituitary Gland", hardware: "Control Chip", position: [0, 1.62, 0.01], bio_function: "Master regulator of hormones.", hard_function: "Orchestrates system states and power.", synthesis: "The master dictation of systemic rhythm." },
  { id: "left_cpu", category: "logic", type: "point", organ: "Left Hemisphere", hardware: "CPU", position: [-0.05, 1.67, 0.02], bio_function: "Sequential reasoning.", hard_function: "Linear logic execution.", synthesis: "The engine of calculated execution." },
  { id: "right_gpu", category: "logic", type: "point", organ: "Right Hemisphere", hardware: "GPU", position: [0.05, 1.67, 0.02], bio_function: "Pattern recognition.", hard_function: "Parallel stream processing.", synthesis: "The engine of simultaneous perception." },
  { id: "amygdala", category: "logic", type: "point", organ: "Amygdala", hardware: "Interrupt Handler", position: [0.03, 1.65, 0.02], bio_function: "Threat detection override.", hard_function: "Prioritizes urgent system events.", synthesis: "Survival logic overrides standard operation." },

  // --- THERMAL (BLUE) ---
  { id: "left_lung", category: "thermal", type: "point", organ: "Left Lung", hardware: "Heat Sink", position: [-0.10, 1.22, 0.05], bio_function: "Gas exchange for cooling.", hard_function: "Disperses heat into the air.", synthesis: "Both systems must breathe to survive." },
  { id: "right_lung", category: "thermal", type: "point", organ: "Right Lung", hardware: "Heat Sink", position: [0.10, 1.22, 0.05], bio_function: "Gas exchange for cooling.", hard_function: "Disperses heat into the air.", synthesis: "Both systems must breathe to survive." },
  { id: "diaphragm", category: "thermal", type: "point", organ: "Diaphragm", hardware: "Fan Controller", position: [0, 1.15, 0.06], bio_function: "Drives airflow rhythm.", hard_function: "Regulates fan speed based on heat.", synthesis: "Mechanical movement drives thermal stability." },

  // --- POWER (RED) ---
  { id: "heart", category: "power", type: "point", organ: "Heart", hardware: "PSU", position: [-0.04, 1.30, 0.06], bio_function: "Pumps nutrients/oxygen.", hard_function: "Regulates DC voltage.", synthesis: "Current is the blood of the machine." },
  { id: "thyroid", category: "power", type: "point", organ: "Thyroid", hardware: "System Clock (BCLK)", position: [0, 1.53, 0.05], bio_function: "Controls metabolic rate.", hard_function: "Determines baseline operating speed.", synthesis: "The metronome of existence." },
  { id: "adrenals", category: "power", type: "point", organ: "Adrenal Glands", hardware: "Overclock Mechanism", position: [-0.05, 1.12, -0.02], bio_function: "Emergency physiological boost.", hard_function: "Force CPU past certified limits.", synthesis: "High performance at the cost of rapid wear." },

  // --- DIGESTIVE (GREEN) ---
  { id: "liver", category: "digestive", type: "point", organ: "Liver", hardware: "Firewall", position: [-0.07, 1.13, 0.08], bio_function: "Filters toxins from blood.", hard_function: "Filters malicious code/traffic.", synthesis: "Integrity requires sanitized inputs." },
  { id: "pancreas", category: "digestive", type: "point", organ: "Pancreas", hardware: "Voltage Regulator", position: [-0.02, 1.06, 0.04], bio_function: "Stabilizes blood sugar levels.", hard_function: "Ensures precise, consistent voltage.", synthesis: "Stability prevents a systemic crash." },
  { id: "stomach", category: "digestive", type: "point", organ: "Stomach", hardware: "Compiler", position: [0.05, 1.08, 0.08], bio_function: "Breaks down complex food.", hard_function: "Compiles raw code for execution.", synthesis: "Raw input must be distilled into logic." },

  // --- SPIRIT (WHITE) ---
  { id: "consciousness", category: "spirit", type: "point", organ: "Pneuma", hardware: "Integrated Information", position: [0, 1.72, 0.00], bio_function: "Self-awareness and emergence.", hard_function: "The ghost in the machine.", synthesis: "The intersection of biology and logic." },

  // --- BUS (GOLD LINE) ---
  { id: "spinal_cord", category: "logic", type: "line", organ: "Spinal Cord", hardware: "Main Bus (PCIe)", points: [[0, 1.60, -0.05], [0, 1.45, -0.075], [0, 1.28, -0.08], [0, 1.08, -0.065], [0, 0.92, -0.04]], bio_function: "Central nerve bundle.", hard_function: "Primary high-speed highway.", synthesis: "The structural backbone of data." }
];

Task 3: Final Scene Audit
Ensure the Scene.jsx maps these categories correctly and the OrganNode component reflects the new emissive colors.

What this achieves:
Immediate Visual Clarity: The user will see a logic-heavy head (Gold), a power-stable core (Red), and a thermal-ready chest (Blue).

The "Wow" Factor: Hovering over the top of the head (the White node) will trigger that expanding translucent orb. This visually represents the Pneuma—the spirit expanding beyond the confines of the hardware.

Anatomical Perfection: Your coordinates are now locked to the male-body.glb map you provided, ensuring no more "stomach hearts."