# Vertebrae Construction — Design Decisions

This documents how the spinal column went from a single animated line to anatomically shaped vertebrae, and why each decision was made.

---

## The problem with a uniform line

The original spinal cord was a single `<Line>` from `@react-three/drei` running through 24 sampled points. It was animated but visually it read as a wire, not a spine. The disc markers were flat horizontal discs that didn't tilt with the curve of the spine.

---

## Step 1 — Spine point smoothing

The GLB vertex sampler (`sampleSpinePoints` in `AnatomyModel.jsx`) bins ~thousands of posterior-midline vertices into 24 y-bands and averages their z-values. The bottom 3–4 bins (lumbar/sacral) consistently had fewer vertices and noisier averages, causing the last few vertebrae to visually skew off-axis.

**Fix:** a 2-pass 3-point moving average over both y and z in `SpinalCord.jsx` before any geometry is computed. Endpoints are preserved. This runs in a `useMemo` so it only recalculates if the sampled points change (which is essentially never after initial load).

---

## Step 2 — Disc orientation

The colored disc markers at each spine point were always rendered flat horizontal — they had no `quaternion` prop. Once the vertebral bodies had proper orientation, the horizontal discs looked obviously wrong.

**Fix:** a `discQuats` useMemo that computes a quaternion per point by averaging the incoming and outgoing segment directions. Endpoints use the single available direction. Applied via `quaternion={discQuats[i]}` on each disc mesh.

---

## Step 3 — Vertebral body shape: cylinder → LatheGeometry

A `cylinderGeometry` is a perfect tube. Real vertebral bodies are a waisted barrel: the endplates (top and bottom) flare outward and the sides curve inward slightly.

**Decision:** `LatheGeometry` revolves a 2D profile around the Y axis. The profile uses 5 control points:

```
y = -h/2  r = 1.06×radius   (bottom endplate, flared)
y = -h×0.28  r = 0.93×radius
y = 0     r = 0.84×radius   (waist, narrowest)
y = +h×0.28  r = 0.93×radius
y = +h/2  r = 1.06×radius   (top endplate, flared)
```

The geometry is created inside the `vertebrae` useMemo per vertebra and passed to the mesh via `<primitive object={bodyGeo} attach="geometry" />`. This avoids JSX re-creation on every render.

---

## Step 4 — Spinous process

The spinous process is the bony spike at the back of each vertebra, visible from the side. It points posteriorly (−z direction for this model).

**Direction:** `crossVectors(dir, X̂)` gives a vector perpendicular to the spine axis in the sagittal plane. If the result points in +z (anterior), it's negated.

**Length:** `0.012 + sin(tNorm × π) × 0.018` — a sine curve over normalized spine position. This peaks at mid-thoracic (~T5–T8), which is anatomically correct: thoracic spinous processes are the longest in the human spine and angle most sharply inferiorly.

**Geometry:** tapered cylinder, `r=0.003` at base → `r=0.005` at tip. A slightly wider base reads as the bony attachment rather than a uniform spike.

---

## Step 5 — Transverse processes

Transverse processes extend laterally from the pedicles on each side. Three anatomical facts shaped the implementation:

**1. Central gap (vertebral foramen)**
The spinal cord runs through the center of each vertebra. A single cylinder spanning both sides would pass through the canal. Solution: two separate half-cylinders with a gap of `radius × 0.7` on each side of center.

**2. Posterior offset**
Transverse processes attach at the pedicles, which are behind the vertebral body. A `postShift` of `radius × 0.55` in the posterior direction was added to each process center so they appear to grow from the arch rather than through the middle of the body.

**3. Superior pitch (and the rotation axis mistake)**

Thoracic transverse processes angle superiorly (upward) more than cervical or lumbar. A `sin(tNorm × π) × 0.26` radian pitch was added.

**First attempt:** used `posterior` (the local posterior direction vector) as the rotation axis for pitch. This failed badly — as the spine curves, `posterior` changes direction, so each vertebra was pitching around a different axis. The result was processes fanning out in random directions around the spine.

**Fix:** switched to a fixed global Z axis. Since the spine lies entirely in the Y-Z plane, rotating around Z is the same as "tilting up" consistently for every vertebra. Right processes use `+transPitch`, left processes use `−transPitch` (mirrored) so both sides pitch symmetrically. Separate left/right quaternions also ensure the taper (tip outer, base inner) is correctly oriented on both sides.

**Geometry:** tapered cylinder `r=0.001` (tip) → `r=0.003` (base), 6 radial segments.

---

## What's next

The vertebral arch — laminae connecting the transverse processes back to the spinous process — is the missing piece that would close each vertebra into a complete protective ring around the canal. After that: nerve root lines radiating from each disc level toward the organ nodes they innervate, making the spine visually function as the bus it is.
