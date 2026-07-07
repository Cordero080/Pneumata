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
    hardware: "The User",
    position: [0, 1.746, 0.0],
    femalePosition: [0, 1.72, 0.0],
    brainPosition: [0, 1.746, 0.0],
    femaleBrainPosition: [0, 1.72, 0.0],
    bioFunction:
      "Not a product of the tissue but the presence the tissue makes room for — the witness behind thought, sensation, and impulse, felt from the inside rather than observed from outside. Anima: the animating principle a living body is organized to host, not manufacture.",
    hardFunction:
      "The User: not a program running on the hardware, but the operator the hardware and software exist to serve. Every chip and every routing table assumes something is present to use them — a session owner logged into the system, distinct from the machine it operates.",
    synthesis:
      "Neither the body nor a machine explains why anyone is home. A computer executes without complaint whether or not a user is logged in; a body, by every indication, does not. Anima and User name the same relationship from two directions: the one for whom hardware and software exist, but who is not made of either.",
    bioFunctionSimple:
      "Not something your brain makes, but something your brain makes room for — the 'you' behind your thoughts, feelings, and choices. Anima is an old word for it: the animating presence a living body exists to carry.",
    hardFunctionSimple:
      "Picture a computer with no one using it — it can still run programs, but there's no one there. The User is the person actually at the keyboard: not a program, not a chip, but the one the whole machine exists to serve.",
    synthesisSimple:
      "A computer can run with nobody logged in. A living body, as far as anyone can tell, can't just run itself with nobody home. 'Anima' and 'User' are two names for the same idea: someone the system is for, who isn't made out of the system's own parts.",
    spinalConnection:
      "Above all spinal channels — the User sits outside the routing diagram entirely, the one the whole bus architecture exists to serve rather than one more assignment on it.",
    spinalConnectionSimple:
      "Sits above the whole nervous system — not one more wire in the diagram, but the one the entire wiring is there to serve.",
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
    bioFunction:
      "The prefrontal cortex governs active working memory, impulse control, planning, and deliberate reasoning. It holds the current thought in place long enough to act on it. Damage here doesn't erase the past — it destroys the ability to hold the present.",
    hardFunction:
      "Random Access Memory — the volatile workspace where the CPU holds everything it is actively computing. Fast, limited, and completely cleared when power cuts. Nothing stored here survives a reboot.",
    synthesis:
      "Both are temporary high-speed workspaces. Neither stores anything permanently. Both are the first thing lost when the system goes down.",
    bioFunctionSimple:
      "The front of the brain holds what you're thinking about right now — making plans, holding back impulses, doing math in your head. Anything 'in mind' lives here briefly. Damage doesn't erase the past; it kills the ability to hold the present.",
    hardFunctionSimple:
      "Short-term computer memory. Holds whatever the computer is actively using — open apps, the document you're typing in. Cut the power and it all vanishes.",
    synthesisSimple:
      "Both are temporary workspaces, not long-term storage. Nothing here survives the lights going out — neither when you fall unconscious, nor when the computer powers off.",
    spinalConnection:
      "Cranial — direct CPU connection via cortical white matter, bypassing the spinal bus entirely. The hardware equivalent is an on-die cache lane: highest bandwidth, zero routing latency.",
    spinalConnectionSimple:
      "Connects directly to the rest of the brain through internal wiring — never has to travel down the spinal cord. Like a processor talking to memory on the same circuit board.",
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
    bioFunction:
      "Specializes in sequential processing — language, grammar, logic, analysis. It breaks complex problems into ordered steps and executes them in series. It is the hemisphere that narrates.",
    hardFunction:
      "The Central Processing Unit — executes sequential instructions, handles mathematical logic, and processes language and symbolic reasoning one step at a time. The fastest path through a linear problem.",
    synthesis:
      "Both are engines of linear, structured thought. Both excel at following rules, parsing syntax, and moving through a problem one step at a time.",
    bioFunctionSimple:
      "The left side of the brain handles things that need to be done in order — language, math, logic. It breaks problems into steps and works through them one at a time. It's the side that narrates your day.",
    hardFunctionSimple:
      "The main processing chip. Built to do tasks in sequence, very fast — math, logic, following instructions one step at a time. Best at problems with a clear order of operations.",
    synthesisSimple:
      "Both work step by step. Both are great at following rules and processing things in a strict order.",
    spinalConnection:
      "Cranial — the left processor core operates above the vertebral backbone, communicating via cortical commissures rather than spinal channel assignments.",
    spinalConnectionSimple:
      "Lives at the top of the system, above the spine. Sends signals across to the other side of the brain through dedicated brain-to-brain pathways.",
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
    bioFunction:
      "Handles spatial reasoning, pattern recognition, emotional tone, and holistic perception. It processes the entire scene rather than its parts, recognizes faces, interprets music, and holds the big picture.",
    hardFunction:
      "The Graphics Processing Unit — processes thousands of parallel data streams simultaneously. Built not for sequential logic but for pattern recognition, rendering, and spatial computation across massive arrays of data at once.",
    synthesis:
      "Both trade sequential precision for parallel throughput. Both see the whole image before the individual pixel.",
    bioFunctionSimple:
      "The right side of the brain processes the whole picture all at once — faces, music, spatial layout, emotional tone. It sees patterns rather than steps.",
    hardFunctionSimple:
      "A specialized chip designed to do thousands of small calculations simultaneously instead of one at a time. Built for graphics, pattern recognition, and AI — anything where the whole image matters more than the order.",
    synthesisSimple:
      "Both give up step-by-step precision for the ability to see everything at once. Both find patterns before they find pieces.",
    spinalConnection:
      "Cranial — the parallel processing core operates above the spinal bus, passing data laterally via the corpus callosum before any signal descends the backbone.",
    spinalConnectionSimple:
      "Sits at the top with the left hemisphere — they pass signals to each other directly through the brain's main internal cable, without going down the spine.",
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
    bioFunction:
      "Nearly all sensory input — vision, touch, hearing, pain — passes through the thalamus before reaching the cortex. It acts as the central relay station, filtering and routing signals to the correct brain region. Consciousness depends on it remaining online.",
    hardFunction:
      "The interrupt controller receives signals from every connected hardware device and routes them to the correct processor with assigned priority. Nothing reaches the CPU without passing through it first. It does not compute — it directs.",
    synthesis:
      "Both are mandatory routing layers. Neither generates meaning — both determine what gets through, in what order, to what destination.",
    bioFunctionSimple:
      "Almost everything you see, feel, or hear passes through here before your brain processes it. It decides what's important and routes it where it needs to go. Consciousness shuts down if it stops working.",
    hardFunctionSimple:
      "A small chip that decides which incoming signals reach the main processor and in what order. It doesn't actually do any thinking — it just controls traffic.",
    synthesisSimple:
      "Both are required traffic controllers. Neither creates meaning — both decide what gets through, when, and to whom.",
    spinalConnection:
      "Cranial — the interrupt controller sits at the CPU level, routing signals between cortical layers without descending to any spinal channel. It receives ascending bus traffic but does not originate from it.",
    spinalConnectionSimple:
      "Deep in the brain. Handles signals coming up from below, but doesn't reach down into the spine itself.",
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
    bioFunction:
      "Encodes short-term experience into long-term memory, consolidates it during sleep, and retrieves it on demand. Without it, every day begins with no record of the last. Damage produces a permanent present tense.",
    hardFunction:
      "Solid-state storage — non-volatile memory that persists after power loss. Writes experience to permanent blocks, indexes it for retrieval, and holds the archive the system draws on when processing new information against old patterns.",
    synthesis:
      "Both convert active, temporary experience into indexed, persistent storage. Both are the reason the system can learn rather than just react.",
    bioFunctionSimple:
      "Turns today's experiences into lasting memories. Files them away during sleep, pulls them back out when needed. Without it, every day starts blank — you can't form new memories at all.",
    hardFunctionSimple:
      "Permanent storage. Holds everything that needs to survive a power-off — files, settings, history. The computer reads from it whenever it needs to remember something.",
    synthesisSimple:
      "Both convert short-term experience into long-term records. Both are why learning is possible — you can build on what came before.",
    spinalConnection:
      "Cranial — long-term storage is indexed above the vertebral backbone, accessed via the fornix pathway rather than any spinal channel assignment.",
    spinalConnectionSimple:
      "Deep in the brain. Connects to memory through a specialized internal pathway, not via the spine.",
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
    bioFunction:
      "Detects emotional and survival-critical stimuli — threat, fear, aggression — and fires before conscious processing completes. It bypasses deliberation and triggers immediate physical response. It is faster than thought by design.",
    hardFunction:
      "The interrupt handler monitors the event queue for signals flagged as critical — threats that cannot wait in line for scheduled processing. When triggered, it preempts normal execution and forces immediate CPU attention regardless of what was running.",
    synthesis:
      "Both exist because some inputs cannot be queued. Both override the normal processing hierarchy when the cost of delay is too high.",
    bioFunctionSimple:
      "Spots danger and reacts before your thinking brain catches up. Fear, anger, fight-or-flight — all triggered here, instantly. Faster than conscious thought, by design.",
    hardFunctionSimple:
      "Code that runs the moment an urgent signal arrives, jumping ahead of whatever the computer was doing. Used for things that can't wait their turn — overheating, hardware errors, emergencies.",
    synthesisSimple:
      "Both exist because some things are too dangerous to wait in line. Both interrupt everything else when the situation demands it.",
    spinalConnection:
      "Cranial — the interrupt handler fires above the spinal bus, but its emergency preemption signal descends the entire backbone simultaneously via the autonomic pathways.",
    spinalConnectionSimple:
      "Lives inside the brain, but when it fires, the alarm shoots down through the whole spine at once — the body reacts everywhere simultaneously.",
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
    bioFunction:
      "Regulates body temperature, hunger, thirst, circadian rhythm, and hormonal balance. It continuously samples the body's internal state and adjusts output to maintain homeostasis. It never stops running.",
    hardFunction:
      "The thermal and power management subsystem monitors CPU temperature, adjusts fan speed, throttles clock speed, and manages sleep states. It keeps the system within safe operating parameters at all times without user intervention.",
    synthesis:
      "Both manage the unglamorous infrastructure that makes everything else possible. Both are invisible until they fail — at which point the entire system destabilizes.",
    bioFunctionSimple:
      "Quietly regulates body temperature, hunger, thirst, sleep cycles, and hormone levels. Never stops working. You're not aware of it — until it fails, and then everything falls apart.",
    hardFunctionSimple:
      "The chip that monitors how hot the computer is getting and decides when to speed up the fan, slow down the processor, or put the system to sleep. Invisible until it stops working.",
    synthesisSimple:
      "Both manage the boring infrastructure that makes everything else possible. Both are invisible unless they break.",
    spinalConnection:
      "Cranial in origin, but writes to the full vertebral backbone via the autonomic nervous system — the embedded controller that broadcasts state management signals to every spinal channel simultaneously.",
    spinalConnectionSimple:
      "Inside the brain, but talks to the body through a separate nervous system that runs alongside the spine — adjusting heart rate, breathing, and temperature everywhere at once.",
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
    bioFunction:
      "The master gland that releases hormones controlling growth, metabolism, reproduction, stress response, and the activity of every other endocrine gland. It is the conductor of the hormonal orchestra — the signal that tells every instrument when to play.",
    hardFunction:
      "The master control chip that orchestrates system-wide signaling — broadcasting commands that regulate the behavior of every downstream subsystem simultaneously. It does not execute tasks directly; it issues the instructions that govern everything that does.",
    synthesis:
      "Both sit at the apex of a command hierarchy. Neither does the work directly. Both ensure the work gets done by everything below them.",
    bioFunctionSimple:
      "Sends hormones that control growth, metabolism, stress response, and reproduction — by directing every other gland in the body. Doesn't do the work itself; it tells everyone else what to do.",
    hardFunctionSimple:
      "A small chip whose only job is to issue orders to the rest of the system. Doesn't compute results — it tells the chips that do compute what to do and when.",
    synthesisSimple:
      "Both sit at the top of a command chain. Neither does anything itself. Both make sure everything else gets done.",
    spinalConnection:
      "Cranial — the master regulator broadcasts hormonal signals that modulate downstream channel behavior system-wide, without routing through any single spinal segment.",
    spinalConnectionSimple:
      "Sends its hormones through the bloodstream, not through the spine — the chemical equivalent of broadcasting commands wirelessly to every component at once.",
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
    bioFunction:
      "Coordinates movement, balance, and timing — not initiating actions but ensuring they are executed with precision and rhythm. It fine-tunes the signal after the cortex sends it. Damage produces not paralysis but ataxia — movement that exists but cannot be controlled.",
    hardFunction:
      "The clock crystal generates the master timing signal — a precise, stable oscillation that every other component synchronizes to. Without it, operations lose coordination. Chips fire out of sequence. The system falls apart not from lack of power but from loss of rhythm.",
    synthesis:
      "Both are the reason the system moves gracefully rather than just moving. Both are invisible when working and devastating when not.",
    bioFunctionSimple:
      "Doesn't decide what to do — it makes sure what you do is smooth and well-timed. Walking, talking, catching a ball. Damage here doesn't paralyze you; it just makes every movement clumsy and unsteady.",
    hardFunctionSimple:
      "A tiny piece of quartz that vibrates at a precise frequency. Every chip times itself to its beat. Without it, the system loses coordination — chips fire out of order and everything falls apart.",
    synthesisSimple:
      "Both are why things move gracefully instead of just moving. Both are invisible when they work and devastating when they don't.",
    spinalConnection:
      "Cranial — the clock crystal sits at the posterior base of the brain, synchronizing signals across the entire cortex before they descend any spinal channel. Every motor output is timed here before it hits the bus.",
    spinalConnectionSimple:
      "At the back-base of the brain. Times every movement signal before it heads down the spine. Every command leaves stamped with its rhythm.",
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
    bioFunction:
      "Governs all involuntary survival functions — breathing, heart rate, blood pressure, swallowing, consciousness itself. It operates beneath awareness. No amount of cortical health compensates for its failure. It is the irreducible minimum of being alive.",
    hardFunction:
      "The BIOS is the lowest-level firmware — the first code that runs on power-up, before the operating system loads. It governs the most primitive hardware functions: power cycling, thermal monitoring, basic input/output. The system cannot boot without it.",
    synthesis:
      "Both run before anything else. Both are the layer you cannot lose and still have a system.",
    bioFunctionSimple:
      "Runs the most basic life functions — breathing, heartbeat, swallowing, blood pressure. Works without you knowing. No amount of healthy thinking-brain compensates for damage here. This is the minimum required to be alive.",
    hardFunctionSimple:
      "The first software that runs when a computer turns on — before the operating system loads. Manages the most primitive hardware functions: power, basic input, startup. The computer cannot start without it.",
    synthesisSimple:
      "Both run before anything else. Both are the layer you can't lose and still have a working system.",
    spinalConnection:
      "C1 origin — the firmware layer where the spinal bus begins. All 24 downstream channel assignments initialize from this point before any higher-level routing is possible.",
    spinalConnectionSimple:
      "This is where the spine and brain meet. All 24 nerve channels of the spinal cord start here — like the first chip that wakes up before any other can boot.",
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
    bioFunction:
      "The trunk line of the nervous system — a continuous bundle of nerve fibers carrying motor commands from the brain to the body and sensory data from the body back to the brain. It contains 24 vertebral relay stations that segment and route every signal.",
    hardFunction:
      "The PCIe bus is the motherboard's primary data highway — the physical channel through which the CPU communicates with every connected component. Every signal between processor and periphery travels through it.",
    synthesis:
      "Both are the backbone everything else depends on. Damage anywhere along the line interrupts communication below that point — completely, and in both directions.",
    bioFunctionSimple:
      "The main nerve trunk — a bundle of wires running down your back. Carries every command from brain to body, and every sensation from body back to brain. Has 24 levels, each connecting to a different region.",
    hardFunctionSimple:
      "The main internal highway of a computer — the wiring through which the processor talks to everything else: memory, drives, graphics, ports. All signals flow through it.",
    synthesisSimple:
      "Both are the backbone everything else depends on. Cut either one and everything below the cut goes silent — completely, in both directions.",
    spinalConnection:
      "The bus itself — 24 channel assignments running C2 through S2, routing every organ signal between the CPU and the chassis. Each colored disc marks a lane assignment.",
    spinalConnectionSimple:
      "It is the spine — the 24-level highway itself. Each colored disc marks a separate channel out to a specific organ.",
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
    bioFunction:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. The retina actively preprocesses the data — edge detection, contrast, motion — before it ever reaches the brain.",
    hardFunction:
      "The camera sensor captures raw photon data and converts it into a digital signal. The render pipeline processes raw geometry into structured, displayable frames. Together they transform light into image.",
    synthesis:
      "Both are active encoders, not passive receivers. Both begin processing before the signal reaches the main processor. Both translate light into structured output.",
    bioFunctionSimple:
      "Catches light through the lens, focuses it onto the back of the eye, and converts it into nerve signals. The eye actually starts processing the image before it ever reaches the brain.",
    hardFunctionSimple:
      "A camera sensor captures light and turns it into digital data. A graphics pipeline then processes that data into the image you see. Light in, picture out.",
    synthesisSimple:
      "Both are active image processors, not passive lenses. Both begin understanding the picture before it ever reaches the main processor.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
    spinalConnectionSimple:
      "Connected directly to the brain by the optic nerve — bypasses the spine entirely. The fastest, widest sensory cable in the body.",
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
    bioFunction:
      "Captures photons through the lens, focuses them on the retina's photoreceptors, and converts light into electrochemical signals. Dual-sensor stereo input provides the depth and field the brain needs to construct three-dimensional space.",
    hardFunction:
      "The second camera sensor in the stereo input array. Both sensors feed the same render pipeline, providing dual-channel input for depth mapping and three-dimensional scene reconstruction.",
    synthesis:
      "Both are active encoders, not passive receivers. Both begin processing before the signal reaches the main processor. Both translate light into structured output.",
    bioFunctionSimple:
      "Catches light just like the right eye, but the two eyes together let your brain see in three dimensions. Each sees a slightly different angle; the brain combines them into depth.",
    hardFunctionSimple:
      "The second camera in a stereo pair. Both cameras feed the same graphics pipeline — two angles give the system enough information to reconstruct depth and three-dimensional space.",
    synthesisSimple:
      "Both are active image processors, not passive lenses. Both begin understanding the picture before it ever reaches the main processor.",
    spinalConnection:
      "Cranial nerve II (optic) — optical data bypasses the spinal bus entirely, routed directly from the retinal sensor to the visual cortex via a dedicated high-bandwidth cranial channel with no vertebral relay.",
    spinalConnectionSimple:
      "Connected directly to the brain by the optic nerve — bypasses the spine. Highest-bandwidth sensory channel in the body.",
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
    bioFunction:
      "The eardrum converts air pressure waves into mechanical vibration. The ossicles amplify and transmit it. The cochlea's hair cells perform the final transduction — converting mechanical movement into electrochemical nerve signals.",
    hardFunction:
      "The microphone converts analog air pressure waves into analog electrical signals. The ADC samples those signals at high frequency and converts them into a discrete digital stream the system can process.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital signal. Biology and hardware arrived at identical architectures independently.",
    bioFunctionSimple:
      "The eardrum vibrates from sound waves. Tiny bones amplify the vibration. Hair cells in the inner ear convert the movement into nerve signals — physical motion becomes biological impulses.",
    hardFunctionSimple:
      "A microphone catches sound waves as electrical signals. A converter chip samples them many times per second and turns them into numbers the computer can process.",
    synthesisSimple:
      "Three-step conversion in both: physical wave → electrical signal → digital data. Biology and engineering landed on the same blueprint.",
    spinalConnection:
      "Cranial nerve VIII (vestibulocochlear) — audio input bypasses the vertebral backbone, transmitted directly to the brainstem auditory processor via a dedicated cranial channel.",
    spinalConnectionSimple:
      "Wired directly to the brainstem through a dedicated nerve, not the spine.",
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
    bioFunction:
      "The eardrum converts air pressure waves into mechanical vibration. The ossicles amplify and transmit it. The cochlea's hair cells perform the final transduction — converting mechanical movement into electrochemical nerve signals. Stereo input enables directional hearing.",
    hardFunction:
      "The second microphone in the stereo audio input array. Both channels feed the same ADC pipeline, providing dual-channel input for spatial audio processing and directional signal mapping.",
    synthesis:
      "The same three-stage transduction chain: physical wave → analog electrical → digital signal. Biology and hardware arrived at identical architectures independently.",
    bioFunctionSimple:
      "Same conversion chain as the right ear. Having two ears at different positions is what lets your brain tell which direction a sound came from.",
    hardFunctionSimple:
      "The second microphone in a stereo pair. Two channels give the system enough information to figure out where a sound is coming from.",
    synthesisSimple:
      "Three-step conversion in both: physical wave → electrical signal → digital data. Same blueprint, biology and engineering.",
    spinalConnection:
      "Cranial nerve VIII (vestibulocochlear) — audio input bypasses the vertebral backbone, transmitted directly to the brainstem auditory processor via a dedicated cranial channel.",
    spinalConnectionSimple:
      "Wired directly to the brainstem, bypassing the spine entirely.",
  },
  {
    id: "vocal_cords",
    category: "sensory",
    type: "point",
    organ: "Vocal Cords",
    hardware: "DAC + Speaker / TTS Engine",
    position: [0, 1.49, 0.03],
    bioFunction:
      "Paired mucous membrane folds in the larynx that vibrate at precise frequencies when air passes through them. They do not generate the message — they are the final output encoder, converting internal neurological intent into a transmittable acoustic signal.",
    hardFunction:
      "The DAC converts internal digital signals into analog waveforms. The speaker converts those waveforms into physical pressure waves that propagate through air. Neither generates meaning — they encode and transmit what the system has already decided to say.",
    synthesis:
      "Output is always translation. Both are the last stage of a long internal process — the point where thought becomes signal becomes wave.",
    bioFunctionSimple:
      "Folds in the throat that vibrate when air passes through them. They don't decide what to say — they convert the brain's intent into actual sound. The final stop before words leave the body.",
    hardFunctionSimple:
      "Takes a digital sound file and converts it back into electrical signal. A speaker turns that signal into vibrating air. Neither chooses what to say — they just deliver the message.",
    synthesisSimple:
      "Output is always translation. Both are the last step of a long internal process — the moment thought becomes signal becomes sound.",
    spinalConnection:
      "Cranial nerve X (vagus) via the recurrent laryngeal and superior laryngeal branches — the audio output codec bypasses the spinal bus entirely, routed by dedicated cranial channel directly to the laryngeal hardware.",
    spinalConnectionSimple:
      "Connected directly to a cranial nerve — bypasses the spine. The voice doesn't travel through the spinal highway.",
  },
  {
    id: "skin",
    category: "sensory",
    type: "point",
    organ: "Skin",
    hardware: "Sensor Array / Haptic Interface",
    position: [0.14, 1.08, 0.02],
    bioFunction:
      "The body's largest organ. Distributed receptors for pressure, temperature, pain, and vibration across its entire surface, while simultaneously serving as the primary barrier against pathogens and a thermal interface with the environment.",
    hardFunction:
      "The sensor array monitors the system's external surface — temperature, pressure, contact, proximity. The haptic interface simultaneously provides tactile feedback. The chassis does three things at once: input device, physical barrier, and thermal interface.",
    synthesis:
      "One layer, three simultaneous functions. The boundary between system and environment was never passive in either case.",
    bioFunctionSimple:
      "The largest organ. Detects pressure, temperature, pain, and vibration across the whole body. Also keeps germs out and regulates how the body sheds heat. Three jobs, one layer.",
    hardFunctionSimple:
      "A network of sensors across a device's outer surface — measuring touch, temperature, proximity. Also the physical case that protects the inside, and the surface that gives off heat.",
    synthesisSimple:
      "One layer doing three things at once. The boundary between the system and the world has never been a passive barrier.",
    spinalConnection:
      "Distributed C2–S4 — the chassis sensor array taps every segment of the routing backbone simultaneously, reporting surface conditions across all 24 channel tiers.",
    spinalConnectionSimple:
      "Connects to every level of the spine at once. Every patch of skin reports back to its own nerve channel.",
  },

  // ── POWER (RED) ────────────────────────────────────────────────────────────
  {
    id: "thyroid",
    category: "power",
    type: "point",
    organ: "Thyroid",
    hardware: "System Clock (BCLK)",
    position: [0, 1.53, 0.03],
    bioFunction:
      "Secretes hormones that set the body's baseline metabolic rate — how fast every cell burns energy, synthesizes protein, and generates heat. Hyperthyroidism overclocks the body. Hypothyroidism throttles it below usable performance.",
    hardFunction:
      "The base clock sets the fundamental speed at which every component in the system operates. Raise it and everything accelerates — but heat and instability follow. Lower it and the system cools but slows. Every process is downstream of this signal.",
    synthesis:
      "Both set the operating tempo of every downstream process. The thyroid pulses its frequency through the meridian network — every cell synchronizes its metabolic speed to this beat. Both are small, unglamorous, and catastrophic when miscalibrated.",
    bioFunctionSimple:
      "Sets the metabolic speed of every cell — how fast they burn energy and generate heat. Too active and you feel wired and overheated. Too slow and you feel exhausted and cold.",
    hardFunctionSimple:
      "Sets the basic speed of the entire system. Turn it up: everything runs faster but heats up and becomes unstable. Turn it down: everything cools but slows.",
    synthesisSimple:
      "Both set the speed every other part runs at. The thyroid sends its rhythm through the meridian network like a metronome — every cell paces itself to that beat. Both are small, easy to overlook, and catastrophic when wrong.",
    spinalConnection:
      "T1–T3 thoracic channel (superior cervical ganglion via sympathetic chain) — preganglionic fibers originate in the upper thoracic cord, ascend through the cervical sympathetic chain, and synapse at the superior cervical ganglion before reaching the thyroid. The clock source is thoracic, even though the hardware sits in the neck.",
    spinalConnectionSimple:
      "The thyroid sits in the neck, but its nerve signals come from the upper back — the control line loops up from below before reaching the gland.",
  },
  {
    id: "heart",
    category: "power",
    type: "point",
    nodeColor: "#ff0a0a", // STYLE: rich crimson — richer than category power red
    organ: "Heart",
    focusZoom: 0.02,
    focusPanY: 0.25,
    hardware: "Power Supply Unit (PSU)",
    position: [0.01, 1.32, 0.06],
    femalePosition: [0.01, 1.3, -0.02],
    bioFunction:
      "The muscular pump delivering oxygenated blood to every cell in the body. Not because it thinks, but because everything that thinks requires continuous power delivery. It beats 100,000 times per day without instruction. Four minutes without it and the cortex begins to die.",
    hardFunction:
      "The power supply unit converts incoming current into stable, regulated voltage and distributes it to every component in the system. It is not the brain — it is the reason the brain can run at all. Everything dies when it stops.",
    synthesis:
      "Neither is the most complex component. Both are the most critical. The heart distributes its baseline current — Qi, in TCM terms — through the meridian power rails to every peripheral organ. The system does not degrade without it; it stops.",
    bioFunctionSimple:
      "The muscle that delivers oxygen-rich blood to every cell. It doesn't think; it just keeps everything else alive. Beats around 100,000 times a day, without instruction. Four minutes without it and the brain begins to die.",
    hardFunctionSimple:
      "Converts incoming electrical current into steady voltage and sends it to every component. Not the smartest part of the system — but the reason every other part can function. When it stops, everything stops.",
    synthesisSimple:
      "Neither is the most complicated part. Both are the most essential. The heart pumps the body's baseline electrical current through the meridian network — the wiring that keeps every other organ powered. If the heart stops, everything stops with it.",
    spinalConnection:
      "T1–T5 thoracic channel (cardiac accelerator nerve, sympathetic cardiac plexus) — the PSU assignment occupies the uppermost thoracic tier. The discs at T2–T4 are the precise bus lanes that control cardiac output.",
    spinalConnectionSimple:
      "The heart's rhythm is regulated by nerves coming out of the upper back — the same region of the spine that carries the strongest power-management signals.",
  },
  {
    id: "adrenals",
    category: "power",
    type: "point",
    organ: "Adrenal Glands",
    hardware: "Overclock Mechanism",
    position: [0, 1.12, -0.05],
    bioFunction:
      "Release adrenaline in response to stress — instantly spiking heart rate, blood pressure, muscle blood flow, and reaction speed. The body performs beyond its normal limits. Sustained activation causes cardiovascular damage, immune suppression, and burnout.",
    hardFunction:
      "Overclocking forces the CPU to run above its rated speed by increasing voltage and clock multiplier. Performance spikes dramatically — but thermal output rises, component wear accelerates, and sustained overclocking shortens hardware lifespan.",
    synthesis:
      "Both deliver emergency performance at the cost of long-term integrity. When a threat is detected, the adrenals flood the meridian power rails with a surge of current — temporarily overclocking the entire system above its safe operating limit. Both are designed for crisis, not cruise.",
    bioFunctionSimple:
      "Release adrenaline in a crisis — heart rate spikes, blood pressure surges, muscles get extra blood. You perform beyond your normal limits. Long-term, this wears the body down.",
    hardFunctionSimple:
      "Forces a chip to run faster than its rated speed. Bigger performance, but more heat, more wear, and a shorter lifespan. Designed for short bursts, not constant use.",
    synthesisSimple:
      "Both deliver emergency performance at the cost of long-term wear. The adrenals dump a surge of extra current into the meridian network, forcing the whole body to run faster than it was designed to — for a few minutes. Both are built for the crisis, not for cruising.",
    spinalConnection:
      "T5–T11 thoracic channel (greater splanchnic T5–T9, lesser splanchnic T10–T11) — the overclock trigger spans the mid-to-lower thoracic tier. The greater splanchnic nerve drives the adrenal medulla directly, bypassing any ganglion for maximum response speed. Emergency acceleration is hard-wired at the bus level.",
    spinalConnectionSimple:
      "Wired straight into the spine's emergency channel — the signal that triggers adrenaline skips most relays for maximum speed.",
  },

  // ── THERMAL (CYAN) ─────────────────────────────────────────────────────────
  {
    id: "left_lung",
    category: "thermal",
    type: "point",
    organ: "Left Lung",
    focusZoom: 0.02,
    focusPanY: 0.25,
    hardware: "Thermal Management (Heat Sink)",
    position: [-0.1, 1.26, 0.05],
    femalePosition: [-0.1, 1.18, -0.02],
    bioFunction:
      "Exchanges carbon dioxide — the metabolic waste product of cellular energy generation — for fresh oxygen. Every cell in the body generates heat and CO₂ as byproducts of work. The lungs clear the exhaust.",
    hardFunction:
      "The heat sink absorbs thermal energy generated by the CPU and dissipates it into the surrounding airspace. Without continuous airflow, components overheat and throttle. Sustained thermal overload causes permanent damage.",
    synthesis:
      "Both exist because energy conversion produces waste that must be removed continuously. The lungs vent the heat generated as current flows through the meridian power rails — every organ on the grid produces thermal byproduct, and this is where it leaves the system. Both are the reason the system can run at load without destroying itself.",
    bioFunctionSimple:
      "Takes in oxygen, pushes out carbon dioxide. Cells burn fuel; the lungs clear the exhaust. Without continuous exchange, the body chokes on its own waste.",
    hardFunctionSimple:
      "A piece of metal pressed against a hot chip. It pulls heat out of the chip and spreads it into the air. Without it, the chip overheats and slows down to protect itself.",
    synthesisSimple:
      "Both exist because making energy creates heat — and heat has to go somewhere. The lungs dump the thermal byproduct of every organ on the meridian network, breathing the exhaust out into the air. Both are why the system can keep running without destroying itself.",
    spinalConnection:
      "T2–T7 thoracic channel (pulmonary plexus) — the cooling array assignment spans the mid-thoracic tier, sharing routing bandwidth with the cardiac accelerator. Thermal and power management are co-located by design.",
    spinalConnectionSimple:
      "Controlled by the same mid-back spinal region that runs the heart. Power and cooling share the same nerve neighborhood.",
  },
  {
    id: "right_lung",
    category: "thermal",
    type: "point",
    organ: "Right Lung",
    focusZoom: 0.02,
    focusPanY: 0.25,
    hardware: "Thermal Management (Heat Sink)",
    position: [0.1, 1.26, 0.05],
    femalePosition: [0.1, 1.18, -0.02],
    bioFunction:
      "Exchanges carbon dioxide — the metabolic waste product of cellular energy generation — for fresh oxygen. The right lung is slightly larger than the left, compensating for the cardiac displacement.",
    hardFunction:
      "The second heat sink in the bilateral thermal management array. Both units absorb and dissipate thermal load, providing redundant cooling capacity at the same bus tier.",
    synthesis:
      "Both exist because energy conversion produces waste that must be removed continuously. The right lung mirrors the left's role in venting heat generated by current flowing through the meridian network — two cooling units share the thermal load. Both are the reason the system can run at load without destroying itself.",
    bioFunctionSimple:
      "Same job as the left lung — clearing carbon dioxide, bringing in oxygen. The right lung is slightly larger; the left makes room for the heart.",
    hardFunctionSimple:
      "The second cooling unit. Two heat sinks instead of one means more capacity and redundancy — if one struggles, the other shares the load.",
    synthesisSimple:
      "Same logic, mirrored. Running a system at full power without continuous cooling destroys it. Two lungs share the work of bleeding off the heat the meridian network generates as it carries current to every other organ.",
    spinalConnection:
      "T2–T7 thoracic channel (pulmonary plexus) — the second cooling array mirrors the left channel across bilateral mid-thoracic routing. Redundant thermal capacity at the same bus tier.",
    spinalConnectionSimple:
      "Same mid-back nerve region as the left lung — two redundant cooling units wired to the same level.",
  },
  {
    id: "diaphragm",
    category: "thermal",
    type: "point",
    organ: "Diaphragm",
    hardware: "Fan Controller",
    position: [0, 1.13, 0.06],
    bioFunction:
      "The primary muscle of respiration — contracting to expand lung volume, driving the entire breathing cycle. It responds to CO₂ levels in the blood, unconsciously adjusting rate and depth to match metabolic demand.",
    hardFunction:
      "The fan controller regulates fan speed in response to thermal load — accelerating airflow under heavy processing, slowing during idle, maintaining the rhythm of the entire cooling cycle.",
    synthesis:
      "Both regulate the rhythm of the cooling system. Neither generates the airflow — both determine when and how fast it moves.",
    bioFunctionSimple:
      "The muscle below your lungs that contracts to pull air in and relaxes to push it out. Adjusts speed automatically based on how hard you're working — without you having to think about it.",
    hardFunctionSimple:
      "Controls how fast the cooling fans spin. Working hard? Fan speeds up. Idling? Slows down. Sets the rhythm of the cooling system.",
    synthesisSimple:
      "Both set the pace of cooling. Neither generates the airflow — both decide how fast it moves.",
    spinalConnection:
      "C3–C5 cervical channel (phrenic nerve) — the fan controller assignment descends from the upper cervical tier to drive the primary ventilation mechanism, the longest single nerve in the routing backbone.",
    spinalConnectionSimple:
      "Controlled by a nerve from the upper neck that runs all the way down to the diaphragm — one of the longest single nerves in the body.",
  },

  // ── DIGESTIVE (GREEN) ──────────────────────────────────────────────────────
  {
    id: "esophagus",
    category: "digestive",
    type: "point",
    organ: "Esophagus",
    hardware: "Input Queue / Data Bus",
    position: [0, 1.26, -0.03],
    bioFunction:
      "A muscular tube that moves food from the mouth to the stomach via rhythmic contraction. It performs no digestion — its sole function is controlled, sequential delivery of raw input to the processing organ.",
    hardFunction:
      "The data bus segment between the input port and the parser. It performs no transformation — it ensures raw input arrives at the processing layer in sequence, without loss, and without collision.",
    synthesis:
      "The pipe between the port and the processor. Before anything can be understood, it must first be delivered — orderly, intact, in sequence.",
    bioFunctionSimple:
      "A muscular tube that moves food from mouth to stomach. Doesn't digest anything — it just delivers, in order, without losing anything on the way.",
    hardFunctionSimple:
      "The pipe between the input port and the part that actually processes the data. Doesn't change what's coming in — just makes sure it arrives in order and intact.",
    synthesisSimple:
      "The pipe between the entry point and the processor. Before anything can be understood, it has to arrive — orderly, intact, in sequence.",
    spinalConnection:
      "T5–T6 thoracic channel (upper splanchnic nerve) — the input queue assignment at the first digestive bus tier. The T5–T6 discs mark where the main bus begins routing signals to the GI processing segment.",
    spinalConnectionSimple:
      "The nerves that control swallowing come from the same area of the spine that handles the rest of digestion — all wired through the same branch.",
  },
  {
    id: "stomach",
    category: "digestive",
    type: "point",
    organ: "Stomach",
    hardware: "Parser / Compiler",
    position: [0.05, 1.12, 0.08],
    bioFunction:
      "Mechanically churns food and chemically breaks it down with acid and enzymes — converting complex raw material into a semi-digested slurry that the small intestine can extract nutrients from. It is the first stage of transformation.",
    hardFunction:
      "The parser takes raw input — text, binary, encoded data — and breaks it down into structured tokens the system can process. The compiler converts human-readable code into machine-executable instructions. Both transform raw input into usable form.",
    synthesis:
      "Neither produces the final output. Both convert raw input into a form the rest of the pipeline can work with.",
    bioFunctionSimple:
      "Churns food and breaks it down with acid and enzymes. Converts raw material into something the small intestine can extract nutrients from. First stage of transformation.",
    hardFunctionSimple:
      "Software that takes raw text or code and breaks it into pieces the computer can work with. Translates from human input to machine instructions. First transformation step in the pipeline.",
    synthesisSimple:
      "Neither produces the final result. Both convert raw input into something the rest of the system can use.",
    spinalConnection:
      "T6–T9 thoracic channel (celiac plexus, greater splanchnic) — the parser assignment occupies the same central splanchnic tier as the liver and pancreas. Tightly coupled co-processing is architectural.",
    spinalConnectionSimple:
      "Connects to the same mid-back nerve cluster that runs the liver and pancreas — these organs are wired tightly together by design.",
  },
  {
    id: "liver",
    category: "digestive",
    type: "point",
    nodeSize: "large", // STYLE: largest internal organ — larger node
    organ: "Liver",
    hardware: "Firewall / Data Filter",
    position: [-0.07, 1.18, 0.08],
    bioFunction:
      "Filters the entire blood supply — neutralizing toxins, metabolizing drugs, breaking down hormones, synthesizing proteins, and maintaining chemical balance. Everything absorbed from digestion passes through it before reaching circulation.",
    hardFunction:
      "The firewall inspects incoming data packets, filters threats, blocks unauthorized access, and sanitizes inputs before they reach the system's core. It maintains a continuously updated ruleset for what is safe to process.",
    synthesis:
      "Both are mandatory inspection layers that every input must pass through. Both protect the system from what looked like food but turned out to be poison.",
    bioFunctionSimple:
      "Filters everything absorbed from the gut. Neutralizes toxins, breaks down drugs, regulates hormones. Every meal passes through here before reaching the rest of the body.",
    hardFunctionSimple:
      "Inspects every piece of data coming into the system. Blocks threats, strips out anything suspicious, lets the safe stuff through. Constantly updated to recognize new dangers.",
    synthesisSimple:
      "Both are mandatory checkpoints. Both protect the rest of the system from what looked harmless but turned out to be dangerous.",
    spinalConnection:
      "T7–T9 thoracic channel (greater splanchnic nerve, celiac plexus) — the firewall assignment at the central splanchnic tier. Threat interception and processing occur in the same bus segment.",
    spinalConnectionSimple:
      "Wired into the same mid-back nerve region as the digestive system it protects. Inspection and processing happen on the same branch.",
  },
  {
    id: "gallbladder",
    category: "digestive",
    type: "point",
    organ: "Gallbladder",
    hardware: "Capacitor Bank / Crypto-Coprocessor",
    position: [-0.045, 1.15, 0.07],
    femalePosition: [-0.045, 1.1, 0.07],
    bioFunction:
      "Stores concentrated bile produced by the liver. When the small intestine encounters dense fat — the hardest material to break down — the gallbladder contracts and injects its concentrated charge directly into the pipeline to emulsify the load. It does not manufacture — it stores and discharges on demand.",
    hardFunction:
      "A capacitor bank stores concentrated electrical charge and discharges it rapidly when the system encounters a sudden heavy load — providing the burst current a component needs to process dense or complex data without the main supply dropping voltage.",
    synthesis:
      "Both are reservoir-discharge systems. Both sit adjacent to a filter. Both exist for one purpose: when the pipeline hits something too dense for normal throughput, release the stored concentration and force it through.",
    bioFunctionSimple:
      "Stores concentrated bile from the liver. When fatty food arrives, releases its load to break it apart. Doesn't make anything — it just holds and releases on demand.",
    hardFunctionSimple:
      "A group of components that store electrical charge and release it in a sudden burst when a chip needs more power than the main supply can deliver fast enough.",
    synthesisSimple:
      "Both are reservoir-and-release systems sitting next to the part they assist. Both exist for the moment something overwhelms normal flow.",
    spinalConnection:
      "T7–T9 thoracic channel (celiac plexus) — the capacitor bank co-routes with the firewall it serves. Concentrated discharge and threat filtering share the same bus segment by design.",
    spinalConnectionSimple:
      "Shares wiring with the liver next door — both connect through the same mid-back nerve branch.",
  },
  {
    id: "pancreas",
    category: "digestive",
    type: "point",
    organ: "Pancreas",
    hardware: "Voltage Regulator (VRM)",
    position: [-0.02, 1.06, 0.04],
    bioFunction:
      "Produces insulin and glucagon to regulate blood sugar — the body's primary energy currency. Without it, glucose spikes and crashes destabilize every cell. Uncontrolled, it is fatal.",
    hardFunction:
      "The voltage regulator module converts the PSU's raw output into the precise, stable voltage each component requires. A failing VRM causes system-wide instability — components receive inconsistent power and begin behaving unpredictably.",
    synthesis:
      "Both regulate the energy supply every downstream process depends on. The pancreas steps down the raw current carried by the meridian grid — modulating voltage so each tissue receives a stable, balanced load without overloading. Both failures look the same: not a sudden shutdown, but a progressive, system-wide unraveling.",
    bioFunctionSimple:
      "Releases insulin and glucagon to keep blood sugar steady. Without it, sugar levels spike and crash and the whole body destabilizes. Failure is fatal if untreated.",
    hardFunctionSimple:
      "A circuit that takes raw power from the supply and adjusts it to the precise voltage each chip needs. Different chips need different voltages — slightly wrong and the system gets weird.",
    synthesisSimple:
      "Both adjust the body's electrical current so every part gets the right amount. The pancreas tunes the voltage flowing through the meridian network — too much or too little either way and tissues start malfunctioning. Failure looks the same on both sides: not a sudden crash, but a slow, system-wide unraveling.",
    spinalConnection:
      "T6–T10 thoracic channel (greater and lesser splanchnic nerves) — the VRM assignment spans the full central splanchnic tier, reflecting its dual role regulating both energy input and digestive output.",
    spinalConnectionSimple:
      "Wired into the central mid-back nerve cluster — same branch as digestion, reflecting its double job regulating both energy and food processing.",
  },
  {
    id: "small_intestine",
    category: "digestive",
    type: "point",
    organ: "Small Intestine",
    hardware: "Data Bus / Processing Pipeline",
    position: [0, 1.05, 0.07],
    bioFunction:
      "Where 90% of nutrient absorption occurs — extracting glucose, amino acids, fatty acids, and vitamins from the digested slurry and passing them into the bloodstream for distribution. The longest stage of the pipeline.",
    hardFunction:
      "The data bus is the high-throughput channel through which processed data moves between components — extracting useful information from the parsed stream and forwarding it to storage, execution, and output subsystems.",
    synthesis:
      "Both are extraction and distribution stages. Neither transforms — both identify what's valuable and route it forward.",
    bioFunctionSimple:
      "Where most nutrients are pulled out of digested food and sent into the bloodstream. The longest section of the digestive tract.",
    hardFunctionSimple:
      "The high-speed channel that carries processed data between major parts of the computer. Pulls useful information out of the stream and forwards it where it needs to go.",
    synthesisSimple:
      "Both extract and distribute. Neither transforms anything — both decide what's valuable and route it forward.",
    spinalConnection:
      "T9–T11 thoracic channel (lesser splanchnic nerve) — the processing pipeline assignment at the lower splanchnic tier, where the primary extraction stage exits the thoracic bus segment.",
    spinalConnectionSimple:
      "Wired through the lower mid-back nerves — where the main extraction stage of the digestive branch exits the spine.",
  },
  {
    id: "large_intestine",
    category: "digestive",
    type: "point",
    organ: "Large Intestine",
    hardware: "Garbage Collector",
    position: [0, 0.97, 0.06],
    bioFunction:
      "Absorbs remaining water, compacts indigestible waste, and prepares it for elimination. It takes what the processing pipeline couldn't use and clears it from the system.",
    hardFunction:
      "The garbage collector identifies memory that is no longer referenced, marks it for deletion, and reclaims the space. It runs in the background, invisible until it doesn't — at which point memory fills and performance degrades.",
    synthesis:
      "Both clean up what the productive processes left behind. Both are invisible infrastructure that makes sustained operation possible.",
    bioFunctionSimple:
      "Absorbs leftover water, compacts what's left into waste, and prepares it for exit. Cleans up after the small intestine.",
    hardFunctionSimple:
      "A background process that finds memory the program isn't using anymore and frees it up. Invisible when it works — and the system slows to a crawl when it doesn't.",
    synthesisSimple:
      "Both clean up after the productive parts. Both are invisible infrastructure that makes long-term operation possible.",
    spinalConnection:
      "T11–L2 thoracolumbar channel (lumbar splanchnic nerve) — the garbage collector spans the thoracolumbar junction, bridging the thoracic and lumbar routing tiers. Cleanup is distributed across the transition zone.",
    spinalConnectionSimple:
      "Spans the spine's transition zone between the chest and lower back — cleanup work straddles two routing tiers.",
  },

  // ── RENAL (VIOLET) ─────────────────────────────────────────────────────────
  {
    id: "right_kidney",
    category: "renal",
    type: "point",
    organ: "Right Kidney",
    hardware: "Swap File / Virtual Memory",
    position: [-0.06, 1.07, -0.05],
    focusZoom: 0.18,
    focusPanY: 0.37,
    bioFunction:
      "Continuously filters the blood, removing metabolic waste products that accumulate as byproducts of the body's own operations. Unlike digestion, the kidneys clean what the body itself produces.",
    hardFunction:
      "The virtual memory manager — scanning RAM for stale data, moving it to disk to free active memory, retrieving it on demand. It manages the residue of the system's own computations.",
    synthesis:
      "Without something to continuously clean internal waste, both systems choke on the byproducts of their own operation. The kidneys filter the metabolic noise generated as current flows through the meridian network — spent ions, electrochemical residue, degraded fluid — clearing it before it can corrupt downstream signaling.",
    bioFunctionSimple:
      "Continuously filters the blood, removing waste the body itself produces during normal operation. Unlike digestion, which cleans incoming food, the kidneys clean the body's own internal byproducts.",
    hardFunctionSimple:
      "A system that moves rarely-used data out of fast memory and onto the slower disk, freeing space for what's actively needed. Manages the leftovers of the computer's own work.",
    synthesisSimple:
      "Without something to continuously clean up internal waste, both systems choke on their own byproducts. The kidneys filter the residue produced as electrical current runs through the meridian network — clearing it before it interferes with anything else.",
    spinalConnection:
      "T10–T12 thoracic channel (least splanchnic nerve, renal plexus) — the virtual memory assignment at the lowest thoracic tier, where the renal routing segment exits the main backbone toward the filtering hardware.",
    spinalConnectionSimple:
      "Wired to the lowest section of the chest spine — the branch where filtering nerves exit the backbone.",
  },
  {
    id: "left_kidney",
    category: "renal",
    type: "point",
    organ: "Left Kidney",
    hardware: "Swap File / Virtual Memory",
    position: [0.06, 1.09, -0.05],
    focusZoom: 0.18,
    focusPanY: 0.37,
    bioFunction:
      "Continuously filters the blood, removing metabolic waste products that accumulate as byproducts of the body's own operations. Bilateral redundancy — both kidneys can sustain life independently.",
    hardFunction:
      "The virtual memory manager — scanning RAM for stale data, moving it to disk to free active memory, retrieving it on demand. Redundant virtual memory channels provide fault tolerance.",
    synthesis:
      "Without something to continuously clean internal waste, both systems choke on the byproducts of their own operation. The left kidney mirrors the right's cleanup of metabolic residue generated by current flowing through the meridian grid — bilateral redundancy keeps filtration running even if one channel fails.",
    bioFunctionSimple:
      "Same job as the right kidney. Having two means you can lose one and keep living — built-in backup.",
    hardFunctionSimple:
      "A second memory-management channel running in parallel. Redundancy: if one fails, the other keeps the cleanup running.",
    synthesisSimple:
      "Two of each, by design. Both systems build in a backup so cleanup never fully stops. Each kidney can clear the meridian network's electrochemical residue on its own — losing one slows the work, but doesn't stop it.",
    spinalConnection:
      "T10–T12 thoracic channel (least splanchnic nerve, renal plexus) — the left virtual memory channel mirrors the right at the same vertebral tier. Bilateral redundancy in the filtering bus segment.",
    spinalConnectionSimple:
      "Mirrors the right kidney's wiring at the same spine level — two redundant filtering channels.",
  },
  {
    id: "bladder",
    category: "renal",
    type: "point",
    organ: "Bladder",
    hardware: "Output Buffer",
    position: [0, 0.91, 0.04],
    bioFunction:
      "Stores liquid waste filtered by the kidneys, accumulating it until voluntary release. It is a scheduled output operation, not a continuous stream.",
    hardFunction:
      "The output buffer holds processed data ready for transmission — accumulating until a threshold is reached or a flush is triggered, then releasing in a single controlled output event.",
    synthesis:
      "Both store output until conditions are right for transmission. Both are controlled release mechanisms, not constant drains.",
    bioFunctionSimple:
      "Stores liquid waste filtered by the kidneys until you decide to release it. Holds output until conditions are right — not a constant drip.",
    hardFunctionSimple:
      "A holding area where finished data piles up until it's ready to be sent out all at once.",
    synthesisSimple:
      "Both store output until conditions are right for release. Both are controlled discharges, not constant streams.",
    spinalConnection:
      "S2–S4 sacral channel (pelvic splanchnic nerves) — the output buffer assignment at the base of the routing backbone. The flush signal originates from the lowest tier of the spinal bus.",
    spinalConnectionSimple:
      "Wired to the very base of the spine — the release signal comes from the bottom tier of the body's nerve highway.",
  },

  // ── IMMUNE (TEAL) ──────────────────────────────────────────────────────────
  {
    id: "spleen",
    category: "immune",
    type: "point",
    organ: "Spleen",
    hardware: "SIEM (Central Threat Coordination)",
    position: [0.08, 1.1, -0.02],
    bioFunction:
      "Filters blood directly, identifying and destroying pathogens and aging red blood cells. Unlike lymph nodes which intercept threats in transit, the spleen processes the blood itself — a central clearing house where immune responses are coordinated at scale.",
    hardFunction:
      "The Security Information and Event Management system aggregates threat signals from across the network, correlates them into meaningful patterns, coordinates the response of the entire security infrastructure, and maintains the threat log.",
    synthesis:
      "Distributed sensors collect. The center coordinates. Both are the point where scattered threat signals become a unified response.",
    bioFunctionSimple:
      "Filters the blood directly, finding and destroying pathogens and worn-out red blood cells. The central clearing house where immune responses are organized at scale.",
    hardFunctionSimple:
      "Software that collects alerts from every security tool in a network, looks for patterns across them, and coordinates the response. Shows the big picture of what's happening.",
    synthesisSimple:
      "Sensors collect; the center coordinates. Both are where scattered alarms become a single unified response.",
    spinalConnection:
      "T6–T10 thoracic channel (celiac plexus) — the SIEM assignment co-routes with the digestive processing segment it monitors. Central threat coordination shares bus bandwidth with the systems it protects.",
    spinalConnectionSimple:
      "Wired into the same mid-back nerve branch as the digestive system it monitors — security shares wiring with what it protects.",
  },
  {
    id: "lymph_cervical",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Cervical)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.04, 1.51, 0.01],
    bioFunction:
      "A forward-deployed checkpoint in the neck where lymphatic fluid is filtered by immune cells before returning to circulation. Threats are intercepted at the periphery before reaching critical organs.",
    hardFunction:
      "An edge security node deployed at a network boundary — filtering and evaluating traffic before it enters the core system. The closer to the perimeter the interception, the less exposure to core infrastructure.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    bioFunctionSimple:
      "A checkpoint in the neck where lymph fluid is filtered by immune cells before returning to the bloodstream. Threats get intercepted at the periphery before they reach vital organs.",
    hardFunctionSimple:
      "A security checkpoint placed at the outer boundary of a network — inspecting traffic before it ever reaches the core systems. The earlier the catch, the less risk.",
    synthesisSimple:
      "Defense in depth. Neither system waits for threats to reach the center — both intercept at the boundary.",
    spinalConnection:
      "C2–C4 cervical channel — the topmost perimeter node assignment, stationed at the uppermost spinal tier where the backbone exits the skull. First checkpoint on the descending bus.",
    spinalConnectionSimple:
      "Wired to the very top of the spine, right where it exits the skull — the first checkpoint on the way down.",
  },
  {
    id: "lymph_axillary",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Axillary)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.16, 1.36, 0.02],
    bioFunction:
      "A distributed checkpoint in the armpit region filtering lymphatic fluid from the arm and upper chest before it returns to central circulation.",
    hardFunction:
      "A branch-office or DMZ perimeter node filtering lateral network traffic before it merges with the core network backbone.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    bioFunctionSimple:
      "A checkpoint in the armpit that filters lymph fluid from the arm and upper chest before it returns to central circulation.",
    hardFunctionSimple:
      "A security node guarding a side branch of the network before its traffic merges back into the main system.",
    synthesisSimple:
      "Defense in depth. Both intercept lateral traffic before it can reach the core.",
    spinalConnection:
      "C5–T1 cervicothoracic channel (brachial plexus territory) — the lateral perimeter node sits at the cervicothoracic junction, monitoring I/O traffic from the upper-limb peripheral segment before it re-enters the core.",
    spinalConnectionSimple:
      "Wired into the upper-chest spine level — monitors traffic from the arms before it rejoins the main system.",
  },
  {
    id: "lymph_inguinal",
    category: "immune",
    type: "point",
    organ: "Lymph Node (Inguinal)",
    hardware: "Edge Security — Perimeter Node",
    position: [0.08, 0.85, 0.03],
    bioFunction:
      "A checkpoint at the groin filtering lymphatic fluid from the lower extremities before it returns to central circulation.",
    hardFunction:
      "A southbound network perimeter node filtering traffic from lower-tier endpoints before it accesses the core.",
    synthesis:
      "Defense-in-depth. Neither system waits for threats to reach the center — forward checkpoints intercept at the boundary.",
    bioFunctionSimple:
      "A checkpoint at the groin filtering lymph fluid from the legs before it returns to central circulation.",
    hardFunctionSimple:
      "A security node guarding the southern branch of the network — checking traffic coming up from the lower endpoints before it accesses the core.",
    synthesisSimple:
      "Defense in depth. Both intercept incoming traffic before it can reach the center.",
    spinalConnection:
      "L1–L2 lumbar channel (inguinal nerve) — the southbound perimeter node assignment at the lower lumbar tier, the last checkpoint before peripheral traffic from the lower extremities re-enters the backbone.",
    spinalConnectionSimple:
      "Wired into the lower-back spine level — the last checkpoint before traffic from the legs rejoins the main system.",
  },
  {
    id: "bone_marrow",
    category: "immune",
    type: "point",
    organ: "Bone Marrow",
    hardware: "Antivirus Definition Update Engine",
    position: [0, 1.33, 0.09],
    bioFunction:
      "Soft tissue inside the sternum and major bones that manufactures all blood and immune cells — B-cells, T-cells, red blood cells. It does not fight pathogens directly. It produces the defenders, continuously generating cells with updated threat-recognition capabilities.",
    hardFunction:
      "The antivirus definition update engine. It does not scan or quarantine — it manufactures and distributes the updated signature databases the active scanning layer uses to recognize new attacks.",
    synthesis:
      "Without continuous production of updated defenders, the immune layer stagnates. Novel threats pass through unrecognized. Both systems require a factory, not just a fighter.",
    bioFunctionSimple:
      "The soft tissue inside bones that manufactures every blood and immune cell — including the white blood cells that recognize new threats. It doesn't fight pathogens; it produces the cells that do.",
    hardFunctionSimple:
      "The system that builds and pushes out updated lists of known threats. Doesn't scan or block anything — it just keeps the scanners current.",
    synthesisSimple:
      "Without continuous production of new defenders, the immune system goes stale. Both need a factory, not just fighters.",
    spinalConnection:
      "T2–T6 thoracic channel (intercostal nerves, sternal innervation) — the definition update engine is housed at the mid-thoracic tier, where the primary power and immune routing segments overlap. Production capacity and distribution share the same bus.",
    spinalConnectionSimple:
      "Housed in the breastbone and ribs — wired to the mid-chest spine, near where the body's other defense and power systems converge.",
  },
];
