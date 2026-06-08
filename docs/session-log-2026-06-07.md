# Session Log — 2026-06-07

## Summary

Added stomach 3D model, compressed organ GLBs, implemented organ-level performance culling, fixed mobile DPR, and corrected the brain zoom camera target.

---

## New organs

### StomachModel — `src/components/stomach/StomachModel.jsx`

Created component following the same pattern as LiverModel and KidneysModel:
- Clones original GLB materials (`child.material.clone()`) to preserve textures
- Positioned with constants at top of file for easy tweaking
- Rotation: `(-0.15, 0, -0.2)` — slight backward tilt + clockwise roll
- Wired into `Scene.jsx` alongside other organ models

**Compression:** 29MB → 2.3MB via `npx @gltf-transform/cli optimize --compress draco stomach.glb stomach-opt.glb`

### Lungs re-compression

User decimated `lungs-final.glb` in Blender at 0.6 ratio (as low as bronchial tree geometry allows without branch collapse). Re-exported at 82MB raw, compressed to ~10MB with Draco. Vertex count: 5.9M → 3.8M render vertices.

**Finding:** Blender re-export creates split normals at sharp edges, producing less Draco-efficient geometry than the original mesh. The compression floor for this particular bronchial tree model is ~10MB. Further reduction requires more aggressive decimation (0.3–0.4 ratio) or a different base mesh.

---

## Performance fixes (2026-06-07) — commit `91da9ff`

### Problem
Selecting any organ (heart, kidney, etc.) triggered a camera close-up. At close range, the foregrounded organ filled more screen pixels, causing visible lag — especially on mobile. All other organ 3D models continued rendering at full cost even though they were off-screen or irrelevant.

### Root causes identified
1. **All organ models rendered every frame regardless of camera state** — transparent meshes with `depthWrite: false` bypass Three.js frustum culling, so off-screen organs still run vertex + fragment shaders
2. **`useFrame` material lerps fired every frame even when opacity was already settled** — `m.opacity += (target - m.opacity) * 0.06` never stops because it never reaches exactly 0
3. **Mobile DPR was 1.5×** — on a Retina phone, 1.5× means 2.25× the pixel count vs 1×
4. **Glow clones (heart, lungs) always traversed** — even when opacity was 0, the clone objects were still in the render queue

### Fixes applied

#### 1. Mobile DPR capped at 1 — `Scene.jsx`
```js
// Before
dpr={[1, window.innerWidth <= 768 ? 1.5 : 2]}
// After
dpr={[1, window.innerWidth <= 768 ? 1 : 2]}
```
Halves fragment count on Retina mobile. No visible quality difference at phone screen density.

#### 2. `selectedOrganId` prop added to all organ models — `Scene.jsx`
All five organ models (Heart, Lungs, Liver, Kidneys, Stomach) now receive `selectedOrganId={selectedOrgan?.id}` from `Scene.jsx`. This prop is the currently selected organ's ID string, or `undefined` when nothing is selected.

#### 3. Organ hiding when another organ is selected — all organ models
Each organ model's `useFrame` now checks whether a *different* organ is selected. If so, `targetOpacity = 0`. Once opacity drops below 0.01, `scene.visible = false` is set — this removes the mesh from the GPU render queue entirely.

```js
// Example from KidneysModel.jsx
const otherSelected =
  selectedOrganId &&
  selectedOrganId !== "left_kidney" &&
  selectedOrganId !== "right_kidney";

let targetOpacity;
if (otherSelected) {
  targetOpacity = 0;
} else if (hovered) { ... }

scene.visible = mats[0].opacity > 0.01;
```

**Why `visible = false` matters:** Setting `transparent = true` + `depthWrite = false` causes Three.js to skip frustum culling for that mesh. It still renders even if entirely off-screen. `visible = false` is the only reliable way to fully exclude a mesh from the render pass.

#### 4. Opacity lerp threshold — all organ models
```js
// Before (runs every frame forever)
m.opacity += (target - m.opacity) * 0.06;

// After (stops when settled)
const diff = target - m.opacity;
if (Math.abs(diff) > 0.001) m.opacity += diff * 0.06;
```
Prevents per-frame material writes when the organ is fully faded or fully opaque. Reduces GPU state changes.

