# Pneumata — Stretch Goals

These are post-MVP enhancements. The current build uses a programmatic wireframe silhouette (Three.js primitives). The goals below are for when the core experience is fully polished.

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
