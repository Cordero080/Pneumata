# Pneumata — Performance Log

Philosophy: the experience should be identical on mobile and desktop. We do not reserve quality for high-end hardware. Where GPU budget is tight, we reduce invisible work — not visible fidelity.

---

## Implemented

### Adaptive DPR via PerformanceMonitor — mobile crispness fix
**File:** `src/components/scene/Scene.jsx`

iPhones and Android flagships report `devicePixelRatio` of 3. Without a cap, the WebGL renderer draws **9×** the pixels of a 1× display, so we cap at 2 (4× — still beyond human acuity).

**The bug this replaced:** the cap was written `dpr={[1, innerWidth<=768 ? 1 : 2]}` — i.e. mobile was pinned to a *fixed* dpr **1**, drawing the 3D at ~1/3 of the screen's real resolution and upscaling it. That's what made the mesh and organs look fuzzy on phones, and it silently violated this doc's own "identical on mobile and desktop" philosophy.

**The fix — adaptive, self-tuning:**
```js
const MAX_DPR = Math.min(window.devicePixelRatio, 2);
const [dpr, setDpr] = useState(MAX_DPR);
// <Canvas dpr={dpr}>
<PerformanceMonitor
  onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
  onIncline={() => setDpr((d) => Math.min(MAX_DPR, d + 0.5))}
/>
```
Start at the device's real pixel ratio (capped at 2) so the scene renders **crisp**. `PerformanceMonitor` (drei) watches frame time and steps the DPR **down** (2 → 1.5 → 1) if the phone can't sustain it, then back **up** when there's headroom. Result: capable phones look sharp, weak phones stay smooth — no hardcoded device guess.

**Why this over a fixed bump:** you notice fuzziness mainly when *looking* (static) and need framerate mainly when *moving*; a fixed `dpr=2` would tank fps on low-end phones. Letting the framerate decide is the whole point.

**Why `PerformanceMonitor` and not `AdaptiveDpr`:** `AdaptiveDpr` calls `gl.setPixelRatio` directly, which fights a state-driven `dpr` prop. Pick one; the state-driven `PerformanceMonitor` pattern is the canonical, conflict-free choice.

### Adaptive resolution under load — `performance={{ min: 0.5 }}`
**File:** `src/components/scene/Scene.jsx`

R3F's performance system monitors frame time. If the GPU sustains high load (e.g. thermal throttle after a minute of use), it can drop the effective DPR down to `min × dpr`. The renderer recovers automatically when the device cools. Prevents the progressive slowdown that would otherwise occur on prolonged sessions.

### Skip MSAA on HiDPI — `antialias: window.devicePixelRatio < 2`
**File:** `src/components/scene/Scene.jsx`

MSAA (multi-sample antialiasing) fires per-fragment GPU work to smooth edges. On a 2× or 3× DPR display the pixel density already eliminates visible aliasing, making MSAA a pure cost with no visual benefit. This flag is evaluated once at WebGLRenderer construction time: desktop 1× screens keep antialias on; HiDPI mobile turns it off.

### Prefer discrete GPU — `powerPreference: "high-performance"`
**File:** `src/components/scene/Scene.jsx`

On devices with both integrated and discrete GPUs (M-chip iPads, some Android flagships), this hint tells the browser to allocate the WebGL context to the higher-performance GPU.

---

## Current Canvas config

```jsx
<Canvas
  camera={{ position: [0, 0.82, 2.1], fov: 48 }}
  gl={{
    alpha: true,
    powerPreference: "high-performance",
    antialias: window.devicePixelRatio < 2,
  }}
  dpr={[1, 2]}
  performance={{ min: 0.5 }}
>
```

---

## Session 2026-06-07 — organ culling + mobile DPR

### Mobile DPR capped at 1 (was 1.5)
`dpr={[1, window.innerWidth <= 768 ? 1 : 2]}` — halves fragment count on Retina phones, no visible quality difference at phone screen density.

### Organ visibility culling on selection
All organ 3D models (Heart, Lungs, Liver, Kidneys, Stomach) receive `selectedOrganId` from `Scene.jsx`. When a different organ is selected, `targetOpacity = 0`. Once opacity < 0.01, `scene.visible = false` removes the mesh from the GPU render queue entirely.

**Why this matters:** Transparent meshes with `depthWrite: false` bypass Three.js frustum culling. Off-screen organs still shade every fragment. `visible = false` is the only way to fully exclude them.

### Opacity lerp threshold
```js
const diff = target - m.opacity;
if (Math.abs(diff) > 0.001) m.opacity += diff * 0.06;
```
Stops per-frame material writes once opacity is settled. Before this, every organ's `useFrame` fired a material write every frame forever.

### Glow clone `visible` sync
Heart and lungs maintain additive glow clones. Now `glowScene.visible = scene.visible` — previously these clones stayed in the render queue even at opacity 0.

---

## Future improvements (not yet implemented)

### GPU tier detection
`useDetectGPU` from `@react-three/drei` returns a tier (0–3) and device type at runtime. Could be used to automatically:
- Tier 0–1 (old/low-end mobile): force `dpr=1`, reduce light count in `SceneLights`, skip cauda equina and glow line segments
- Tier 2+: current full quality

This is the right long-term path for truly adaptive quality without any hardcoded breakpoints.

### Reduce light count on mobile
`SceneLights.jsx` renders multiple point/spot lights. Each additional light is a per-fragment calculation across every visible pixel. A mobile-specific light config (e.g. 2 directional + 1 ambient instead of 5+ point lights) would reduce shader cost while preserving the visual character.

### `frameloop="demand"` for static states
When the user is reading the About modal or a GlassModal and the scene is static (auto-rotate paused), switching `frameloop` to `"demand"` stops the render loop entirely. Requires wiring `invalidate()` calls to any state that should trigger a redraw. Medium complexity, high battery impact.
