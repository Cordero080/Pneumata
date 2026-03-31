# Pneumata — GLB Coordinate Map

This document is the spatial reference for `public/male-body.glb`, normalized to **1.75 units tall** at runtime. Use it to propose coordinates for new organs, vessels, nerves, or any anatomical structure before adding it to `src/data/organs.js`.

---

## Axis Convention

```
Y axis  →  vertical height
  y = 0.00   feet / floor
  y = 1.75   top of skull

Z axis  →  body depth (anterior / posterior)
  z > 0   FRONT of body  (anterior — face, chest, belly)
  z < 0   BACK of body   (posterior — spine, back muscles)
  Typical body depth range: z ≈ −0.10 to +0.10

X axis  →  body width (lateral)
  x < 0   body's RIGHT side  (viewer's left in front view)
  x > 0   body's LEFT side   (viewer's right in front view)
  Typical shoulder width range: x ≈ −0.18 to +0.18
```

> **Critical:** The original GLB has its front face pointing toward the camera at z = +3.5. This means z > 0 is anterior. This is the OPPOSITE of what you might assume from a standard "z-forward" convention — trust this document over intuition.

---

## Verified Anatomical Height Zones (y-axis)

These were empirically calibrated against the rendered GLB mesh. Use them as guardrails when proposing coordinates.

| Anatomical Region | y range | Notes |
|---|---|---|
| Top of skull | 1.72 – 1.75 | Upper cranial vault |
| Brain interior | 1.60 – 1.70 | Safe zone for all brain nodes |
| Base of skull / foramen magnum | 1.58 – 1.62 | C1 vertebra, brainstem exit |
| Neck / cervical vertebrae | 1.52 – 1.58 | |
| Shoulder / clavicle / T1 | 1.42 – 1.50 | **Upper bound for lung nodes** |
| Upper thorax / apex of lungs | 1.35 – 1.42 | |
| Mid-chest / cardiac / lung hilum | 1.22 – 1.35 | Heart, lung representative nodes |
| Lower ribcage / xiphoid process | 1.10 – 1.22 | |
| Liver / gallbladder zone | 1.08 – 1.18 | Body's right (x < 0) |
| Stomach / spleen zone | 1.04 – 1.12 | Body's left (x > 0) |
| Pancreas / kidney zone | 1.00 – 1.10 | Retroperitoneal, z slightly negative |
| Small intestine / umbilicus | 0.98 – 1.06 | Central, anterior |
| Large intestine / lower abdomen | 0.94 – 1.00 | Peripheral, anterior |
| Iliac crest / pelvis brim | 0.90 – 0.95 | |
| **⚠ Pelvis / genitals** | **0.82 – 0.92** | **Avoid for abdominal organs** |
| Bladder / rectum | 0.85 – 0.93 | Deep pelvic, z slightly negative |
| Upper femur / hip joint | 0.78 – 0.88 | |
| Mid thigh | 0.60 – 0.78 | |
| Knee | 0.48 – 0.54 | |
| Shin / calf | 0.20 – 0.48 | |
| Ankle | 0.08 – 0.14 | |

---

## Verified z-Depth by Region

| Region | z value | Reason |
|---|---|---|
| Anterior abdominal organs (liver, stomach, intestines) | +0.06 to +0.09 | Deep inside peritoneal cavity, anterior |
| Anterior chest organs (heart, lungs) | +0.05 to +0.07 | Behind sternum / inside ribcage |
| Brain nodes (anterior) | +0.02 to +0.06 | Inside skull, frontal lobe forward |
| Brain nodes (posterior, e.g. hippocampus) | −0.02 to −0.04 | Medial temporal / occipital |
| Spinal cord | −0.04 to −0.08 | Posterior midline, inside vertebral column |
| Kidneys (retroperitoneal) | −0.02 to −0.05 | Behind peritoneum, near spine |
| Midline structures (pituitary, pancreas) | 0.00 to +0.02 | Central, no strong lateral or depth offset |

---

## Currently Placed Nodes

All positions are `[x, y, z]`. Type `"point"` = single node. Type `"line"` = polyline with `points` array.

### Brain / Head

| id | organ | position | note |
|---|---|---|---|
| `frontal_lobe` | Frontal Lobe | `[0, 1.68, 0.06]` | Anterior, upper cranium |
| `pituitary` | Pituitary Gland | `[0, 1.62, 0.01]` | Center of skull base |
| `left_hemisphere` | Left Hemisphere | `[-0.05, 1.67, 0.02]` | Left half of brain |
| `right_hemisphere` | Right Hemisphere | `[0.05, 1.67, 0.02]` | Right half of brain |
| `hippocampus` | Hippocampus | `[0, 1.64, -0.03]` | Medial temporal lobe, slightly posterior |

