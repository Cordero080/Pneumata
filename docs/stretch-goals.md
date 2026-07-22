# Pneumata — Stretch Goals

These are post-MVP enhancements. (Note: the old "procedural figure" goals below
predate the current GLB body + meridian system and are partly done — kept for
history.)

---

## ⚠️ In progress: Meridians (finish before the meridian stretch goals)

The meridian system is **not finished**. Before building meridian features
(qi flow, five elements, horary clock), the placement + routing work has to be
completed:

- **Node placement is incomplete.** Not every acupoint is accurately placed
  yet. Verified points are marked with a ✅ in `meridians.js` /
  `femaleMeridians.js`; "new" tags mark freshly-corrected female coords.
- **Bézier curvature is only done for some regions.** Arms, neck, and parts of
  the legs are routed; other segments are still straight or rough — on **both**
  the male and female figures.
- Male lives in `src/data/meridians.js`, female in
  `src/data/femaleMeridians.js` (WYSIWYG — what's in the file renders; no
  runtime transform). Routing/curve logic and the guide constants are in
  `src/components/organs/MeridianPaths.jsx`.

### How to resume (the method — see `docs/directing-a-blind-ai.md`)

1. **Anchors as sonar.** Use the ✅-verified nodes + organ nodes (lymph,
   thyroid) + skeletal landmarks (spinal discs like C5–C6, the elbow) as fixed
   reference points. Route curves _between_ known-good anchors.
2. **Translate visual → coordinate.** "This line looks wrong" isn't actionable;
   "route it through the C5–C6 disc / the cervical lymph node" is. Convert the
   anatomical judgment into a point, then curve through it.
3. **The tools in `MeridianPaths.jsx`:**
   - `arcThroughGuide(p0, guide, p2)` — QuadraticBezier that PASSES THROUGH a
     single interior guide at its midpoint. Good when the guide is roughly the
     geometric midpoint (else it over-warps — see TW arm).
   - `curveThrough([...points])` — centripetal Catmull-Rom through many points.
     Good for smoothing a run of nodes / multiple guides.
   - Guide constants (`CERVICAL_LYMPH`, `GB_NECK`, etc.) have a
     `FEMALE_*` variant selected by `femaleMode`. Add a female variant for any
     new guide.
4. **Verify without eyes:** after each change, `curl` the dev-server URL of the
   file and grep for compile errors, and `node --input-type=module` import the
   data file to confirm it parses.
5. **Know when to revert.** If a change makes it worse, `git checkout` the file
   back to the last commit rather than layering fixes (the male→female
   auto-transform was reverted this way).

Only once placement + routing are solid should the meridian visual features
below get built on top.

---

## GLTF Wireframe Silhouette (Replace Procedural Figure)

**What:** Swap the procedural head/torso/limbs geometry for a real `.glb` 3D human model rendered in wireframe mode.

**Why:** The procedural figure is a great MVP but a real mesh will have anatomically correct proportions, natural curves, and a more immersive feel.

