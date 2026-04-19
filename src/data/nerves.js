// =============================================================================
// Peripheral Nervous System — nerve data
//
// Concept: each nerve is a signal channel rooted in the spinal bus (PCIe).
// Plexuses are bus hubs/multiplexers. Terminal branches are sensor/actuator arrays.
//
// Landmark keys must match what sampleBodyLandmarks() extracts from the GLB.
// spinalLevels must match SPINAL_LEVELS disc IDs in SpinalCord / DiscMarkers.
// =============================================================================

// Plexus hub definitions — convergence points between spine and trunk nerves.
// position key references a body landmark for placement.
export const PLEXUSES = {
  cervical: {
    id: "cervical_plexus",
    spinalLevels: ["C2", "C3", "C4"],
    landmark: "neck_left", // bilateral — rendered mirrored
    analog: "USB Hub — cranial/cervical I/O concentrator",
  },
  brachial: {
    id: "brachial_plexus",
    spinalLevels: ["C5", "C6", "C7", "C8", "T1"],
    landmark: "axilla_left",
    analog: "PCIe/USB Expansion Hub — upper-limb bus concentrator",
  },
  lumbar: {
    id: "lumbar_plexus",
    spinalLevels: ["L1", "L2", "L3", "L4"],
    landmark: "groin_left",
    analog: "PCIe Switch — anterior lower-limb channel router",
  },
  sacral: {
    id: "sacral_plexus",
    spinalLevels: ["L4", "L5", "S1", "S2"],
    landmark: "hip_left",
    analog: "PCIe x16 Root Complex — posterior lower-limb trunk router",
  },
};

// =============================================================================
// Nerve entries
//
// Each nerve: {
//   id           — unique
//   name         — anatomical name
//   side         — "left" | "right" | "bilateral"
//   spinalLevels — disc IDs this nerve roots from
//   landmarks    — ordered landmark keys the Catmull-Rom spline passes through
//                  (start = disc exit point, end = terminal region)
//   plexus       — PLEXUSES key if this nerve routes through a hub (or null)
//   category     — maps to category color (logic, power, thermal, etc.)
//   signal       — "efferent" | "afferent" | "mixed"
//   pulseSpeed   — traveling signal dot speed multiplier
//   pulseCount   — simultaneous dots on this nerve
//   viewModes    — which view modes render this nerve
//   analog       — { component, function } hardware parallel
// }
// =============================================================================

