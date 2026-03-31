Role: Expert React, react-three-fiber (R3F), and Drei Engineer.

Objective: Refine the Pneumata: Analogical Anatomy application based on technical and anatomical audit. We must move beyond elementary point-based nodes and implement advanced interactive geometry that serves as a rigorous comparative learning tool.

Execution Context (The Audited Issues):

Heart Position: Correct anatomical error. The heart node (currently shown in the lower abdomen in image_8.png) must be moved to the superior mediastinum, center-left.

Lung Logic: "Lungs" cannot be a singular entity. It must be split into "Left Lung" and "Right Lung" nodes.

Lung Interaction (Fade-In Shape): Hovering a lung node must trigger a pulsating, semi-transparent 3D volume (a lung geometry) that slowly fades in and out (the rhythm of thermal management/breathing).

Spine Geometry: The spinal cord is the Main Bus. A single point is functionally and anatomically inaccurate. It must be rendered as a glowing, curved high-speed data line (motherboard trace) tracing the length of the spine.

Your Structured Engineering Tickets:

Ticket 1: Spinal Cord Data-Bus (Converting Point to Line)

Abolish the Node: In organs.js, change the Spinal Cord entry. Its type is no longer point; its type is line. Its position array must be replaced with a points array (a series of complex 3D coordinates tracing the actual curve of the skeleton from brainstem to coccyx).

Implementation: In Scene.jsx, create a conditional render. If an organ's type is line, render a <Line> component from @react-three/drei.

Styling: Style this line to look like a thick, pulsing PCIe data lane (Motherboard Backbone) running strictly down the vertebral column inside the glass chassis.

Ticket 2: Dual Lungs & Pulsating Geometry

Data Split: Update src/data/organs.js. Remove the entry for Lungs. Create new entries for Left Lung and Right Lung, giving them anatomically correct mirror coordinates in the superior thorax.

The Geometry: We need a 3D lung asset (a GLB/GLTF, like /lung.glb). If you cannot generate one programmatically, use @react-three/drei's <primitive> to load the geometry once.

The Interaction Logic:

Each lung node should still be a small golden electric node.

When either lung node is hovered (hovered === true), it must trigger the visible state of the corresponding 3D lung volume.

Use react-spring or a useFrame loop to create a slow (e.g., 5-second) sine-wave pulse on the transmission and opacity properties of the lung volume's material, making it breathe.

Ticket 3: The Data Update & Final Wiring

Coordinates: Apply the corrected anatomical coordinates provided in the JSON payload below to fix the positions (especially moving the Heart up and out of the abdomen).

App.jsx Wiring: Ensure the hover state from OrganNode.jsx is successfully communicating to the new Scene components to trigger the lung pulse.

