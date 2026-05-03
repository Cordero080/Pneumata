// Coordinate convention for this GLB (male-body.glb, normalized to 1.75 units tall):
//   y = 0    → feet,  y = 1.75 → top of head
//   z > 0   → FRONT of body (anterior — chest, face, abdomen)
//   z < 0   → BACK  of body (posterior — spine, back muscles)
//   x < 0   → body's RIGHT side (viewer's left in front view)
//   x > 0   → body's LEFT side  (viewer's right in front view)
//
// Categories & colors:
//   logic    → Gold    #ffd700 / #ffaa00
//   thermal  → Cyan    #00f2ff / #0088ff
//   power    → Red     #ff3131 / #880000
//   digestive→ Green   #39ff14 / #156600
//   spirit   → White   #ffffff / #ffffff  (hover triggers aura expansion)
//   sensory  → Amber   #ff8c00 / #cc6600
//   renal    → Violet  #b06bff / #7700cc
//   immune   → Teal    #00e5cc / #007a6e

export const organs = [
  // ── SPIRIT ─────────────────────────────────────────────────────────────────
  {
    id: "consciousness",
    category: "spirit",
    type: "point",
    organ: "Pneuma",
    hardware: "Integrated Information Field",
    position: [0, 1.746, 0.0],
    femalePosition: [0, 1.737, 0.0],
    brainPosition: [0, 1.746, 0.0],
    femaleBrainPosition: [0, 1.737, 0.0],
    bio_function:
      "The emergent phenomenon of self-awareness arising from coordinated neural activity — the point at which biology becomes witness to itself. Not located in any single region. Arises from integration across all of them.",
    hard_function:
      "A theoretical threshold at which information processing becomes so densely interconnected that the system begins modeling itself. No single chip produces it. It emerges from the architecture as a whole.",
    synthesis:
      "Both are properties of complexity, not components. You cannot point to the transistor that holds consciousness, just as you cannot point to the neuron that holds the self. The pattern observes the pattern.",
    spinalConnection:
      "Above all spinal channels — consciousness emerges from the integration of signals across every level of the bus simultaneously, not from any single routing assignment.",
  },

  // ── LOGIC (GOLD) ───────────────────────────────────────────────────────────
  {
    id: "frontal_lobe",
    category: "logic",
    type: "point",
    organ: "Frontal Lobe",
    hardware: "RAM (Volatile Memory)",
    position: [0, 1.68, 0.08],
    femalePosition: [0, 1.619, 0.08],
    brainPosition: [0, 1.71, 0.06],
    femaleBrainPosition: [0, 1.646, 0.06],
    bio_function:
      "The prefrontal cortex governs active working memory, impulse control, planning, and deliberate reasoning. It holds the current thought in place long enough to act on it. Damage here doesn't erase the past — it destroys the ability to hold the present.",
    hard_function:
      "Random Access Memory — the volatile workspace where the CPU holds everything it is actively computing. Fast, limited, and completely cleared when power cuts. Nothing stored here survives a reboot.",
    synthesis:
      "Both are temporary high-speed workspaces. Neither stores anything permanently. Both are the first thing lost when the system goes down.",
    spinalConnection:
      "Cranial — direct CPU connection via cortical white matter, bypassing the spinal bus entirely. The hardware equivalent is an on-die cache lane: highest bandwidth, zero routing latency.",
  },
  {
    id: "left_hemisphere",
    category: "logic",
    type: "point",
    nodeSize: "large", // STYLE: dominant brain mass — larger node
    organ: "Left Hemisphere",
    hardware: "CPU (Logic Processor)",
    position: [-0.05, 1.67, 0.02],
    femalePosition: [-0.05, 1.61, 0.02],
    brainPosition: [-0.078, 1.675, 0.0],
    femaleBrainPosition: [-0.078, 1.615, 0.0],
    bio_function:
      "Specializes in sequential processing — language, grammar, logic, analysis. It breaks complex problems into ordered steps and executes them in series. It is the hemisphere that narrates.",
    hard_function:
      "The Central Processing Unit — executes sequential instructions, handles mathematical logic, and processes language and symbolic reasoning one step at a time. The fastest path through a linear problem.",
    synthesis:
      "Both are engines of linear, structured thought. Both excel at following rules, parsing syntax, and moving through a problem one step at a time.",
    spinalConnection:
      "Cranial — the left processor core operates above the vertebral backbone, communicating via cortical commissures rather than spinal channel assignments.",
  },
  {
    id: "right_hemisphere",
    category: "logic",
    type: "point",
    nodeSize: "large", // STYLE: dominant brain mass — larger node
    organ: "Right Hemisphere",
    hardware: "GPU (Parallel Processor)",
    position: [0.05, 1.67, 0.02],
    femalePosition: [0.05, 1.61, 0.02],
    brainPosition: [0.078, 1.675, 0.0],
    femaleBrainPosition: [0.078, 1.615, 0.0],
    bio_function:
      "Handles spatial reasoning, pattern recognition, emotional tone, and holistic perception. It processes the entire scene rather than its parts, recognizes faces, interprets music, and holds the big picture.",
    hard_function:
      "The Graphics Processing Unit — processes thousands of parallel data streams simultaneously. Built not for sequential logic but for pattern recognition, rendering, and spatial computation across massive arrays of data at once.",
    synthesis:
      "Both trade sequential precision for parallel throughput. Both see the whole image before the individual pixel.",
    spinalConnection:
      "Cranial — the parallel processing core operates above the spinal bus, passing data laterally via the corpus callosum before any signal descends the backbone.",
  },
  {
    id: "thalamus",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Thalamus",
    hardware: "Interrupt Controller",
    position: [-0.02, 1.645, -0.01],
    femalePosition: [-0.02, 1.588, -0.01],
    brainPosition: [0, 1.642, -0.02],
    femaleBrainPosition: [0, 1.586, -0.02],
    bio_function:
      "Nearly all sensory input — vision, touch, hearing, pain — passes through the thalamus before reaching the cortex. It acts as the central relay station, filtering and routing signals to the correct brain region. Consciousness depends on it remaining online.",
    hard_function:
      "The interrupt controller receives signals from every connected hardware device and routes them to the correct processor with assigned priority. Nothing reaches the CPU without passing through it first. It does not compute — it directs.",
    synthesis:
      "Both are mandatory routing layers. Neither generates meaning — both determine what gets through, in what order, to what destination.",
    spinalConnection:
      "Cranial — the interrupt controller sits at the CPU level, routing signals between cortical layers without descending to any spinal channel. It receives ascending bus traffic but does not originate from it.",
  },
  {
    id: "hippocampus",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Hippocampus",
    hardware: "Storage Drive (SSD/HDD)",
    position: [0, 1.63, -0.04],
    femalePosition: [0, 1.575, -0.04],
    brainPosition: [0.055, 1.618, -0.055],
    femaleBrainPosition: [0.055, 1.564, -0.055],
    bio_function:
      "Encodes short-term experience into long-term memory, consolidates it during sleep, and retrieves it on demand. Without it, every day begins with no record of the last. Damage produces a permanent present tense.",
    hard_function:
      "Solid-state storage — non-volatile memory that persists after power loss. Writes experience to permanent blocks, indexes it for retrieval, and holds the archive the system draws on when processing new information against old patterns.",
    synthesis:
      "Both convert active, temporary experience into indexed, persistent storage. Both are the reason the system can learn rather than just react.",
    spinalConnection:
      "Cranial — long-term storage is indexed above the vertebral backbone, accessed via the fornix pathway rather than any spinal channel assignment.",
  },
  {
    id: "amygdala",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Amygdala",
    hardware: "Interrupt Handler",
    position: [0, 1.63, 0.03],
    femalePosition: [0, 1.575, 0.03],
    brainPosition: [0.055, 1.633, 0.02],
    femaleBrainPosition: [0.055, 1.578, 0.02],
    bio_function:
      "Detects emotional and survival-critical stimuli — threat, fear, aggression — and fires before conscious processing completes. It bypasses deliberation and triggers immediate physical response. It is faster than thought by design.",
    hard_function:
      "The interrupt handler monitors the event queue for signals flagged as critical — threats that cannot wait in line for scheduled processing. When triggered, it preempts normal execution and forces immediate CPU attention regardless of what was running.",
    synthesis:
      "Both exist because some inputs cannot be queued. Both override the normal processing hierarchy when the cost of delay is too high.",
    spinalConnection:
      "Cranial — the interrupt handler fires above the spinal bus, but its emergency preemption signal descends the entire backbone simultaneously via the autonomic pathways.",
  },
  {
    id: "hypothalamus",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Hypothalamus",
    hardware: "Thermal & Power State Manager",
    position: [0, 1.626, 0.02],
    femalePosition: [0, 1.571, 0.02],
    brainPosition: [0, 1.624, 0.01],
    femaleBrainPosition: [0, 1.57, 0.01],
    bio_function:
      "Regulates body temperature, hunger, thirst, circadian rhythm, and hormonal balance. It continuously samples the body's internal state and adjusts output to maintain homeostasis. It never stops running.",
    hard_function:
      "The thermal and power management subsystem monitors CPU temperature, adjusts fan speed, throttles clock speed, and manages sleep states. It keeps the system within safe operating parameters at all times without user intervention.",
    synthesis:
      "Both manage the unglamorous infrastructure that makes everything else possible. Both are invisible until they fail — at which point the entire system destabilizes.",
    spinalConnection:
      "Cranial in origin, but writes to the full vertebral backbone via the autonomic nervous system — the embedded controller that broadcasts state management signals to every spinal channel simultaneously.",
  },
  {
    id: "pituitary",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    nodeColor: "#c87820", // STYLE: deep amber-gold — master transducer between neural & hormonal worlds
    organ: "Pituitary Gland",
    hardware: "Control Chip (Master Regulator)",
    position: [0, 1.62, 0.01],
    femalePosition: [0, 1.566, 0.01],
    brainPosition: [0, 1.609, 0.022],
    femaleBrainPosition: [0, 1.556, 0.022],
    bio_function:
      "The master gland that releases hormones controlling growth, metabolism, reproduction, stress response, and the activity of every other endocrine gland. It is the conductor of the hormonal orchestra — the signal that tells every instrument when to play.",
    hard_function:
      "The master control chip that orchestrates system-wide signaling — broadcasting commands that regulate the behavior of every downstream subsystem simultaneously. It does not execute tasks directly; it issues the instructions that govern everything that does.",
    synthesis:
      "Both sit at the apex of a command hierarchy. Neither does the work directly. Both ensure the work gets done by everything below them.",
    spinalConnection:
      "Cranial — the master regulator broadcasts hormonal signals that modulate downstream channel behavior system-wide, without routing through any single spinal segment.",
  },
  {
    id: "cerebellum",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Cerebellum",
    hardware: "Clock Crystal",
    position: [0, 1.605, -0.07],
    femalePosition: [0, 1.548, -0.06],
    brainPosition: [0, 1.608, -0.07],
    femaleBrainPosition: [0, 1.551, -0.06],
    bio_function:
      "Coordinates movement, balance, and timing — not initiating actions but ensuring they are executed with precision and rhythm. It fine-tunes the signal after the cortex sends it. Damage produces not paralysis but ataxia — movement that exists but cannot be controlled.",
    hard_function:
      "The clock crystal generates the master timing signal — a precise, stable oscillation that every other component synchronizes to. Without it, operations lose coordination. Chips fire out of sequence. The system falls apart not from lack of power but from loss of rhythm.",
    synthesis:
      "Both are the reason the system moves gracefully rather than just moving. Both are invisible when working and devastating when not.",
    spinalConnection:
      "Cranial — the clock crystal sits at the posterior base of the brain, synchronizing signals across the entire cortex before they descend any spinal channel. Every motor output is timed here before it hits the bus.",
  },
  {
    id: "brain_stem",
    category: "logic",
    type: "point",
    nodeSize: "small", // STYLE: deep/interior brain node — smaller sphere
    organ: "Brain Stem",
    hardware: "BIOS / Firmware",
    position: [0, 1.592, -0.063],
    femalePosition: [0, 1.526, -0.04],
    brainPosition: [0, 1.592, -0.063],
    femaleBrainPosition: [0, 1.523, -0.058],
    bio_function:
      "Governs all involuntary survival functions — breathing, heart rate, blood pressure, swallowing, consciousness itself. It operates beneath awareness. No amount of cortical health compensates for its failure. It is the irreducible minimum of being alive.",
    hard_function:
      "The BIOS is the lowest-level firmware — the first code that runs on power-up, before the operating system loads. It governs the most primitive hardware functions: power cycling, thermal monitoring, basic input/output. The system cannot boot without it.",
    synthesis:
      "Both run before anything else. Both are the layer you cannot lose and still have a system.",
    spinalConnection:
      "C1 origin — the firmware layer where the spinal bus begins. All 24 downstream channel assignments initialize from this point before any higher-level routing is possible.",
  },

  // ── SPINE — logic line ─────────────────────────────────────────────────────
  {
    id: "spinal_cord",
    category: "logic",
    type: "line",
    organ: "Spinal Cord",
    hardware: "Motherboard Main Bus (PCIe)",
    points: [
      [0, 1.58, -0.04], // C2  — upper cervical
      [0, 1.52, -0.05], // C4  — mid cervical
      [0, 1.46, -0.06], // C7/T1 — cervicothoracic junction
      [0, 1.4, -0.07], // T3  — entering thoracic kyphosis
      [0, 1.33, -0.07], // T5  — thoracic kyphosis
      [0, 1.25, -0.065], // T8  — kyphosis peak region
      [0, 1.18, -0.06], // T10 — kyphosis unwinding
      [0, 1.1, -0.055], // T12 — thoracolumbar junction
      [0, 1.02, -0.04], // L2  — entering lumbar lordosis
      [0, 0.95, -0.03], // L3  — lumbar lordosis
      [0, 0.9, -0.02], // L4/L5 — lordosis apex, most anterior
      [0, 0.88, -0.04], // S1  — sacrum steps posterior, terminates
    ],
    bio_function:
      "The trunk line of the nervous system — a continuous bundle of nerve fibers carrying motor commands from the brain to the body and sensory data from the body back to the brain. It contains 24 vertebral relay stations that segment and route every signal.",
    hard_function:
      "The PCIe bus is the motherboard's primary data highway — the physical channel through which the CPU communicates with every connected component. Every signal between processor and periphery travels through it.",
    synthesis:
      "Both are the backbone everything else depends on. Damage anywhere along the line interrupts communication below that point — completely, and in both directions.",
    spinalConnection:
      "The bus itself — 24 channel assignments running C2 through S2, routing every organ signal between the CPU and the chassis. Each colored disc marks a lane assignment.",
  },

  // ── SENSORY (AMBER) ────────────────────────────────────────────────────────
  {
    id: "right_eye",
    category: "sensory",
    type: "point",
    organ: "Right Eye",
    hardware: "Camera / GPU Render Pipeline",
    position: [-0.035, 1.64, 0.08], // [x: left/right,  y: up/down ← lower = smaller number,  z: front/back]
    femalePosition: [-0.035, 1.588, 0.08],
    brainPosition: [-0.035, 1.64, 0.08], // keep in sync with position above
    femaleBrainPosition: [-0.035, 1.588, 0.08],
    bio_function:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. The retina actively preprocesses the data — edge detection, contrast, motion — before it ever reaches the brain.",
    hard_function:
      "The camera sensor captures raw photon data and converts it into a digital signal. The render pipeline processes raw geometry into structured, displayable frames. Together they transform light into image.",
    synthesis:
      "Both are active encoders, not passive receivers. Both begin processing before the signal reaches the main processor. Both translate light into structured output.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
  },
  {
    id: "left_eye",
    category: "sensory",
    type: "point",
    organ: "Left Eye",
    hardware: "Camera / GPU Render Pipeline",
    position: [0.035, 1.64, 0.08], // [x: left/right,  y: up/down ← lower = smaller number,  z: front/back]
    femalePosition: [0.035, 1.588, 0.08],
    brainPosition: [0.035, 1.64, 0.08], // keep in sync with position above
    femaleBrainPosition: [0.035, 1.588, 0.08],
    bio_function:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. Dual-sensor stereo input provides the depth and field the brain needs to construct three-dimensional space.",
    hard_function:
      "The second camera sensor in the stereo input array. Both sensors feed the same render pipeline, providing dual-channel input for depth mapping and three-dimensional scene reconstruction.",
    synthesis:
      "Both are active encoders, not passive receivers. Both begin processing before the signal reaches the main processor. Both translate light into structured output.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
  },
  {
    id: "right_ear",
    category: "sensory",
    type: "point",
    organ: "Right Ear",
    hardware: "Microphone / ADC",
    position: [-0.07, 1.635, 0.0],
    femalePosition: [-0.07, 1.579, 0.0],
    brainPosition: [-0.07, 1.635, 0.0],
    femaleBrainPosition: [-0.07, 1.579, 0.0],
    bio_function:
      "The eardrum converts air pressure waves into mechanical vibration. The ossicles amplify and transmit it. The cochlea's hair cells perform the final transduction — converting mechanical movement into electrochemical nerve signals.",
    hard_function:
      "The microphone converts analog air pressure waves into analog electrical signals. The ADC samples those signals at high frequency and converts them into a discrete digital stream the system can process.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital signal. Biology and hardware arrived at identical architectures independently.",
    spinalConnection:
      "Cranial nerve VIII (vestibulocochlear) — audio input bypasses the vertebral backbone, transmitted directly to the brainstem auditory processor via a dedicated cranial channel.",
  },
  {
    id: "left_ear",
    category: "sensory",
    type: "point",
    organ: "Left Ear",
    hardware: "Microphone / ADC",
    position: [0.07, 1.635, 0.0],
    femalePosition: [0.07, 1.579, 0.0],
    brainPosition: [0.07, 1.635, 0.0],
    femaleBrainPosition: [0.07, 1.579, 0.0],
    bio_function:
      "The eardrum converts air pressure waves into mechanical vibration. The ossicles amplify and transmit it. The cochlea's hair cells perform the final transduction — converting mechanical movement into electrochemical nerve signals. Stereo input enables directional hearing.",
    hard_function:
      "The second microphone in the stereo audio input array. Both channels feed the same ADC pipeline, providing dual-channel input for spatial audio processing and directional signal mapping.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital signal. Biology and hardware arrived at identical architectures independently.",
    spinalConnection:
      "Cranial nerve VIII (vestibulocochlear) — audio input bypasses the vertebral backbone, transmitted directly to the brainstem auditory processor via a dedicated cranial channel.",
  },
  {
    id: "vocal_cords",
    category: "sensory",
    type: "point",
    organ: "Vocal Cords",
    hardware: "DAC + Speaker / TTS Engine",
    position: [0, 1.49, 0.03],
    bio_function:
      "Paired mucous membrane folds in the larynx that vibrate at precise frequencies when air passes through them. They do not generate the message — they are the final output encoder, converting internal neurological intent into a transmittable acoustic signal.",
    hard_function:
      "The DAC converts internal digital signals into analog waveforms. The speaker converts those waveforms into physical pressure waves that propagate through air. Neither generates meaning — they encode and transmit what the system has already decided to say.",
    synthesis:
      "Output is always translation. Both are the last stage of a long internal process — the point where thought becomes signal becomes wave.",
    spinalConnection:
      "Cranial nerve X (vagus) via the recurrent laryngeal and superior laryngeal branches — the audio output codec bypasses the spinal bus entirely, routed by dedicated cranial channel directly to the laryngeal hardware.",
  },
  {
    id: "skin",
    category: "sensory",
    type: "point",
    organ: "Skin",
    hardware: "Sensor Array / Haptic Interface",
    position: [0.14, 1.08, 0.02],
    bio_function:
      "The body's largest organ. Distributed receptors for pressure, temperature, pain, and vibration across its entire surface, while simultaneously serving as the primary barrier against pathogens and a thermal interface with the environment.",
    hard_function:
      "The sensor array monitors the system's external surface — temperature, pressure, contact, proximity. The haptic interface simultaneously provides tactile feedback. The chassis does three things at once: input device, physical barrier, and thermal interface.",
    synthesis:
      "One layer, three simultaneous functions. The boundary between system and environment was never passive in either case.",
    spinalConnection:
      "Distributed C2–S4 — the chassis sensor array taps every segment of the routing backbone simultaneously, reporting surface conditions across all 24 channel tiers.",
  },

  // ── POWER (RED) ────────────────────────────────────────────────────────────
  {
    id: "thyroid",
    category: "power",
    type: "point",
    organ: "Thyroid",
    hardware: "System Clock (BCLK)",
    position: [0, 1.53, 0.03],
    bio_function:
      "Secretes hormones that set the body's baseline metabolic rate — how fast every cell burns energy, synthesizes protein, and generates heat. Hyperthyroidism overclocks the body. Hypothyroidism throttles it below usable performance.",
    hard_function:
      "The base clock sets the fundamental speed at which every component in the system operates. Raise it and everything accelerates — but heat and instability follow. Lower it and the system cools but slows. Every process is downstream of this signal.",
    synthesis:
      "Both set the operating tempo of every downstream process. Both are small, unglamorous, and catastrophic when miscalibrated.",
    spinalConnection:
      "T1–T3 thoracic channel (superior cervical ganglion via sympathetic chain) — preganglionic fibers originate in the upper thoracic cord, ascend through the cervical sympathetic chain, and synapse at the superior cervical ganglion before reaching the thyroid. The clock source is thoracic, even though the hardware sits in the neck.",
  },
  {
    id: "heart",
    category: "power",
    type: "point",
    nodeSize: "large", // STYLE: central power node — larger sphere
    nodeColor: "#ff0a0a", // STYLE: rich crimson — richer than category power red
    organ: "Heart",
    hardware: "Power Supply Unit (PSU)",
    position: [0.01, 1.32, 0.06],
    bio_function:
      "The muscular pump delivering oxygenated blood to every cell in the body. Not because it thinks, but because everything that thinks requires continuous power delivery. It beats 100,000 times per day without instruction. Four minutes without it and the cortex begins to die.",
    hard_function:
      "The power supply unit converts incoming current into stable, regulated voltage and distributes it to every component in the system. It is not the brain — it is the reason the brain can run at all. Everything dies when it stops.",
    synthesis:
      "Neither is the most complex component. Both are the most critical one. The system does not degrade without them — it stops.",
    spinalConnection:
      "T1–T5 thoracic channel (cardiac accelerator nerve, sympathetic cardiac plexus) — the PSU assignment occupies the uppermost thoracic tier. The discs at T2–T4 are the precise bus lanes that control cardiac output.",
  },
  {
    id: "adrenals",
    category: "power",
    type: "point",
    organ: "Adrenal Glands",
    hardware: "Overclock Mechanism",
    position: [0, 1.12, -0.05],
    bio_function:
      "Release adrenaline in response to stress — instantly spiking heart rate, blood pressure, muscle blood flow, and reaction speed. The body performs beyond its normal limits. Sustained activation causes cardiovascular damage, immune suppression, and burnout.",
    hard_function:
      "Overclocking forces the CPU to run above its rated speed by increasing voltage and clock multiplier. Performance spikes dramatically — but thermal output rises, component wear accelerates, and sustained overclocking shortens hardware lifespan.",
    synthesis:
      "Both deliver emergency performance at the cost of long-term integrity. Both are designed for crisis, not cruise.",
    spinalConnection:
      "T5–T11 thoracic channel (greater splanchnic T5–T9, lesser splanchnic T10–T11) — the overclock trigger spans the mid-to-lower thoracic tier. The greater splanchnic nerve drives the adrenal medulla directly, bypassing any ganglion for maximum response speed. Emergency acceleration is hard-wired at the bus level.",
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
      "Exchanges carbon dioxide — the metabolic waste product of cellular energy generation — for fresh oxygen. Every cell in the body generates heat and CO₂ as byproducts of work. The lungs clear the exhaust.",
    hard_function:
      "The heat sink absorbs thermal energy generated by the CPU and dissipates it into the surrounding airspace. Without continuous airflow, components overheat and throttle. Sustained thermal overload causes permanent damage.",
    synthesis:
      "Both exist because energy conversion produces waste that must be removed continuously. Both are the reason the system can run at load without destroying itself.",
    spinalConnection:
      "T2–T7 thoracic channel (pulmonary plexus) — the cooling array assignment spans the mid-thoracic tier, sharing routing bandwidth with the cardiac accelerator. Thermal and power management are co-located by design.",
  },
  {
    id: "right_lung",
    category: "thermal",
    type: "point",
    organ: "Right Lung",
    hardware: "Thermal Management (Heat Sink)",
    position: [0.1, 1.22, 0.05],
    bio_function:
      "Exchanges carbon dioxide — the metabolic waste product of cellular energy generation — for fresh oxygen. The right lung is slightly larger than the left, compensating for the cardiac displacement.",
    hard_function:
      "The second heat sink in the bilateral thermal management array. Both units absorb and dissipate thermal load, providing redundant cooling capacity at the same bus tier.",
    synthesis:
      "Both exist because energy conversion produces waste that must be removed continuously. Both are the reason the system can run at load without destroying itself.",
    spinalConnection:
      "T2–T7 thoracic channel (pulmonary plexus) — the second cooling array mirrors the left channel across bilateral mid-thoracic routing. Redundant thermal capacity at the same bus tier.",
  },
  {
    id: "diaphragm",
    category: "thermal",
    type: "point",
    organ: "Diaphragm",
    hardware: "Fan Controller",
    position: [0, 1.13, 0.06],
    bio_function:
      "The primary muscle of respiration — contracting to expand lung volume, driving the entire breathing cycle. It responds to CO₂ levels in the blood, unconsciously adjusting rate and depth to match metabolic demand.",
    hard_function:
      "The fan controller regulates fan speed in response to thermal load — accelerating airflow under heavy processing, slowing during idle, maintaining the rhythm of the entire cooling cycle.",
    synthesis:
      "Both regulate the rhythm of the cooling system. Neither generates the airflow — both determine when and how fast it moves.",
    spinalConnection:
      "C3–C5 cervical channel (phrenic nerve) — the fan controller assignment descends from the upper cervical tier to drive the primary ventilation mechanism, the longest single nerve in the routing backbone.",
  },

  // ── DIGESTIVE (GREEN) ──────────────────────────────────────────────────────
  {
    id: "esophagus",
    category: "digestive",
    type: "point",
    organ: "Esophagus",
    hardware: "Input Queue / Data Bus",
    position: [0, 1.35, -0.03],
    bio_function:
      "A muscular tube that moves food from the mouth to the stomach via rhythmic contraction. It performs no digestion — its sole function is controlled, sequential delivery of raw input to the processing organ.",
    hard_function:
      "The data bus segment between the input port and the parser. It performs no transformation — it ensures raw input arrives at the processing layer in sequence, without loss, and without collision.",
    synthesis:
      "The pipe between the port and the processor. Before anything can be understood, it must first be delivered — orderly, intact, in sequence.",
    spinalConnection:
      "T5–T6 thoracic channel (upper splanchnic nerve) — the input queue assignment at the first digestive bus tier. The T5–T6 discs mark where the main bus begins routing signals to the GI processing segment.",
  },
  {
    id: "stomach",
    category: "digestive",
    type: "point",
    organ: "Stomach",
    hardware: "Parser / Compiler",
    position: [0.05, 1.08, 0.08],
    bio_function:
      "Mechanically churns food and chemically breaks it down with acid and enzymes — converting complex raw material into a semi-digested slurry that the small intestine can extract nutrients from. It is the first stage of transformation.",
    hard_function:
      "The parser takes raw input — text, binary, encoded data — and breaks it down into structured tokens the system can process. The compiler converts human-readable code into machine-executable instructions. Both transform raw input into usable form.",
    synthesis:
      "Neither produces the final output. Both convert raw input into a form the rest of the pipeline can work with.",
    spinalConnection:
      "T6–T9 thoracic channel (celiac plexus, greater splanchnic) — the parser assignment occupies the same central splanchnic tier as the liver and pancreas. Tightly coupled co-processing is architectural.",
  },
  {
    id: "liver",
    category: "digestive",
    type: "point",
    nodeSize: "large", // STYLE: largest internal organ — larger node
    organ: "Liver",
    hardware: "Firewall / Data Filter",
    position: [-0.07, 1.13, 0.08],
    bio_function:
      "Filters the entire blood supply — neutralizing toxins, metabolizing drugs, breaking down hormones, synthesizing proteins, and maintaining chemical balance. Everything absorbed from digestion passes through it before reaching circulation.",
    hard_function:
      "The firewall inspects incoming data packets, filters threats, blocks unauthorized access, and sanitizes inputs before they reach the system's core. It maintains a continuously updated ruleset for what is safe to process.",
    synthesis:
      "Both are mandatory inspection layers that every input must pass through. Both protect the system from what looked like food but turned out to be poison.",
    spinalConnection:
      "T7–T9 thoracic channel (greater splanchnic nerve, celiac plexus) — the firewall assignment at the central splanchnic tier. Threat interception and processing occur in the same bus segment.",
  },
  {
    id: "gallbladder",
    category: "digestive",
    type: "point",
    organ: "Gallbladder",
    hardware: "Capacitor Bank / Crypto-Coprocessor",
    position: [-0.045, 1.08, 0.07],
    femalePosition: [-0.045, 1.03, 0.07],
    bio_function:
      "Stores concentrated bile produced by the liver. When the small intestine encounters dense fat — the hardest material to break down — the gallbladder contracts and injects its concentrated charge directly into the pipeline to emulsify the load. It does not manufacture — it stores and discharges on demand.",
    hard_function:
      "A capacitor bank stores concentrated electrical charge and discharges it rapidly when the system encounters a sudden heavy load — providing the burst current a component needs to process dense or complex data without the main supply dropping voltage.",
    synthesis:
      "Both are reservoir-discharge systems. Both sit adjacent to a filter. Both exist for one purpose: when the pipeline hits something too dense for normal throughput, release the stored concentration and force it through.",
    spinalConnection:
      "T7–T9 thoracic channel (celiac plexus) — the capacitor bank co-routes with the firewall it serves. Concentrated discharge and threat filtering share the same bus segment by design.",
  },
  {
    id: "pancreas",
    category: "digestive",
    type: "point",
    organ: "Pancreas",
    hardware: "Voltage Regulator (VRM)",
    position: [-0.02, 1.06, 0.04],
    bio_function:
      "Produces insulin and glucagon to regulate blood sugar — the body's primary energy currency. Without it, glucose spikes and crashes destabilize every cell. Uncontrolled, it is fatal.",
    hard_function:
      "The voltage regulator module converts the PSU's raw output into the precise, stable voltage each component requires. A failing VRM causes system-wide instability — components receive inconsistent power and begin behaving unpredictably.",
    synthesis:
      "Both regulate the energy supply that every downstream process depends on. Both failures look the same: not a sudden shutdown, but a progressive, system-wide unraveling.",
    spinalConnection:
      "T6–T10 thoracic channel (greater and lesser splanchnic nerves) — the VRM assignment spans the full central splanchnic tier, reflecting its dual role regulating both energy input and digestive output.",
  },
  {
    id: "small_intestine",
    category: "digestive",
    type: "point",
    organ: "Small Intestine",
    hardware: "Data Bus / Processing Pipeline",
    position: [0, 1.05, 0.07],
    bio_function:
      "Where 90% of nutrient absorption occurs — extracting glucose, amino acids, fatty acids, and vitamins from the digested slurry and passing them into the bloodstream for distribution. The longest stage of the pipeline.",
    hard_function:
      "The data bus is the high-throughput channel through which processed data moves between components — extracting useful information from the parsed stream and forwarding it to storage, execution, and output subsystems.",
    synthesis:
      "Both are extraction and distribution stages. Neither transforms — both identify what's valuable and route it forward.",
    spinalConnection:
      "T9–T11 thoracic channel (lesser splanchnic nerve) — the processing pipeline assignment at the lower splanchnic tier, where the primary extraction stage exits the thoracic bus segment.",
  },
  {
    id: "large_intestine",
    category: "digestive",
    type: "point",
    organ: "Large Intestine",
    hardware: "Garbage Collector",
    position: [0, 0.97, 0.06],
    bio_function:
      "Absorbs remaining water, compacts indigestible waste, and prepares it for elimination. It takes what the processing pipeline couldn't use and clears it from the system.",
    hard_function:
      "The garbage collector identifies memory that is no longer referenced, marks it for deletion, and reclaims the space. It runs in the background, invisible until it doesn't — at which point memory fills and performance degrades.",
    synthesis:
      "Both clean up what the productive processes left behind. Both are invisible infrastructure that makes sustained operation possible.",
    spinalConnection:
      "T11–L2 thoracolumbar channel (lumbar splanchnic nerve) — the garbage collector spans the thoracolumbar junction, bridging the thoracic and lumbar routing tiers. Cleanup is distributed across the transition zone.",
  },

  // ── RENAL (VIOLET) ─────────────────────────────────────────────────────────
  {
    id: "right_kidney",
    category: "renal",
    type: "point",
    organ: "Right Kidney",
    hardware: "Swap File / Virtual Memory",
    position: [-0.06, 1.07, -0.05],
    bio_function:
      "Continuously filters the blood, removing metabolic waste products that accumulate as byproducts of the body's own operations. Unlike digestion, the kidneys clean what the body itself produces.",
    hard_function:
      "The virtual memory manager — scanning RAM for stale data, moving it to disk to free active memory, retrieving it on demand. It manages the residue of the system's own computations.",
    synthesis:
      "Without something to continuously clean internal waste, both systems choke on the byproducts of their own operation.",
    spinalConnection:
      "T10–T12 thoracic channel (least splanchnic nerve, renal plexus) — the virtual memory assignment at the lowest thoracic tier, where the renal routing segment exits the main backbone toward the filtering hardware.",
  },
  {
    id: "left_kidney",
    category: "renal",
    type: "point",
    organ: "Left Kidney",
    hardware: "Swap File / Virtual Memory",
    position: [0.06, 1.09, -0.05],
    bio_function:
      "Continuously filters the blood, removing metabolic waste products that accumulate as byproducts of the body's own operations. Bilateral redundancy — both kidneys can sustain life independently.",
    hard_function:
      "The virtual memory manager — scanning RAM for stale data, moving it to disk to free active memory, retrieving it on demand. Redundant virtual memory channels provide fault tolerance.",
    synthesis:
      "Without something to continuously clean internal waste, both systems choke on the byproducts of their own operation.",
    spinalConnection:
      "T10–T12 thoracic channel (least splanchnic nerve, renal plexus) — the left virtual memory channel mirrors the right at the same vertebral tier. Bilateral redundancy in the filtering bus segment.",
  },
  {
    id: "bladder",
    category: "renal",
    type: "point",
    organ: "Bladder",
    hardware: "Output Buffer",
    position: [0, 0.86, 0.04],
    bio_function:
      "Stores liquid waste filtered by the kidneys, accumulating it until voluntary release. It is a scheduled output operation, not a continuous stream.",
    hard_function:
      "The output buffer holds processed data ready for transmission — accumulating until a threshold is reached or a flush is triggered, then releasing in a single controlled output event.",
    synthesis:
      "Both store output until conditions are right for transmission. Both are controlled release mechanisms, not constant drains.",
    spinalConnection:
      "S2–S4 sacral channel (pelvic splanchnic nerves) — the output buffer assignment at the base of the routing backbone. The flush signal originates from the lowest tier of the spinal bus.",
  },

  // ── IMMUNE (TEAL) ──────────────────────────────────────────────────────────
  {
    id: "spleen",
    category: "immune",
    type: "point",
    organ: "Spleen",
    hardware: "SIEM (Central Threat Coordination)",
    position: [0.08, 1.1, -0.02],
    bio_function:
      "Filters blood directly, identifying and destroying pathogens and aging red blood cells. Unlike lymph nodes which intercept threats in transit, the spleen processes the blood itself — a central clearing house where immune responses are coordinated at scale.",
    hard_function:
      "The Security Information and Event Management system aggregates threat signals from across the network, correlates them into meaningful patterns, coordinates the response of the entire security infrastructure, and maintains the threat log.",
    synthesis:
      "Distributed sensors collect. The center coordinates. Both are the point where scattered threat signals become a unified response.",
    spinalConnection:
      "T6–T10 thoracic channel (celiac plexus) — the SIEM assignment co-routes with the digestive processing segment it monitors. Central threat coordination shares bus bandwidth with the systems it protects.",
  },
  {
    id: "lymph_cervical",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Cervical)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.04, 1.51, 0.01],
    bio_function:
      "A forward-deployed checkpoint in the neck where lymphatic fluid is filtered by immune cells before returning to circulation. Threats are intercepted at the periphery before reaching critical organs.",
    hard_function:
      "An edge security node deployed at a network boundary — filtering and evaluating traffic before it enters the core system. The closer to the perimeter the interception, the less exposure to core infrastructure.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    spinalConnection:
      "C2–C4 cervical channel — the topmost perimeter node assignment, stationed at the uppermost spinal tier where the backbone exits the skull. First checkpoint on the descending bus.",
  },
  {
    id: "lymph_axillary",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Axillary)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.16, 1.36, 0.02],
    bio_function:
      "A distributed checkpoint in the armpit region filtering lymphatic fluid from the arm and upper chest before it returns to central circulation.",
    hard_function:
      "A branch-office or DMZ perimeter node filtering lateral network traffic before it merges with the core network backbone.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    spinalConnection:
      "C5–T1 cervicothoracic channel (brachial plexus territory) — the lateral perimeter node sits at the cervicothoracic junction, monitoring I/O traffic from the upper-limb peripheral segment before it re-enters the core.",
  },
  {
    id: "lymph_inguinal",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Inguinal)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.08, 0.85, 0.03],
    bio_function:
      "A checkpoint at the groin filtering lymphatic fluid from the lower extremities before it returns to central circulation.",
    hard_function:
      "A southbound network perimeter node filtering traffic from lower-tier endpoints before it accesses the core.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    spinalConnection:
      "L1–L2 lumbar channel (inguinal nerve) — the southbound perimeter node assignment at the lower lumbar tier, the last checkpoint before peripheral traffic from the lower extremities re-enters the backbone.",
  },
  {
    id: "bone_marrow",
    category: "immune",
    type: "point",
    organ: "Bone Marrow",
    hardware: "Antivirus Definition Update Engine",
    position: [0, 1.33, 0.09],
    bio_function:
      "Soft tissue inside the sternum and major bones that manufactures all blood and immune cells — B-cells, T-cells, red blood cells. It does not fight pathogens directly. It produces the defenders, continuously generating cells with updated threat-recognition capabilities.",
    hard_function:
      "The antivirus definition update engine. It does not scan or quarantine — it manufactures and distributes the updated signature databases the active scanning layer uses to recognize new attacks.",
    synthesis:
      "Without continuous production of updated defenders, the immune layer stagnates. Novel threats pass through unrecognized. Both systems require a factory, not just a fighter.",
    spinalConnection:
      "T2–T6 thoracic channel (intercostal nerves, sternal innervation) — the definition update engine is housed at the mid-thoracic tier, where the primary power and immune routing segments overlap. Production capacity and distribution share the same bus.",
  },
];