**How to find a model:**
- [Sketchfab](https://sketchfab.com) — filter by "CC0" license, search "human body anatomy" or "human wireframe"
- [Mixamo](https://mixamo.com) — free rigged human models (requires Adobe account)
- [Kenney.nl](https://kenney.nl) — free CC0 game assets
- Target: a low-poly human torso/full body `.glb`, ideally under 5MB

**Implementation steps:**
1. Drop the `.glb` file into `/public/models/`
2. Install (already have drei): `useGLTF` hook is in `@react-three/drei`
3. Create `src/components/WireframeModel.jsx`:
```jsx
import { useGLTF } from '@react-three/drei'
import { MeshBasicMaterial } from 'three'

function WireframeModel() {
  const { scene } = useGLTF('/models/human.glb')

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new MeshBasicMaterial({
        color: '#00f5ff',
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
    }
  })

  return <primitive object={scene} scale={1} position={[0, 0, 0]} />
}

export default WireframeModel
```
4. Add `<WireframeModel />` to `Scene.jsx`, remove `<WireframeHuman />`
5. Re-tune node positions in `organs.js` to match the real model's anatomy

**Gotchas:**
- GLTF models ship in Y-up space — may need `rotation={[-Math.PI / 2, 0, 0]}` depending on the exporter
- Large models will tank performance — keep poly count low, aim for <10k triangles
- `useGLTF.preload('/models/human.glb')` at the bottom of the file eliminates load flash

---

## Vertebral Arch — Close the Ring

**What:** Add laminae — two short struts connecting each transverse process back to the base of the spinous process — forming the complete posterior arch that encloses the vertebral canal.

**Why:** The vertebrae currently read well as individual structures but are still isolated pieces. The transverse processes float disconnected from the spinous process. Closing the arch makes each vertebra a complete anatomical unit and visually forms the protective tunnel around the spinal cord — which is the whole point of the posterior arch anatomically.

**How:** Each lamina is a thin cylinder (or line) running from `transverseCenter ± offset` to `spinousBase`. The geometry can be two `CylinderGeometry` segments per vertebra, oriented with `setFromUnitVectors` toward the spinous process base. Taper and opacity should match the existing process material.

---

## Nerve Roots — Spine as Visible Bus

**What:** Thin lines radiating from each disc level toward the organ nodes they innervate, fading out as they approach the organ.

**Why:** This is where the visual and conceptual payoff lives. Right now the spine and the organ nodes exist in parallel but aren't visibly connected. Nerve roots would make the spine literally function as the PCIe bus it represents — visible signal paths branching out to each organ. The `spinalConnection` field already exists on every organ object with the exact innervation level; the data is there.

**How:** For each organ, find the disc index matching its `spinalConnection` level, draw a `<Line>` from that disc position to the organ node position, animate opacity in sync with the organ's active state or the view mode.

---

## Orb → Meridian Energy Vortexes (Breath Exchange)

**What:** Reframe some of the ambient background orbs (SceneOrbs) as external
*energetic vortexes* that exchange qi with the body — subtle "energetic lung"
funnels that **absorb from the ether and repel from the body** on a cycle, like
breathing. On each cycle, an orb-vortex would funnel energy into a specific
meridian (which absorbs), and another meridian would repel energy back out —
following the TCM organ-clock / element cycle order.

**Open design questions (why it's a whole feature, not a tweak):**
- Which meridians absorb vs repel, and in what sequence? (Tie to the 12-meridian
  qi cycle: LU→LI→ST→SP→HT→SI→BL→KD→PC→TW→GB→LV→LU, and/or the Five-Element
  generating/controlling cycles.)
- Sync to the existing breath cycle (breathingRef) — inhale = absorb, exhale =
  repel?
- Cross-layer coordination: the orb field (SceneOrbs) and the meridian layer
  (MeridianLayer/MeridianPaths) would need to talk (which orb funnels into which
  meridian, timing).
- Visual: a funnel/spiral from an orb into a meridian entry point; color for
  receiving vs extending.

**Prerequisite:** the orb field must be performant first (done — converted to
instanced meshes). Build on top of that, not the old per-orb version.

**Depends on:** meridian placement/routing finished (see the WIP note at top).

---

## Meridian Horary Clock (Time-of-Day Activation)

**What:** In TCM the "organ clock" cycles qi through the twelve meridians, each
peaking in a 2-hour window (e.g. Lung 3–5am, Large Intestine 5–7am, … around the
full 24h). Highlight the currently-"active" meridian based on the real time of
day — brighten its line/nodes, dim the rest, and label the window.

**Why:** Nearly free on data (just a 12-entry id→hour-range table), conceptually
rich, and it makes the model feel alive/temporal. Ties the meridian layer to
something real (the clock) rather than being purely spatial.

**Feasible because:** all twelve bilateral meridians already have stable ids and
an `element`; the render already supports per-meridian dimming/highlight
(`activeMeridian`). Add a horary table, read `new Date().getHours()`, map to the
active meridian, drive the existing highlight.

**Depends on:** meridian placement + routing being finished first (see the WIP
note at the top).

---

## Other Stretch Goals

### Sound Design
- Subtle tone/chime on node click (Web Audio API, no library needed)
- Different pitch per organ to create a musical anatomy map

### Organ Search / Filter
- Top-right search input to highlight matching nodes
- Filter by system: Nervous, Digestive, Circulatory

### Full Anatomical Map
- Target: 20+ organs covering all major systems
- Systems to add: Endocrine, Immune, Reproductive, Skeletal

### Share / Deep Link
- URL param `?organ=heart` opens the modal directly on load
- Shareable links for individual organ cards

### Mobile Polish
- Pinch-to-zoom gesture support
- Modal redesigned as bottom sheet on small screens
- Touch-friendly hit targets (increase node collision sphere size)

### Animated Entry
- Nodes fade in staggered on load (delay based on index)
- Wireframe silhouette draws itself in (use a shader or sequential edge reveal)