#### 5. Glow clone `visible` synced to parent — HeartModel, LungsModel
Both heart and lungs maintain a second "glow" scene clone for additive blending effects. Previously these clones were always `visible = true` even when opacity was 0. Now:
```js
const visible = mats[0].opacity > 0.01;
scene.visible = visible;
if (glowScene) glowScene.visible = visible;
```

---

## Brain zoom camera fix — `CameraController.jsx`

### Problem
`MALE_BRAIN_TARGET.y = 1.55` placed the camera orbit target at the very bottom of the skull (skull spans Y=1.55–1.75 in local space). This made the skull appear in the upper portion of the viewport instead of centered.

### Fix
```js
// Before
const MALE_BRAIN_TARGET = new THREE.Vector3(0, 1.55 + MOBILE_BRAIN_Y, 0);
const MALE_CELL_TARGET = new THREE.Vector3(0, 1.51 + MOBILE_BRAIN_Y, 0);

// After — targets skull center (~1.65 local) more accurately
const MALE_BRAIN_TARGET = new THREE.Vector3(0, 1.87 + MOBILE_BRAIN_Y, 0);
const MALE_CELL_TARGET = new THREE.Vector3(0, 1.82 + MOBILE_BRAIN_Y, 0);
```
Also updated the brain zoom entry `camera.position` and `ctrl.target` in `useEffect` from `1.55` → `1.87` and `1.51` → `1.82`.

**Note:** These are WORLD space values. `MOBILE_BRAIN_Y` compensates for mobile's larger `offsetY` and is unchanged. `FEMALE_Y_OFFSET = 1.615 - 1.672` is unchanged — it applies on top of the base target.

**Debugging tip for future:** The skull Y bounds (local space, after model scale/position but before scene group globalScale/offsetY) are hardcoded in the comment at the top of `AnatomyModel.jsx`:
```
// Skull bounds (sampled once from GLB, y > 1.55):
//   x: -0.096 → 0.096   y: 1.550 → 1.750   z: -0.126 → 0.098
```
World Y = localY × globalScale + offsetY. At globalScale=0.948, offsetY=0.11: skull bottom ≈ 1.579 world, skull center ≈ 1.674 world. The brain target should be near skull center for a balanced view.

---

## Key patterns for future organ model additions

### Clone material pattern (preserves GLB textures)
```js
scene.traverse((child) => {
  if (!child.isMesh) return;
  const m = child.material.clone();
  m.transparent = true;
  m.opacity = 0;
  m.depthWrite = false;
  m.needsUpdate = true;
  child.material = m;
  child.renderOrder = 4;
  mats.push(m);
});
```
Use this for organs with embedded textures (kidneys, stomach). Use `new THREE.MeshStandardMaterial(...)` only when you want to override the GLB color entirely (liver uses this pattern).

### GLB compression pipeline
```bash
npx @gltf-transform/cli optimize --compress draco input.glb output.glb
```
Always compress before dropping into `/public`. For high-poly meshes (>500K faces), decimate in Blender first at the highest ratio that preserves visual integrity, then Draco compress. Blender re-exports create less Draco-efficient geometry than the original due to split normals at edges — expect ~20% larger output than the same vertex count in an optimized source mesh.

### Organ positioning constants
Each organ model file has a `// === MALE — tweak these ===` block at the top with:
- `CENTER_X/Y/Z` — world position of the mesh center
- `TARGET_HEIGHT` — target bounding box height in world units
- `femaleMode` variants in a separate block below — **never modify female constants when adjusting male**

---

## What's still pending

- Stomach does not yet have a click-to-focus behavior (no `focusZoom`/`focusPanY` set in `organs.js`)
- Lungs vertex count (3.8M) is still the single biggest GPU cost — further Blender decimation (0.3 ratio) is the only way to reduce it
- GPU tier detection (`useDetectGPU`) not yet implemented — would allow auto-disabling organ 3D models on low-end devices
