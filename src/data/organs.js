// Coordinate convention for this GLB (male-body.glb, normalized to 1.75 units tall):
//   y = 0    → feet,  y = 1.75 → top of head
//   z > 0   → FRONT of body (anterior — chest, face, abdomen)
//   z < 0   → BACK  of body (posterior — spine, back muscles)
//   x < 0   → body's RIGHT side (viewer's left in front view)
//   x > 0   → body's LEFT side  (viewer's right in front view)

export const organs = [
  // ── HEAD / BRAIN ───────────────────────────────────────────────────────────
  // Brain sits inside the skull. Frontal lobe = anterior (z positive).
  // All brain nodes stay within y 1.60–1.70 to remain inside the cranium.
  {
    id: "frontal_lobe",
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
    id: "pituitary",
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
  {
    id: "left_hemisphere",
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

  // ── SPINE — type: line ─────────────────────────────────────────────────────
  // Posterior midline. z NEGATIVE to trace the back of the body.
  // Curves gently: thoracic kyphosis (convex posterior), lumbar lordosis (concave).
  {
    id: "spinal_cord",
    type: "line",
    organ: "Spinal Cord",
    hardware: "Motherboard Main Bus (PCIe)",
    points: [
      [0, 1.6, -0.05], // C7 — base of skull / brainstem exit
      [0, 1.45, -0.075], // T4  — upper thoracic
      [0, 1.28, -0.08], // T9  — mid thoracic (maximum kyphosis)
      [0, 1.08, -0.065], // L2  — upper lumbar
      [0, 0.92, -0.04], // L5/S1 — lumbosacral junction
    ],
    bio_function:
      "The central bundle of nerve fibers connecting the brain to the rest of the body.",
    hard_function:
      "The primary high-speed highway that transfers massive amounts of data between the CPU and peripherals.",
    synthesis:
      "The structural and communicative backbone; if severed, the brain cannot speak to the chassis.",
  },

  // ── CHEST ──────────────────────────────────────────────────────────────────
  // Heart: left of midline, behind the sternum — anterior (z positive).
  // Lungs: bilateral, fill the thoracic cavity — anterior.
  {
    id: "heart",
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
    id: "left_lung",
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

  // ── ABDOMEN ────────────────────────────────────────────────────────────────
  // All abdominal organs are anterior (z positive) and sit within the peritoneal cavity.
  // Liver: right hypochondriac region (body's right = x negative in front view).
  // Stomach: left of midline (body's left = x positive).
  // Small intestine: central abdomen.
  // Large intestine: lower/peripheral abdomen, representative central point.
  {
    id: "liver",
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
    id: "stomach",
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