export const nerves = [
  // ─── CERVICAL — PHRENIC ──────────────────────────────────────────────────

  {
    id: "phrenic_left",
    name: "Phrenic Nerve",
    side: "left",
    spinalLevels: ["C3", "C4", "C5"],
    landmarks: [], // descends medially alongside spine to diaphragm — no lateral landmark
    plexus: "cervical",
    category: "thermal", // drives diaphragm → gas exchange → thermal
    signal: "mixed",
    pulseSpeed: 0.55,
    pulseCount: 2,
    viewModes: ["logic", "breathing", "unified"],
    analog: {
      component: "Clock Distribution Line",
      function:
        "Drives the respiratory oscillator — the body's master timing signal. " +
        "C3, C4, C5 keep the diaphragm alive. Lose this bus and the CPU halts. " +
        "Cervical injury above C3 = clock signal lost = ventilator dependency.",
    },
  },
  {
    id: "phrenic_right",
    name: "Phrenic Nerve",
    side: "right",
    spinalLevels: ["C3", "C4", "C5"],
    landmarks: [],
    plexus: "cervical",
    category: "thermal",
    signal: "mixed",
    pulseSpeed: 0.55,
    pulseCount: 2,
    viewModes: ["logic", "breathing", "unified"],
    analog: {
      component: "Clock Distribution Line",
      function:
        "Right-side respiratory clock channel. Mirrors left phrenic — redundant clock pair.",
    },
  },

  // ─── BRACHIAL PLEXUS — UPPER LIMB ────────────────────────────────────────

  {
    id: "median_left",
    name: "Median Nerve",
    side: "left",
    spinalLevels: ["C6", "C7", "C8", "T1"],
    landmarks: ["axilla_left", "elbow_left", "wrist_left"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.1,
    pulseCount: 3,
    viewModes: ["logic", "unified"],
    analog: {
      component: "I²C Data Line — Primary",
      function:
        "Precision motor control and fine sensory feedback to fingers 1–3 and the thumb. " +
        "High-frequency bidirectional serial bus for hand manipulation. " +
        "Carpal tunnel syndrome = bus contention from physical compression — packet loss at the wrist.",
    },
  },
  {
    id: "median_right",
    name: "Median Nerve",
    side: "right",
    spinalLevels: ["C6", "C7", "C8", "T1"],
    landmarks: ["axilla_right", "elbow_right", "wrist_right"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.1,
    pulseCount: 3,
    viewModes: ["logic", "unified"],
    analog: {
      component: "I²C Data Line — Primary",
      function: "Right-hand precision channel. Mirror of left median.",
    },
  },

  {
    id: "ulnar_left",
    name: "Ulnar Nerve",
    side: "left",
    spinalLevels: ["C8", "T1"],
    landmarks: ["axilla_left", "elbow_left", "wrist_left"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.9,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "I²C Data Line — Secondary",
      function:
        "Fingers 4–5 motor and sensory + all intrinsic hand muscles. The auxiliary serial channel. " +
        "Compression at the medial epicondyle (cubital tunnel) = bus contention: tingling in ring/pinky = " +
        "late ACK or dropped packets on the secondary I²C line.",
    },
  },
  {
    id: "ulnar_right",
    name: "Ulnar Nerve",
    side: "right",
    spinalLevels: ["C8", "T1"],
    landmarks: ["axilla_right", "elbow_right", "wrist_right"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.9,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "I²C Data Line — Secondary",
      function: "Right-hand auxiliary channel. Mirror of left ulnar.",
    },
  },

  {
    id: "radial_left",
    name: "Radial Nerve",
    side: "left",
    spinalLevels: ["C5", "C6", "C7", "C8"],
    landmarks: ["shoulder_left", "elbow_left", "wrist_left"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.0,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "SPI Clock Line",
      function:
        "Extension of wrist and fingers — the clock master of the upper limb. " +
        "Spirals around the humerus in the radial groove. " +
        "Saturday night palsy (arm over chair back) = SPI clock line physically pinched = " +
        "wrist drop, all downstream SPI peripherals unresponsive.",
    },
  },
  {
    id: "radial_right",
    name: "Radial Nerve",
    side: "right",
    spinalLevels: ["C5", "C6", "C7", "C8"],
    landmarks: ["shoulder_right", "elbow_right", "wrist_right"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.0,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "SPI Clock Line",
      function: "Right-arm SPI clock channel. Mirror of left radial.",
    },
  },

  {
    id: "axillary_left",
    name: "Axillary Nerve",
    side: "left",
    spinalLevels: ["C5", "C6"],
    landmarks: ["axilla_left", "shoulder_left"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.8,
    pulseCount: 1,
    viewModes: ["logic", "unified"],
    analog: {
      component: "GPIO Header — Shoulder Array",
      function:
        "Deltoid and teres minor. Short-range general-purpose I/O channel from the brachial hub " +
        "to the shoulder actuator array. Shoulder dislocation = connector physically yanked.",
    },
  },
  {
    id: "axillary_right",
    name: "Axillary Nerve",
    side: "right",
    spinalLevels: ["C5", "C6"],
    landmarks: ["axilla_right", "shoulder_right"],
    plexus: "brachial",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.8,
    pulseCount: 1,
    viewModes: ["logic", "unified"],
    analog: {
      component: "GPIO Header — Shoulder Array",
      function: "Right shoulder GPIO channel. Mirror of left axillary.",
    },
  },

  // ─── THORACIC — INTERCOSTAL ──────────────────────────────────────────────
  // Abbreviated to representative levels — full set would be T2–T12 bilateral.

  {
    id: "intercostal_t4_left",
    name: "Intercostal Nerve T4",
    side: "left",
    spinalLevels: ["T4"],
    landmarks: [], // wraps around torso — lateral offset from disc, no extremity landmarks
    plexus: null,
    category: "thermal",
    signal: "mixed",
    pulseSpeed: 0.45,
    pulseCount: 1,
    viewModes: ["unified"],
    analog: {
      component: "Ground Plane Trace",
      function:
        "Lateral thoracic wall motor and sensory. The distributed reference layer of the motherboard. " +
        "Intercostals are everywhere, noticed only when missing (post-thoracotomy pain = ground plane cut).",
    },
  },
  {
    id: "intercostal_t4_right",
    name: "Intercostal Nerve T4",
    side: "right",
    spinalLevels: ["T4"],
    landmarks: [],
    plexus: null,
    category: "thermal",
    signal: "mixed",
    pulseSpeed: 0.45,
    pulseCount: 1,
    viewModes: ["unified"],
    analog: {
      component: "Ground Plane Trace",
      function: "Right thoracic ground plane channel.",
    },
  },

  // ─── LUMBAR PLEXUS ───────────────────────────────────────────────────────

  {
    id: "femoral_left",
    name: "Femoral Nerve",
    side: "left",
    spinalLevels: ["L2", "L3", "L4"],
    landmarks: ["groin_left", "knee_left"],
    plexus: "lumbar",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.85,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x4 Lane — Anterior Lower",
      function:
        "Quadriceps motor drive (knee extension) plus anterior thigh and medial leg sensation. " +
        "Mid-bandwidth channel powering the primary standing and locomotion actuators. " +
        "Femoral neuropathy = PCIe x4 lane fault: knee buckles, climb stairs impossible.",
    },
  },
  {
    id: "femoral_right",
    name: "Femoral Nerve",
    side: "right",
    spinalLevels: ["L2", "L3", "L4"],
    landmarks: ["groin_right", "knee_right"],
    plexus: "lumbar",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.85,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x4 Lane — Anterior Lower",
      function: "Right-leg anterior channel. Mirror of left femoral.",
    },
  },

  {
    id: "obturator_left",
    name: "Obturator Nerve",
    side: "left",
    spinalLevels: ["L2", "L3", "L4"],
    landmarks: ["groin_left"],
    plexus: "lumbar",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.6,
    pulseCount: 1,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x1 Lane — Medial Thigh",
      function:
        "Hip adductor motor control. Narrow-bandwidth lane for thigh approximation. " +
        "Damaged in pelvic fractures — adductor paralysis = medial bus dropout.",
    },
  },
  {
    id: "obturator_right",
    name: "Obturator Nerve",
    side: "right",
    spinalLevels: ["L2", "L3", "L4"],
    landmarks: ["groin_right"],
    plexus: "lumbar",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.6,
    pulseCount: 1,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x1 Lane — Medial Thigh",
      function: "Right medial thigh channel. Mirror of left obturator.",
    },
  },

  // ─── SACRAL PLEXUS — SCIATIC SYSTEM ─────────────────────────────────────

  {
    id: "sciatic_left",
    name: "Sciatic Nerve",
    side: "left",
    spinalLevels: ["L4", "L5", "S1", "S2", "S3"],
    landmarks: ["hip_left", "posterior_thigh_left", "knee_left"],
    plexus: "sacral",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.3,
    pulseCount: 4, // widest nerve in the body → most signal dots
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x16 Trunk — Primary Lower Bus",
      function:
        "The body's widest peripheral channel — 2cm diameter at the hip. Carries full motor authority " +
        "over the entire lower limb. Bifurcates at the knee into tibial (sole) and common peroneal " +
        "(dorsum) — equivalent to a PCIe switch splitting downstream to two endpoint devices. " +
        "Piriformis compression = physical bus pinch: sciatica = sustained interrupt storm.",
    },
  },
  {
    id: "sciatic_right",
    name: "Sciatic Nerve",
    side: "right",
    spinalLevels: ["L4", "L5", "S1", "S2", "S3"],
    landmarks: ["hip_right", "posterior_thigh_right", "knee_right"],
    plexus: "sacral",
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.3,
    pulseCount: 4,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe x16 Trunk — Primary Lower Bus",
      function: "Right-leg primary bus. Mirror of left sciatic.",
    },
  },

  {
    id: "tibial_left",
    name: "Tibial Nerve",
    side: "left",
    spinalLevels: ["L4", "L5", "S1", "S2", "S3"],
    landmarks: ["knee_left", "calf_left", "ankle_left"],
    plexus: null, // branches from sciatic at knee — not a plexus hub
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.0,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe Downstream Port A — Plantar Array",
      function:
        "Plantar flexion (gastrocnemius, soleus) and sole sensation. " +
        "One of two endpoint channels after the sciatic switch at the knee. " +
        "Tarsal tunnel compression = downstream port A CRC errors: sole numbness, weak push-off.",
    },
  },
  {
    id: "tibial_right",
    name: "Tibial Nerve",
    side: "right",
    spinalLevels: ["L4", "L5", "S1", "S2", "S3"],
    landmarks: ["knee_right", "calf_right", "ankle_right"],
    plexus: null,
    category: "logic",
    signal: "mixed",
    pulseSpeed: 1.0,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe Downstream Port A — Plantar Array",
      function: "Right plantar channel. Mirror of left tibial.",
    },
  },

  {
    id: "peroneal_left",
    name: "Common Peroneal Nerve",
    side: "left",
    spinalLevels: ["L4", "L5", "S1", "S2"],
    landmarks: ["knee_left", "ankle_left"],
    plexus: null,
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.9,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe Downstream Port B — Dorsal Array",
      function:
        "Dorsiflexion and dorsum sensation. Wraps the fibular head — " +
        "tight cast or prolonged cross-legged sitting = physical bus pinch. " +
        "Foot drop = Port B offline: dorsal array unresponsive, gait pattern corrupted.",
    },
  },
  {
    id: "peroneal_right",
    name: "Common Peroneal Nerve",
    side: "right",
    spinalLevels: ["L4", "L5", "S1", "S2"],
    landmarks: ["knee_right", "ankle_right"],
    plexus: null,
    category: "logic",
    signal: "mixed",
    pulseSpeed: 0.9,
    pulseCount: 2,
    viewModes: ["logic", "unified"],
    analog: {
      component: "PCIe Downstream Port B — Dorsal Array",
      function: "Right dorsal channel. Mirror of left peroneal.",
    },
  },

  // ─── AUTONOMIC ───────────────────────────────────────────────────────────

  {
    id: "sympathetic_chain",
    name: "Sympathetic Chain",
    side: "bilateral",
    spinalLevels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
      "L1",
      "L2",
    ],
    landmarks: [], // paravertebral — rendered as a parallel trace alongside spine
    plexus: null,
    category: "power", // fight/flight = power management
    signal: "efferent",
    pulseSpeed: 1.8, // fast burst signaling
    pulseCount: 5,
    viewModes: ["power", "unified"],
    analog: {
      component: "PMBus — Power Management Bus",
      function:
        "Paravertebral ganglia chain running alongside the spinal PCIe bus. " +
        "The body's power management controller: regulates heart rate, blood pressure, " +
        "vasoconstriction, pupil dilation, sweat gland output, and piloerection. " +
        "Whispering voltage commands to every subsystem in parallel with the data bus. " +
        "Sympathetic storm = runaway PMBus flood: hypertensive crisis, hyperthermia, tachycardia.",
    },
  },

  {
    id: "vagus_left",
    name: "Vagus Nerve (CN X)",
    side: "left",
    spinalLevels: [], // cranial nerve — brainstem origin, not spinal
    landmarks: ["neck_left"], // descends lateral to carotid, into thorax, abdomen
    plexus: null,
    category: "power", // parasympathetic = rest/digest = power regulation
    signal: "mixed",
    pulseSpeed: 0.38, // slow tonic modulation
    pulseCount: 2,
    viewModes: ["power", "breathing", "unified"],
    analog: {
      component: "ACPI / Platform Controller Hub",
      function:
        "The longest nerve in the body — bypasses the spinal bus entirely. " +
        "Direct brainstem line to the heart, lungs, esophagus, stomach, and large intestine. " +
        "Slow-clocked platform management: resting heart rate, gastric motility, inflammatory tone. " +
        "80% of fibers are afferent — the body reports to the brain, not the other way around. " +
        "Vagal tone = system idle efficiency. Vagal syncope = ACPI putting the system to sleep.",
    },
  },
  {
    id: "vagus_right",
    name: "Vagus Nerve (CN X)",
    side: "right",
    spinalLevels: [],
    landmarks: ["neck_right"],
    plexus: null,
    category: "power",
    signal: "mixed",
    pulseSpeed: 0.38,
    pulseCount: 2,
    viewModes: ["power", "breathing", "unified"],
    analog: {
      component: "ACPI / Platform Controller Hub",
      function: "Right vagal trunk. Slightly more cardiac-dominant than left.",
    },
  },
];
