# Female Mode Organ Positioning Fix

## The Problem (Layman's Terms)

When you toggle the app to female mode, it loads a different 3D body model that's shorter than the male one (88% scale). The organ nodes — the glowing dots representing brain, eyes, ears, etc. — were positioned based on measurements from the male body. So when the female model loaded, every organ was floating in the wrong place: cranial nodes hovered above the skull, body organs drifted outside the torso.

Think of it like hanging ornaments on a Christmas tree, then swapping the tree for a smaller one without moving the hooks. Everything ends up in the wrong spot.

## The Problem (Technical)

Organ positions in `organs.js` are authored as `[x, y, z]` tuples calibrated to a 1.75-unit male model. The female model scales to `1.75 × 0.88 = 1.54` units with a `+0.08` Y offset to keep feet on the ground plane. This creates a non-uniform coordinate mismatch — the relationship between male and female Y coordinates is not a simple linear scale because:

1. **The GLB models have different proportions** — the female skeleton is not just a uniformly shrunk male. Hip-to-shoulder ratio, skull-to-spine ratio, and limb lengths all differ.
2. **A flat Y offset was applied** — the `+0.08` foot-plane correction shifts everything up, but organ positions were never compensated.
3. **The spine sampler produces different anchor points** — female spine top is at `y=1.535`, male at `y=1.585`, a difference that cascades through all cranial positioning math.

## What We Tried (The Journey)

### Attempt 1: Landmark-Anchored Piecewise Interpolation

Built `femaleMapping.js` — a system that:

- Samples 24 anatomical landmarks from each GLB model (shoulders, hips, knees, ankles, neck, etc.)
- Creates anchor pairs mapping male landmark Y → female landmark Y
- Interpolates organ positions between anchors using piecewise linear interpolation

**Why it failed:** The system required both male AND female landmarks to be available simultaneously, but only one model loads at a time. When `femaleMode=true`, only `femaleLandmarks` populates — `maleLandmarks` stays `null`. The guard condition `maleLandmarks && femaleLandmarks` was never satisfied.

### Attempt 2: Fix the Guard + Add Scale Fallback

Changed the guard to `femaleMode && femaleLandmarks` and added a simple `0.88` scale fallback in `mapMaleToFemale()` when `maleLandmarks` is null.

**Why it failed:** Moved the build logic into a `useEffect` in `Scene.jsx`, but `buildFemalePositions()` still never executed. The `[FemaleMap]` diagnostic log never appeared in console across 5+ reloads. Likely a React Three Fiber lifecycle issue — `useEffect` inside a component rendered within `<Canvas>` has different timing than standard React.

### Attempt 3: Direct Override (What Worked)

Gave up on the Map pipeline for cranial organs and went pragmatic:

1. **Baked `femalePosition` values directly into each organ definition** in `organs.js`
2. **Added dual fallback in `OrganNode.jsx`**: tries the Map lookup first, falls back to `organ.femalePosition`, then `organ.position`
3. **Calculated Y values using the formula**: `femaleY = spineTop + (maleY − maleSpineTop) × skullRatio`
   - Where `spineTop = 1.408` (initial), `maleSpineTop = 1.585`, `skullRatio = 0.888`

### Bug 4: Wrong Spine Top Reference

The initial femalePosition Y values were calculated using `spineTop = 1.408`, which was the female spine top from a previous model configuration. After the cervical spine concavity fix (commit `8689165`), the female spine sampler parameters changed, producing a new spine top of `y=1.535`.

All 14 cranial organs were `0.127` too low (`1.535 - 1.408 = 0.127`).

**Fix:** Added `+0.127` to every `femalePosition` and `femaleBrainPosition` Y value across all 14 cranial organs. X and Z untouched.

## Files Changed

| File                                 | What Changed                                                                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/organs.js`                 | Added `femalePosition` and `femaleBrainPosition` fields to 14 cranial organs (consciousness, frontal_lobe, left/right_hemisphere, thalamus, hippocampus, amygdala, hypothalamus, pituitary, brain_stem, left/right_eye, left/right_ear)                    |
| `src/data/femaleMapping.js`          | **New file.** Landmark-anchored piecewise interpolation system. Exports `buildFemalePositions()` and `mapMaleToFemale()`. Has skull_top synthetic anchor and override bypass logic. Currently not firing for cranial organs (bypassed by direct fallback). |
| `src/components/organ/OrganNode.jsx` | Position resolution now uses dual fallback: `femalePositions?.get(organ.id) \|\| organ.femalePosition`                                                                                                                                                     |
| `src/components/Scene.jsx`           | Wires `femaleMode` and `femalePositions` Map through to OrganNode. Builds Map via `useEffect` (currently not populating for cranial organs).                                                                                                               |

## Key Constants

| Constant          | Value | Meaning                                                                |
| ----------------- | ----- | ---------------------------------------------------------------------- |
| `TARGET_HEIGHT`   | 1.75  | Male model height in world units                                       |
| `FEMALE_SCALE`    | 0.88  | Female model is 88% of male height                                     |
| `FEMALE_Y_OFFSET` | 0.08  | Y shift to keep female feet on ground plane                            |
| Female spine top  | 1.535 | Highest Y of female spine sampler output                               |
| Male spine top    | 1.585 | Highest Y of male spine sampler output                                 |
| Skull ratio       | 0.888 | `femaleSpineTop / maleSpineTop` — how much the skull region compresses |

## Known Remaining Issues

- **The `femaleMapping.js` pipeline (Map-based system) never fires** — `buildFemalePositions()` is called in a `useEffect` but the function never executes. Likely a React Three Fiber `<Canvas>` lifecycle issue where `useEffect` timing differs from standard React. Cranial organs work around this via direct `organ.femalePosition` fallback.
- **Non-cranial body organs** still depend on the Map pipeline for female positioning. If they appear mispositioned, the pipeline needs to be debugged or those organs need direct overrides too.
- **The landmark sampler works correctly** — both male and female landmarks extract fine. The issue is purely in how/when `buildFemalePositions` is invoked in the React render lifecycle.
