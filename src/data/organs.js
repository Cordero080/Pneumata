// Coordinate convention for this GLB (male-body.glb, normalized to 1.75 units tall):
//   y = 0    → feet,  y = 1.75 → top of head
//   z > 0   → FRONT of body (anterior — chest, face, abdomen)
//   z < 0   → BACK  of body (posterior — spine, back muscles)
//   x < 0   → body's RIGHT side (viewer's left in front view)
//   x > 0   → body's LEFT side  (viewer's right in front view)
//
// Categories & colors:
//   logic    → Gold   #ffd700 / #ffaa00
//   thermal  → Cyan   #00f2ff / #0088ff
//   power    → Red    #ff3131 / #880000
//   digestive→ Green  #39ff14 / #156600
//   spirit   → White  #ffffff / #ffffff  (hover triggers aura expansion)

export const organs = [
  // ── SPIRIT ─────────────────────────────────────────────────────────────────
  // Pneuma sits at the apex of the cranial vault — the emergent "field" above hardware.
  {
    id: "consciousness",
    category: "spirit",
    type: "point",
    organ: "Pneuma",
    hardware: "Integrated Information",
    position: [0, 1.72, 0.0],
    bio_function:
      "The emergent phenomenon of self-awareness arising from coordinated neural activity — biology become witness to itself.",
    hard_function:
      "The theoretical point at which information integration becomes so dense that a system models itself: the ghost in the machine.",
    synthesis:
      "The intersection of biology and logic. Neither organ nor algorithm — the pattern that observes the pattern.",
  },

  // ── LOGIC (GOLD) ───────────────────────────────────────────────────────────
  {
    id: "frontal_lobe",
    category: "logic",
    type: "point",
    organ: "Frontal Lobe",
    hardware: "RAM (Volatile Memory)",
    position: [0, 1.68, 0.06],
    bio_function:
      "Center for active working memory, impulse control, and holding thoughts in immediate consciousness.",
    hard_function:
      "The active workspace holding data currently being calculated. If power cuts, the workspace goes blank.",
    synthesis:
      "Consciousness and computation both require a volatile workspace; without power, the active thought vanishes.",
  },
  {
    id: "left_hemisphere",
    category: "logic",
    type: "point",
    organ: "Left Hemisphere",
    hardware: "CPU (Logic Processor)",
    position: [-0.05, 1.67, 0.02],
    bio_function:
      "Handles sequential reasoning, language processing, and linear, logical computation.",
    hard_function:
      "Executes sequential instructions and handles the core mathematical logic of the system.",
    synthesis: "The engine of linear thought and pure, calculated execution.",
  },
  {
    id: "right_hemisphere",
    category: "logic",
    type: "point",
    organ: "Right Hemisphere",
    hardware: "GPU (Parallel Processor)",
    position: [0.05, 1.67, 0.02],
    bio_function:
      "Handles pattern recognition, spatial processing, and parallel streams of sensory data.",
    hard_function:
      "Renders complex graphics by processing thousands of parallel data streams simultaneously.",
    synthesis:
      "The engine of abstract pattern recognition and simultaneous, multi-threaded perception.",
  },
  {
    id: "hippocampus",
    category: "logic",
    type: "point",
    organ: "Hippocampus",
    hardware: "Storage Drive (SSD/HDD)",
    position: [0, 1.64, -0.03],
    bio_function:
      "Encodes and retrieves long-term memory storage, indexing experiences for later recall.",
    hard_function:
      "Writes data to non-volatile storage blocks, ensuring information survives a power cycle.",
    synthesis:
      "Without a mechanism to permanently index the past, neither a machine nor a mind can learn.",
  },
  {
    id: "amygdala",
    category: "logic",
    type: "point",
    organ: "Amygdala",
    hardware: "Interrupt Handler",
    position: [0, 1.63, 0.01],
    bio_function:
      "Rapidly detects emotional and survival-critical threats, overriding deliberate cognition to trigger immediate responses.",
    hard_function:
      "Monitors the event queue for high-priority signals that preempt normal execution and demand immediate CPU attention.",
    synthesis:
      "Survival logic supersedes scheduled operation — in both systems, certain signals cannot wait in line.",
  },
  {
    id: "pituitary",
    category: "logic",
    type: "point",
    organ: "Pituitary Gland",
    hardware: "Control Chip (Southbridge)",
    position: [0, 1.62, 0.01],
    bio_function:
      "The master gland that secretes hormones to dictate the behavior of other glands, orchestrating systemic balance.",
    hard_function:
      "Manages data communication between the CPU and peripherals, orchestrating system states and power management.",
    synthesis:
      "Both serve as the master regulator—they do not think, but they dictate the state and rhythm of the entire system.",
  },

  // ── SPINE — logic line ─────────────────────────────────────────────────────
  // Posterior midline. z NEGATIVE. Curves: thoracic kyphosis, lumbar lordosis.
  {
    id: "spinal_cord",
    category: "logic",
    type: "line",
    organ: "Spinal Cord",
    hardware: "Motherboard Main Bus (PCIe)",
    points: [
      [0, 1.6, -0.05], // C7 — base of skull / brainstem exit
      [0, 1.45, -0.075], // T4 — upper thoracic
      [0, 1.28, -0.08], // T9 — mid thoracic (maximum kyphosis)
      [0, 1.08, -0.065], // L2 — upper lumbar
      [0, 0.92, -0.04], // L5/S1 — lumbosacral junction
    ],
    bio_function:
      "The central bundle of nerve fibers connecting the brain to the rest of the body.",
    hard_function:
      "The primary high-speed highway that transfers massive amounts of data between the CPU and peripherals.",
    synthesis:
      "The structural and communicative backbone; if severed, the brain cannot speak to the chassis.",
  },

  // ── POWER (RED) ────────────────────────────────────────────────────────────
  {
    id: "thyroid",
    category: "power",
    type: "point",
    organ: "Thyroid",
    hardware: "System Clock (BCLK)",
    position: [0, 1.53, 0.05],
    bio_function:
      "Secretes hormones that set the body's baseline metabolic rate — how fast every cell burns energy.",
    hard_function:
      "The base clock frequency that determines how fast every instruction executes across the entire system.",
    synthesis:
      "The metronome of existence: both systems run at the speed their clock dictates.",
  },
  {
    id: "heart",
    category: "power",
    type: "point",
    organ: "Heart",
    hardware: "Power Supply Unit (PSU)",
    position: [-0.04, 1.3, 0.06],
    bio_function:
      "The muscular pump delivering oxygen and nutrients required to keep cells alive.",
    hard_function:
      "Converts and regulates DC voltage. If it stops pumping current, the system dies.",
    synthesis:
      "Current is the blood of the machine. The PSU is the rhythmic pump of energy, the true source of systemic life.",
  },
  {
    id: "adrenals",
    category: "power",
    type: "point",
    organ: "Adrenal Glands",
    hardware: "Overclock Mechanism",
    position: [0, 1.12, -0.03],
    bio_function:
      "Release adrenaline and cortisol in response to stress, spiking heart rate and energy output far above baseline.",
    hard_function:
      "Temporarily pushes the CPU past its rated clock speed and voltage ceiling to handle peak load — at the cost of accelerated wear.",
    synthesis:
      "Both systems can exceed design limits under duress; the performance gain is always borrowed against longevity.",
  },

  // ── THERMAL (CYAN) ─────────────────────────────────────────────────────────
  {
    id: "left_lung",
    category: "thermal",
    type: "point",
    organ: "Left Lung",
    hardware: "Thermal Management (Heat Sink)",
    position: [-0.1, 1.22, 0.05],
    bio_function:
      "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    hard_function:
      "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    synthesis:
      "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive.",
  },
  {
    id: "right_lung",
    category: "thermal",
    type: "point",
    organ: "Right Lung",
    hardware: "Thermal Management (Heat Sink)",
    position: [0.1, 1.22, 0.05],
    bio_function:
      "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    hard_function:
      "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    synthesis:
      "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive.",
  },
  {
    id: "diaphragm",
    category: "thermal",
    type: "point",
    organ: "Diaphragm",
    hardware: "Fan Controller",
    position: [0, 1.13, 0.06],
    bio_function:
      "The dome-shaped muscle whose rhythmic contraction drives the breathing cycle, forcing air through the lungs.",
    hard_function:
      "Dynamically adjusts fan speed based on thermal sensor readings, maintaining optimal operating temperature.",
    synthesis:
      "Mechanical rhythm is the mechanism of survival — both systems would overheat and suffocate without it.",
  },

  // ── DIGESTIVE (GREEN) ──────────────────────────────────────────────────────
  {
    id: "liver",
    category: "digestive",
    type: "point",
    organ: "Liver",
    hardware: "Firewall / Data Filter",
    position: [-0.07, 1.13, 0.08],
    bio_function:
      "Detoxifies chemicals and filters the blood of harmful biological toxins.",
    hard_function:
      "Security system that filters incoming network traffic and neutralizes malicious code.",
    synthesis:
      "Life and logic both require a mechanism to sanitize input before it reaches the core processing systems.",
  },
  {
    id: "pancreas",
    category: "digestive",
    type: "point",
    organ: "Pancreas",
    hardware: "Voltage Regulator (VRM)",
    position: [-0.02, 1.06, 0.04],
    bio_function:
      "Secretes insulin and glucagon to maintain precise blood-sugar levels, preventing catastrophic metabolic swings.",
    hard_function:
      "Ensures clean, stable voltage is delivered to the CPU — preventing the crashes that come from supply fluctuation.",
    synthesis:
      "Precision regulation of the primary energy currency is non-negotiable in both systems.",
  },
  {
    id: "stomach",
    category: "digestive",
    type: "point",
    organ: "Stomach",
    hardware: "Parser / Compiler",
    position: [0.05, 1.08, 0.08],
    bio_function:
      "Uses acids to break down complex food into a liquid state the body can process.",
    hard_function:
      "Takes raw, human-readable input and compiles it into basic, executable machine code.",
    synthesis:
      "Raw input must be broken down before it can be processed; the stomach compiles the physical world.",
  },
  {
    id: "small_intestine",
    category: "digestive",
    type: "point",
    organ: "Small Intestine",
    hardware: "Data Bus / Processing Pipeline",
    position: [0, 1.05, 0.07],
    bio_function:
      "The long tract where digestion occurs, extracting useful nutrients and passing them into the bloodstream.",
    hard_function:
      "The internal pipeline where code is actively executed, and useful output data is extracted and routed.",
    synthesis:
      "This is the primary pipeline of extraction, where raw material is finally converted into systemic value.",
  },
  {
    id: "large_intestine",
    category: "digestive",
    type: "point",
    organ: "Large Intestine",
    hardware: "Garbage Collector",
    position: [0, 0.97, 0.06],
    bio_function:
      "Clears what is no longer needed by the body and prepares it for output.",
    hard_function:
      "An automated memory management feature that reclaims memory occupied by objects no longer in use.",
    synthesis:
      "A sustainable system must efficiently identify and purge the remnants of processed data.",
  },
];
