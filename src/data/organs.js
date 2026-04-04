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
    hardware: "Integrated Information",
    position: [0, 1.7, 0.0],
    bio_function:
      "The emergent phenomenon of self-awareness arising from coordinated neural activity — biology become witness to itself.",
    hard_function:
      "The theoretical point at which information integration becomes so dense that a system models itself: the ghost in the machine.",
    synthesis:
      "The intersection of biology and logic. Neither organ nor algorithm — the pattern that observes the pattern.",
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
    bio_function:
      "Center for active working memory, impulse control, and holding thoughts in immediate consciousness.",
    hard_function:
      "The active workspace holding data currently being calculated. If power cuts, the workspace goes blank.",
    synthesis:
      "Consciousness and computation both require a volatile workspace; without power, the active thought vanishes.",
    spinalConnection:
      "Cranial — direct CPU connection via cortical white matter, bypassing the spinal bus entirely. The hardware equivalent is an on-die cache lane: highest bandwidth, zero routing latency.",
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
    spinalConnection:
      "Cranial — the left processor core operates above the vertebral backbone, communicating via cortical commissures rather than spinal channel assignments.",
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
    spinalConnection:
      "Cranial — the parallel processing core operates above the spinal bus, passing data laterally via the corpus callosum before any signal descends the backbone.",
  },
  {
    id: "thalamus",
    category: "logic",
    type: "point",
    organ: "Thalamus",
    hardware: "Interrupt Controller",
    position: [-0.02, 1.645, -0.01],
    bio_function:
      "A central relay nucleus that receives virtually all sensory input and routes it to the correct cortical region. Nothing reaches conscious awareness without passing through it first.",
    hard_function:
      "Receives interrupt signals from all connected hardware and routes them to the correct processor with assigned priority. It does not compute — it directs.",
    synthesis:
      "Every signal in both systems must pass through a central router before reaching the processor. Priority determines what gets noticed.",
    spinalConnection:
      "Cranial — the interrupt controller sits at the CPU level, routing signals between cortical layers without descending to any spinal channel. It receives ascending bus traffic but does not originate from it.",
  },
  {
    id: "hippocampus",
    category: "logic",
    type: "point",
    organ: "Hippocampus",
    hardware: "Storage Drive (SSD/HDD)",
    position: [0, 1.63, -0.04],
    bio_function:
      "Encodes and retrieves long-term memory storage, indexing experiences for later recall.",
    hard_function:
      "Writes data to non-volatile storage blocks, ensuring information survives a power cycle.",
    synthesis:
      "Without a mechanism to permanently index the past, neither a machine nor a mind can learn.",
    spinalConnection:
      "Cranial — long-term storage is indexed above the vertebral backbone, accessed via the fornix pathway rather than any spinal channel assignment.",
  },
  {
    id: "amygdala",
    category: "logic",
    type: "point",
    organ: "Amygdala",
    hardware: "Interrupt Handler",
    position: [0, 1.63, 0.03],
    bio_function:
      "Rapidly detects emotional and survival-critical threats, overriding deliberate cognition to trigger immediate responses.",
    hard_function:
      "Monitors the event queue for high-priority signals that preempt normal execution and demand immediate CPU attention.",
    synthesis:
      "Survival logic supersedes scheduled operation — in both systems, certain signals cannot wait in line.",
    spinalConnection:
      "Cranial — the interrupt handler fires above the spinal bus, but its emergency preemption signal descends the entire backbone simultaneously via the autonomic pathways.",
  },
  {
    id: "hypothalamus",
    category: "logic",
    type: "point",
    organ: "Hypothalamus",
    hardware: "Thermal & Power State Manager",
    position: [0, 1.626, 0.02],
    bio_function:
      "Monitors core temperature, hunger, thirst, and hormonal balance — continuously adjusting the body's internal environment to maintain equilibrium.",
    hard_function:
      "The embedded controller that monitors thermals, adjusts fan curves, throttles performance under heat, and manages sleep/wake power state transitions.",
    synthesis:
      "Homeostasis is not passive — both systems require an active regulator that never sleeps, continuously holding the environment within survivable parameters.",
    spinalConnection:
      "Cranial in origin, but writes to the full vertebral backbone via the autonomic nervous system — the embedded controller that broadcasts state management signals to every spinal channel simultaneously.",
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
      "Both serve as the master regulator — they do not think, but they dictate the state and rhythm of the entire system.",
    spinalConnection:
      "Cranial — the control chip broadcasts hormonal signals that modulate downstream channel behavior system-wide, without routing through any single spinal segment.",
  },
  {
    id: "brain_stem",
    category: "logic",
    type: "point",
    organ: "Brain Stem",
    hardware: "BIOS / Firmware",
    position: [0, 1.575, -0.04],
    bio_function:
      "The most primitive region of the brain, governing all involuntary survival functions — breathing, heart rate, blood pressure — continuously beneath conscious awareness. The organism cannot survive its failure regardless of how healthy the cortex is.",
    hard_function:
      "Firmware burned into the motherboard's ROM that executes before any OS loads. It initializes hardware, runs POST, and keeps the most fundamental operations alive. The machine cannot boot without it.",
    synthesis:
      "Beneath all cognition and all software lies a layer that simply keeps the system alive. It predates thought. It cannot be switched off.",
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
      "The central bundle of nerve fibers connecting the brain to the rest of the body.",
    hard_function:
      "The primary high-speed highway that transfers massive amounts of data between the CPU and peripherals.",
    synthesis:
      "The structural and communicative backbone; if severed, the brain cannot speak to the chassis.",
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
    position: [-0.035, 1.645, 0.08],
    bio_function:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. The eye actively preprocesses raw light into structured visual data before it reaches the brain.",
    hard_function:
      "The camera sensor and GPU render pipeline — capturing raw photon data, converting it to digital signal, processing raw geometry into rendered frames, and transmitting structured output to the display.",
    synthesis:
      "Both translate physical light phenomena into structured, interpretable output. Neither passively receives — both actively encode.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
  },
  {
    id: "left_eye",
    category: "sensory",
    type: "point",
    organ: "Left Eye",
    hardware: "Camera / GPU Render Pipeline",
    position: [0.035, 1.645, 0.08],
    bio_function:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. The eye actively preprocesses raw light into structured visual data before it reaches the brain.",
    hard_function:
      "The camera sensor and GPU render pipeline — capturing raw photon data, converting it to digital signal, processing raw geometry into rendered frames, and transmitting structured output to the display.",
    synthesis:
      "Both translate physical light phenomena into structured, interpretable output. Neither passively receives — both actively encode.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
  },
  {
    id: "right_ear",
    category: "sensory",
    type: "point",
    organ: "Right Ear",
    hardware: "Microphone / Audio Input Processor",
    position: [-0.07, 1.635, 0.0],
    bio_function:
      "Converts pressure waves in air into mechanical vibration via the eardrum and ossicles, then into electrochemical nerve signals via the cochlea's hair cells.",
    hard_function:
      "The microphone and ADC — converting analog air pressure waves into analog electrical signals, then sampling them at high frequency into a discrete digital stream the system can process.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital. Biology and hardware solved the same problem with the same architecture.",
    spinalConnection:
      "Cranial nerve VIII (vestibulocochlear) — audio input bypasses the vertebral backbone, transmitted directly to the brainstem auditory processor via a dedicated cranial channel.",
  },
  {
    id: "left_ear",
    category: "sensory",
    type: "point",
    organ: "Left Ear",
    hardware: "Microphone / Audio Input Processor",
    position: [0.07, 1.635, 0.0],
    bio_function:
      "Converts pressure waves in air into mechanical vibration via the eardrum and ossicles, then into electrochemical nerve signals via the cochlea's hair cells.",
    hard_function:
      "The microphone and ADC — converting analog air pressure waves into analog electrical signals, then sampling them at high frequency into a discrete digital stream the system can process.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital. Biology and hardware solved the same problem with the same architecture.",
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
      "The audio output codec and speaker stack. The DAC converts internal digital signals into analog waveforms; the speaker converts those waveforms into physical pressure waves. Neither generates meaning — they encode and transmit it.",
    synthesis:
      "Output is always a translation. The vocal cords and the speaker are both the final stage of a long internal process — the point where thought becomes signal becomes wave.",
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
      "The sensor array, haptic feedback layer, and chassis surface — capacitive sensors, temperature monitors, and the physical casing acting simultaneously as input device, barrier, and thermal interface.",
    synthesis:
      "One organ, three simultaneous hardware roles. The boundary between system and environment is never passive — it senses, protects, and regulates at the same time.",
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
      "Secretes hormones that set the body's baseline metabolic rate — how fast every cell burns energy.",
    hard_function:
      "The base clock frequency that determines how fast every instruction executes across the entire system.",
    synthesis:
      "The metronome of existence: both systems run at the speed their clock dictates.",
    spinalConnection:
      "T1–T3 thoracic channel (superior cervical ganglion via sympathetic chain) — preganglionic fibers originate in the upper thoracic cord, ascend through the cervical sympathetic chain, and synapse at the superior cervical ganglion before reaching the thyroid. The clock source is thoracic, even though the hardware sits in the neck.",
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
    spinalConnection:
      "T1–T5 thoracic channel (cardiac accelerator nerve, sympathetic cardiac plexus) — the PSU assignment occupies the uppermost thoracic tier. The discs you see light up at T2–T4 are the precise bus lanes that control cardiac output.",
  },
  {
    id: "adrenals",
    category: "power",
    type: "point",
    organ: "Adrenal Glands",
    hardware: "Overclock Mechanism",
    position: [0, 1.12, -0.05],
    bio_function:
      "Release adrenaline and cortisol in response to stress, spiking heart rate and energy output far above baseline.",
    hard_function:
      "Temporarily pushes the CPU past its rated clock speed and voltage ceiling to handle peak load — at the cost of accelerated wear.",
    synthesis:
      "Both systems can exceed design limits under duress; the performance gain is always borrowed against longevity.",
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
      "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    hard_function:
      "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    synthesis:
      "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive.",
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
      "Facilitates gas exchange, pulling in cool oxygen and expelling hot carbon dioxide.",
    hard_function:
      "Pulls heat away from processors and disperses it into the surrounding air to prevent thermal death.",
    synthesis:
      "Life requires gas exchange; machines require heat exchange. Both systems must 'breathe' to survive.",
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
      "The dome-shaped muscle whose rhythmic contraction drives the breathing cycle, forcing air through the lungs.",
    hard_function:
      "Dynamically adjusts fan speed based on thermal sensor readings, maintaining optimal operating temperature.",
    synthesis:
      "Mechanical rhythm is the mechanism of survival — both systems would overheat and suffocate without it.",
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
      "The muscular tube transporting ingested material from the mouth to the stomach. It performs no digestion — its sole function is controlled, sequential delivery of raw input to the processing organ.",
    hard_function:
      "The data bus segment between the input port and the parser. It performs no transformation — it ensures raw input arrives at the processing layer in sequence, without loss, and without collision.",
    synthesis:
      "The pipe between the port and the processor. Before anything can be understood, it must first be delivered — orderly, intact, in sequence.",
    spinalConnection:
      "T5–T6 thoracic channel (upper splanchnic nerve) — the input queue assignment at the first digestive bus tier. The T5–T6 discs mark where the main bus begins routing signals to the GI processing segment.",
  },
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
    spinalConnection:
      "T7–T9 thoracic channel (greater splanchnic nerve, celiac plexus) — the firewall assignment at the central splanchnic tier. Threat interception and processing occur in the same bus segment.",
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
    spinalConnection:
      "T6–T10 thoracic channel (greater and lesser splanchnic nerves) — the VRM assignment spans the full central splanchnic tier, reflecting its dual role regulating both energy input and digestive output.",
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
    spinalConnection:
      "T6–T9 thoracic channel (celiac plexus, greater splanchnic) — the parser assignment occupies the same central splanchnic tier as the liver and pancreas. Tightly coupled co-processing is architectural.",
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
      "Clears what is no longer needed by the body and prepares it for output.",
    hard_function:
      "An automated memory management feature that reclaims memory occupied by objects no longer in use.",
    synthesis:
      "A sustainable system must efficiently identify and purge the remnants of processed data.",
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
      "Continuously filters the blood, removing metabolic waste products that accumulate as byproducts of the body's own operations.",
    hard_function:
      "The virtual memory manager — scanning RAM for stale data, moving it to disk to free active memory, retrieving it on demand.",
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
      "Holds filtered waste from the kidneys until sufficient volume accumulates for a deliberate, controlled excretion event. It does not filter — it buffers.",
    hard_function:
      "Accumulates processed output until enough has gathered to warrant a deliberate write or transmission event. Nothing is expelled prematurely — the system waits for a flush signal.",
    synthesis:
      "Controlled output requires a buffer. Both systems defer excretion until the threshold for a flush event is reached.",
    spinalConnection:
      "S2–S4 sacral channel (pelvic splanchnic nerves) — the output buffer assignment at the base of the routing backbone. The flush signal originates from the lowest tier of the spinal bus.",
  },

  // ── IMMUNE (TEAL) ──────────────────────────────────────────────────────────
  {
    id: "spleen",
    category: "immune",
    type: "point",
    organ: "Spleen",
    hardware: "Central Threat Coordination (SIEM)",
    position: [0.08, 1.1, -0.02],
    bio_function:
      "Filters blood directly, identifying and destroying pathogens and aging red blood cells. Unlike lymph nodes which intercept threats in transit, the spleen processes the blood itself — a central clearing house where immune responses are coordinated at scale.",
    hard_function:
      "The SIEM — aggregating threat data from all perimeter nodes, correlating patterns across the entire network, and triggering coordinated system-wide responses to confirmed intrusions.",
    synthesis:
      "Distributed sensors collect. The center coordinates. Both the spleen and the SIEM are the point where scattered threat signals become a unified response.",
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