### Spine (line)

Posterior midline. Points trace cervical → lumbar, with thoracic kyphosis curve (z becomes more negative toward mid-thorax, then curves back).

| Vertebral level | point |
|---|---|
| C7 (base of skull) | `[0, 1.60, -0.05]` |
| T4 (upper thoracic) | `[0, 1.45, -0.075]` |
| T9 (max kyphosis) | `[0, 1.28, -0.08]` |
| L2 (upper lumbar) | `[0, 1.08, -0.065]` |
| L5/S1 (lumbosacral) | `[0, 0.92, -0.04]` |

### Thorax

| id | organ | position | note |
|---|---|---|---|
| `heart` | Heart | `[-0.04, 1.30, 0.06]` | Slightly left of midline, mid-chest |
| `left_lung` | Left Lung | `[-0.10, 1.22, 0.05]` | Body's left side, ribcage |
| `right_lung` | Right Lung | `[0.10, 1.22, 0.05]` | Body's right side, ribcage |

### Abdomen

| id | organ | position | note |
|---|---|---|---|
| `liver` | Liver | `[-0.07, 1.13, 0.08]` | Right hypochondrium (x < 0) |
| `stomach` | Stomach | `[0.05, 1.08, 0.08]` | Left of midline (x > 0) |
| `small_intestine` | Small Intestine | `[0, 1.05, 0.07]` | Central abdomen |
| `large_intestine` | Large Intestine | `[0, 0.97, 0.06]` | Lower abdomen, just above pelvis |

---

## Guidance for New Nodes (for Gemini)

When proposing a new organ or structure, provide a JSON object in the format used by `src/data/organs.js`:

```js
{
  id: "kidney_left",          // snake_case, unique
  type: "point",              // "point" or "line"
  organ: "Left Kidney",       // display name
  hardware: "Cache Memory",   // hardware analogy
  position: [0.06, 1.05, -0.04],  // [x, y, z]
  bio_function: "...",
  hard_function: "...",
  synthesis: "..."
}
```

For a `type: "line"` node (e.g. aorta, vena cava, nerve pathways):
```js
{
  id: "aorta",
  type: "line",
  organ: "Aorta",
  hardware: "Power Rail",
  points: [
    [x, y, z],   // origin
    [x, y, z],   // ...
    [x, y, z],   // terminus
  ],
  bio_function: "...",
  hard_function: "...",
  synthesis: "..."
}
```

### Suggested next organs (unplaced)

Use the height zones table above to derive starting coordinates:

| Organ | Approx. position hint | Notes |
|---|---|---|
| Kidneys (bilateral) | `[±0.08, 1.05, -0.04]` | Retroperitoneal, flank, z slightly negative |
| Pancreas | `[-0.02, 1.06, 0.04]` | Transverse across upper abdomen |
| Spleen | `[0.10, 1.10, 0.06]` | Body's left, posterior to stomach |
| Thyroid | `[0, 1.53, 0.05]` | Anterior neck, below larynx |
| Adrenal glands | `[±0.05, 1.12, -0.02]` | Atop each kidney, retroperitoneal |
| Bladder | `[0, 0.88, 0.06]` | Lower pelvis, anterior |
| Trachea (line) | points from `[0,1.53,0.04]` → `[0,1.38,0.04]` | Anterior midline neck to carina |
| Aorta (line) | points from `[0,1.35,-0.01]` → `[0,0.90,-0.01]` | Slightly left of midline, mid-depth |
| Vena cava (line) | points from `[0,0.90,-0.01]` → `[0,1.35,-0.01]` | Mirror of aorta, slightly right |

### Rules of thumb
- Keep all nodes **inside** the glass body. The mesh is ~0.38 units wide at the chest and ~0.28 units wide at the waist.
- Paired bilateral organs (kidneys, adrenals, ovaries): use `±0.06 to ±0.10` on x-axis, symmetric.
- Retroperitoneal organs (kidneys, adrenals): z ≈ −0.02 to −0.05 (behind the peritoneum, toward spine).
- Pelvic organs: keep y ≥ 0.85 to stay above the scrotal region of the mesh.
- Line segments: use 4–6 points minimum to allow curvature. Space points ~0.10–0.15 y-units apart.
