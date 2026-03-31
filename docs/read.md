Role: You are an Expert Full-Stack Developer specializing in React, react-three-fiber (R3F), and interactive UI/UX design.

The Project:
I am building an interactive educational web app called "Pneumata: Analogical Anatomy." It is a study tool that maps human biological organs to computer hardware based strictly on functional isomorphism, not visual similarity.

Visual Aesthetic:

Dark mode, sleek, "neon soft cyber" / glassmorphism UI.

The center piece should be a 3D canvas (react-three-fiber).

Instead of a hyper-realistic human, I want a stylized 3D wireframe silhouette of a human torso/head, OR a vertical constellation of glowing geometric nodes (spheres/cubes) representing the organs.

Core Mechanics:

The 3D Canvas: The 3D model/nodes should slowly auto-rotate.

Interaction: The user can orbit the camera. When they hover over a node, it glows brighter and changes the cursor.

The Trigger: Clicking a node triggers a sleek, glassmorphism modal overlay (HTML/Tailwind floating over the canvas).

The UI Modal: The modal must display the dual-state architecture of the concept:

Title: [Organ Name] → [Hardware Equivalent] (e.g., Pituitary Gland → Control Chip)

Low-Temp Logic (The Rigor): A strict, side-by-side bulleted definition of what the biological organ does and what the hardware component does, proving they run the same functional logic.

High-Temp Synthesis (The Philosophy): A short, visually distinct sentence at the bottom explaining the deeper philosophical connection.

The Data Structure (Use this JSON array to populate the nodes):

[
  {
    "id": "pituitary",
    "organ": "Pituitary Gland",
    "hardware": "Control Chip (Southbridge)",
    "position": [0, 2.5, 0], 
    "bio_function": "The master gland that secretes hormones to dictate the behavior of other glands, orchestrating systemic balance.",
    "hard_function": "Manages data communication between the CPU and peripherals, orchestrating system states and power management.",
    "synthesis": "Both serve as the master regulator—they do not think, but they dictate the state and rhythm of the entire system."
  },
  {
    "id": "frontal_lobe",
    "organ": "Frontal Lobe",
    "hardware": "RAM (Volatile Memory)",
    "position": [0, 3.2, 0.5],
    "bio_function": "Center for active working memory, impulse control, and holding thoughts in immediate consciousness.",
    "hard_function": "The active workspace holding data currently being calculated. If power cuts, the workspace goes blank.",
    "synthesis": "Consciousness and computation both require a volatile workspace; without power, the active thought vanishes."
  },
  {
    "id": "liver",
    "organ": "Liver",
    "hardware": "Firewall / Data Filter",
    "position": [-0.5, 0.5, 0],
    "bio_function": "Detoxifies chemicals and filters the blood of harmful biological toxins.",
    "hard_function": "Security system that filters incoming network traffic and neutralizes malicious code.",
    "synthesis": "Life and logic both require a mechanism to sanitize input before it reaches the core processing systems."
  },
  {
    "id": "heart",
    "organ": "Heart",
    "hardware": "Power Supply Unit (PSU)",
    "position": [0, 1.2, 0],
    "bio_function": "The muscular pump delivering oxygen and nutrients required to keep cells alive.",
    "hard_function": "Converts and regulates DC voltage. If it stops pumping current, the system dies.",
    "synthesis": "Current is the blood of the machine. The PSU is the rhythmic pump of energy, the true source of systemic life."
  }
]
Your Task:

Scaffold a Vite + React application structure. Provide the exact npm install commands for Three.js, R3F, Drei, and Tailwind.

Write clean, modular code. Break the application down into logical components (e.g., App.jsx, Scene.jsx, OrganNode.jsx, GlassModal.jsx).

Utilize <Canvas> from @react-three/fiber and <Html> from @react-three/drei for the interactive UI.

Keep the 3D geometry simple for now (e.g., <sphereGeometry>) so I can focus on establishing the logic, state management, and UI flow before bringing in custom models.