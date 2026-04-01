# GLB Mesh Vertex Sampling — Spine Auto-Trace Technique

## What this solves

When you want a line or curve to trace a specific anatomical feature in a GLB model, you have two options:

1. **Hardcode points** — manually authored `[x, y, z]` coordinates. Fast to write, but drifts from the actual mesh if the model changes or the normalization scale shifts.
2. **Sample the mesh geometry** — read the actual vertex data from the GLB at runtime and derive the line points mathematically. The line auto-traces the real geometry forever, regardless of model changes.

This document describes option 2, implemented for the spinal cord in `AnatomyModel.jsx`.

---

## Why bones didn't work here

The instinct is to find armature bones named "Spine", "Spine1", etc. and extract their world positions. This works on rigged characters with named skeletons.

This GLB (`male-body.glb` from Sketchfab) has **no armature**. The console log revealed:
- 3 meshes: `Object_2`, `Object_3`, `Object_4` — all unnamed
- No bones, no skeleton, no rig
- Parent node: `male_skeleton_first_muscles_anatomy_studyOBJcleanergles`

So bone extraction was not possible. Vertex sampling was the correct fallback.

---

## The technique in plain English

The vertebral column is the most posterior (furthest back) structure running along the midline of the body. That gives us a spatial filter we can apply to every vertex in the model:

> *"Find all vertices that are near the center (x ≈ 0), behind the body (z is negative), and at the right height (y between feet and shoulders)."*

Those vertices — from whichever of the 3 meshes contains the skeleton — will cluster around the spine. We then divide the height range into equal bands, average the z positions within each band, and get a smooth centerline trace.

---

## The technique in technical terms

```
1. scene.updateMatrixWorld(true)
   — Forces Three.js to compute each mesh's world transform matrix.
     Without this, vertex positions are in local (object) space,
     not the normalized world space we need.

2. For every mesh → for every vertex:
   vec.set(x, y, z).applyMatrix4(mesh.matrixWorld)
   — Transforms the vertex from local space to world space.
     Now the coordinates match the organ node coordinate system.

3. Filter:
   |x| < 0.025   → near the midline (bilateral symmetry axis)
   z < -0.015    → posterior to the body's center
   y ∈ [0.86, 1.60] → within the known spine height range

4. Bucket the survivors into N equal y-bands.
   For each band: average y and average z of all vertices in it.
   → One representative point per band = the centerline of the spine
     at that height.

5. Sort by y descending (top → bottom).
   Return as [[0, y, z], ...] — x is forced to 0 (midline).
```

### Key parameters to tune for a different mesh

| Parameter | Value used | What it controls |
|---|---|---|
| `|x| < 0.025` | 0.025 units | How strictly midline. Wider = more lateral structures included |
| `z < -0.015` | -0.015 units | How far posterior. Less negative = more structures included |
| `Y_MIN = 0.86` | 0.86 | Bottom of sampling range. Raise to exclude sacrum |
| `Y_MAX = 1.60` | 1.60 | Top of sampling range. Lower to exclude cervical |
| `numBins = 18` | 18 | Point density. More bins = smoother but noisier |
| `b.n >= 3` | 3 vertices | Minimum vertices per bin to be included. Raise to filter sparse geometry |

---

## How to reuse this for any other mesh feature

If you want to auto-trace a different anatomical structure (e.g. the sternum, the femur, the aorta path):

1. **Identify the spatial signature** of that structure:
   - What x range? (midline, left, right, bilateral)
   - What z range? (anterior, posterior, central)
   - What y range? (which height zone)

2. **Change the filter** in `sampleSpinePoints` to match those bounds.

3. **Change the bucketing axis** if needed — the spine buckets by y because it runs vertically. A horizontal structure (e.g. collar bone) would bucket by x instead.

4. **Decide on averaging vs. extremes**:
   - `avgZ` — centerline of the structure (used here)
   - `minZ` (most negative) — posterior surface
   - `maxZ` (most positive) — anterior surface

---

## Where the code lives

- **Sampler function:** `src/components/AnatomyModel.jsx` → `sampleSpinePoints(scene, numBins)`
- **Callback:** `AnatomyModel` accepts `onSpineExtracted(points)` prop
- **Consumer:** `src/components/SpinalCord.jsx` accepts `dynamicPoints` prop; uses it over `organ.points` if provided
- **Wiring:** `src/components/Scene.jsx` — `handleSpineExtracted` callback + `spinePoints` state

## Fallback behavior

If sampling returns fewer than 4 points (e.g. the filter is too strict or the model geometry doesn't match), `sampleSpinePoints` returns `null`. `SpinalCord` then falls back to `organ.points` from `organs.js` — the hardcoded coordinates. The system degrades gracefully.
