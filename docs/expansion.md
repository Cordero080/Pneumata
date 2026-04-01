# Pneumata — Expansion Plan

## Deferred: Blood as Circulatory Volume Effect

**Organ:** Blood  
**Hardware Analog:** Data Packets / Electrical Current  
**Status:** Deferred — not represented as a node.

### Why deferred
Blood cannot be meaningfully represented as a point node. It is the medium itself — distributed throughout the entire vascular system. A single dot would misrepresent its nature.

### Proposed future implementation
In a future **Power viewMode** enhancement, Blood should be implemented as a **volumetric emissive fill** that pulses through the body mesh — separate from the current BodyCirculation orb effect. Options:

1. **Vertex color pulse** — Sample the GLB's existing geometry and animate a red emissive wash that travels from heart outward along the mesh surface, using a distance-from-heart shader or a texture scroll effect.

2. **Second body mesh layer** — A slightly larger duplicate of `male-body.glb` with a red emissive material and very low opacity (~0.05), pulsing in sync with the heartbeat counter (`heartbeatRef`). This creates a "blood glow" aura underneath the glass body without requiring a shader.

3. **Particle system** — Small red particles emitted from the heart node, traveling along the BodyCirculation paths and fading out at the extremities — explicitly visualizing blood as the carrier medium flowing through the circulatory paths.

**Recommended approach:** Option 2 (second mesh layer) — lowest complexity, consistent with the existing glass material architecture, and visually coherent with the current emissive body glow already implemented in `AnatomyModel.jsx`.

---

## Remaining Analogs Not Yet Placed

The following organs from `analog.md` are fully defined but not yet added to `organs.js`. These are candidates for the next expansion pass:

| Organ | Category | Hardware Analog |
|---|---|---|
| Cerebellum | logic | Clock Crystal (Oscillator) |
| Peripheral Nerves | logic | Data Cables (USB/SATA) |
| Synapses | logic | Transistors (Logic Gates) — distributed |
| Mouth | digestive | Input Port (Keyboard/HID) |
| Gallbladder | digestive | Crypto-Coprocessor / Capacitor Bank |
| Rectum | digestive | Trash Bin / Cache Dump |
| Arteries & Veins | power | Circuit Traces — distributed |
| Capillaries | power | Micro-Traces / Pins — distributed |
| Skeleton | structural | Chassis / Case — distributed |
| Muscles | structural | Actuators / Servo Motors — distributed |
| Tendons | structural | Ribbon Cables — distributed |
| Joints | structural | Hinges / Brackets — distributed |
| Immune System (general) | immune | Antivirus / IDS |

### Recommended next additions (point-representable)
- **Cerebellum** — posterior base of skull, logic category
- **Peripheral Nerves** — representative node at major plexus (brachial), logic category
- **Mouth** — anterior face, superior, digestive category
- **Gallbladder** — right upper abdomen below liver, digestive category
- **Rectum** — pelvic posterior, digestive category

### Distributed organs — strategy needed
Arteries & Veins, Capillaries, Skeleton, Muscles, Tendons, Joints, Synapses: these require special rendering modes (overlays, line networks, or surface effects) rather than point nodes. Recommend a dedicated **Structural viewMode** that activates a wireframe or skeletal overlay on the GLB mesh.