[
  {
    "id": "pituitary",
    "type": "point",
    "organ": "Pituitary Gland",
    "hardware": "Control Chip (Southbridge)",
    "position": [0, 1.65, 0.05], 
    "bio_function": "The master gland that secretes hormones to dictate the behavior of other glands, orchestrating systemic balance.",
    "hard_function": "Manages data communication between the CPU and peripherals, orchestrating system states and power management.",
    "synthesis": "Both serve as the master regulator—they do not think, but they dictate the state and rhythm of the entire system."
  },
  {
    "id": "frontal_lobe",
    "type": "point",
    "organ": "Frontal Lobe",
    "hardware": "RAM (Volatile Memory)",
    "position": [0, 1.72, 0.1],
    "bio_function": "Center for active working memory, impulse control, and holding thoughts in immediate consciousness.",
    "hard_function": "The active workspace holding data currently being calculated. If power cuts, the workspace goes blank.",
    "synthesis": "Consciousness and computation both require a volatile workspace; without power, the active thought vanishes."
  },
  {
    "id": "left_hemisphere",
    "type": "point",
    "organ": "Left Hemisphere",
    "hardware": "CPU (Logic Processor)",
    "position": [-0.06, 1.7, 0],
    "bio_function": "Handles sequential reasoning, language processing, and linear, logical computation.",
    "hard_function": "Executes sequential instructions and handles the core mathematical logic of the system.",
    "synthesis": "The engine of linear thought and pure, calculated execution."
  },
  {
    "id": "right_hemisphere",
    "type": "point",
    "organ": "Right Hemisphere",
    "hardware": "GPU (Parallel Processor)",
    "position": [0.06, 1.7, 0],
    "bio_function": "Handles pattern recognition, spatial processing, and parallel streams of sensory data.",
    "hard_function": "Renders complex graphics by processing thousands of parallel data streams simultaneously.",
    "synthesis": "The engine of abstract pattern recognition and simultaneous, multi-threaded perception."
  },
  {
    "id": "hippocampus",
    "type": "point",
    "organ": "Hippocampus",
    "hardware": "Storage Drive (SSD/HDD)",
    "position": [0, 1.68, -0.05],
    "bio_function": "Encodes and retrieves long-term memory storage, indexing experiences for later recall.",
    "hard_function": "Writes data to non-volatile storage blocks, ensuring information survives a power cycle.",
    "synthesis": "Without a mechanism to permanently index the past, neither a machine nor a mind can learn."
  },
  {
    "id": "spinal_cord",
    "type": "line",
    "organ": "Spinal Cord",
    "hardware": "Motherboard Main Bus (PCIe)",
    "points": [[0, 1.6, -0.05], [0, 1.4, -0.08], [0, 1.2, -0.05], [0, 1.0, 0], [0, 0.85, 0.02]],
    "bio_function": "The central bundle of nerve fibers connecting the brain to the rest of the body.",
    "hard_function": "The primary high-speed highway that transfers massive amounts of data between the CPU and peripherals.",
    "synthesis": "The structural and communicative backbone; if severed, the brain cannot speak to the chassis."
  },
  {
    "id": "heart",
    "type": "point",
    "organ": "Heart",
    "hardware": "Power Supply Unit (PSU)",
    "position": [-0.06, 1.35, 0.08],
    "bio_function": "The muscular pump delivering oxygen and nutrients required to keep cells alive.",
    "hard_function": "Converts and regulates DC voltage. If it stops pumping current, the system dies.",
    "synthesis": "Current is the blood of the machine. The PSU is the rhythmic pump of energy, the true source of systemic life."
  },
  {
    "id": "left_lung",
    "type": "point",
    "organ": "Left Lung",
    "hardware": "Thermal Management (Heat Sink)",
    "position": [-0.12, 1.38, 0.05],
    "bio_function": "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    "hard_function": "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    "synthesis": "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive."
  },
  {
    "id": "right_lung",
    "type": "point",
    "organ": "Right Lung",
    "hardware": "Thermal Management (Heat Sink)",
    "position": [0.12, 1.38, 0.05],
    "bio_function": "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    "hard_function": "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    "synthesis": "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive."
  },
  {
    "id": "liver",
    "type": "point",
    "organ": "Liver",
    "hardware": "Firewall / Data Filter",
    "position": [-0.08, 1.15, 0.1],
    "bio_function": "Detoxifies chemicals and filters the blood of harmful biological toxins.",
    "hard_function": "Security system that filters incoming network traffic and neutralizes malicious code.",
    "synthesis": "Life and logic both require a mechanism to sanitize input before it reaches the core processing systems."
  },
  {
    "id": "stomach",
    "type": "point",
    "organ": "Stomach",
    "hardware": "Parser / Compiler",
    "position": [0.06, 1.1, 0.08],
    "bio_function": "Uses acids to break down complex food into a liquid state the body can process.",
    "hard_function": "Takes raw, human-readable input and compiles it into basic, executable machine code.",
    "synthesis": "Raw input must be broken down before it can be processed; the stomach compiles the physical world."
  },
  {
    "id": "small_intestine",
    "type": "point",
    "organ": "Small Intestine",
    "hardware": "Data Bus / Processing Pipeline",
    "position": [0, 0.95, 0.1],
    "bio_function": "The long tract where digestion occurs, extracting useful nutrients and passing them into the bloodstream.",
    "hard_function": "The internal pipeline where code is actively executed, and useful output data is extracted and routed.",
    "synthesis": "This is the primary pipeline of extraction, where raw material is finally converted into systemic value."
  },
  {
    "id": "large_intestine",
    "type": "point",
    "organ": "Large Intestine",
    "hardware": "Garbage Collector",
    "position": [0, 0.85, 0.1],
    "bio_function": "Clears what is no longer needed by the body and prepares it for output.",
    "hard_function": "An automated memory management feature that reclaims memory occupied by objects no longer in use.",
    "synthesis": "A sustainable system must efficiently identify and purge the remnants of processed data."
  }
]