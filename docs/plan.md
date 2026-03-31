# Pneumata — Build Plan

## What We're Building
An interactive educational web app: a dark-mode, neon-cyber glassmorphism UI with a 3D canvas (react-three-fiber) at the center. Users orbit and click glowing nodes representing organs; each click opens a glassmorphism modal explaining the biological↔hardware functional isomorphism.

---

## Tech Stack
| Layer | Tool |
|---|---|
| Build | Vite + React |
| 3D | react-three-fiber + @react-three/drei |
| Styling | Modular SCSS (no Tailwind) |
| Language | JSX (no TypeScript for now) |

**Install commands (run these after cloning):**
```bash
npm install
npm run dev
```

**From scratch:**
```bash
npm create vite@latest pneumata -- --template react
cd pneumata
npm install three @react-three/fiber @react-three/drei
npm install -D sass
```

---

## Architecture Decisions
- State lives in `App.jsx` — single source of truth for which organ is selected.
- `Scene.jsx` owns the `<Canvas>` and passes `onSelect` down to each node.
- `OrganNode.jsx` manages its own hover state locally (it doesn't need to be global).
- `GlassModal.jsx` is a pure presentational component — it just renders what it receives.
- SCSS is split into design-token partials (`_variables`, `_base`, `_modal`) imported by `main.scss`.

---

## File Map
```
Pneumata/
├── index.html
├── package.json
├── vite.config.js
├── docs/
│   ├── read.md           ← original brief
│   ├── plan.md           ← this file
│   └── react-explainer.md
└── src/
    ├── main.jsx           ← React entry point
    ├── App.jsx            ← root component, holds selectedOrgan state
    ├── data/
    │   └── organs.js      ← the JSON data array
    ├── styles/
    │   ├── main.scss      ← imports all partials, sets app layout
    │   ├── _variables.scss← design tokens (colors, fonts, spacing)
    │   ├── _base.scss     ← CSS reset + body defaults
    │   └── _modal.scss    ← glassmorphism modal styles
    └── components/
        ├── Scene.jsx      ← <Canvas> + lights + OrbitControls
        ├── OrganNode.jsx  ← individual 3D sphere + hover logic
        └── GlassModal.jsx ← modal overlay (pure, receives organ prop)
```

---

## Build Phases

### Phase 1 — Project Scaffold
- [x] `package.json` with all dependencies declared
- [x] `vite.config.js`
- [x] `index.html`
- [x] `src/main.jsx`

### Phase 2 — Data Layer
- [x] `src/data/organs.js` — export the 4-organ array from the brief

### Phase 3 — SCSS Design System
- [x] `_variables.scss` — neon-cyber color palette + typography tokens
- [x] `_base.scss` — reset, body, full-bleed layout
- [x] `_modal.scss` — glassmorphism card, animations
- [x] `main.scss` — imports partials + app shell / header styles

### Phase 4 — 3D Scene
- [x] `Scene.jsx` — Canvas, ambient + point lights, Stars background, OrbitControls with auto-rotate
- [x] `OrganNode.jsx` — sphere geometry, emissive pulse animation, hover cursor, tooltip via `<Html>`, click handler

### Phase 5 — UI Layer
- [x] `GlassModal.jsx` — dual-column bio/hardware layout + synthesis strip
- [x] `App.jsx` — wires state to Scene and Modal

---

## State Flow Diagram
```
App.jsx
│  state: selectedOrgan (null | organ object)
│
├── <Scene onSelect={setSelectedOrgan} />
│       └── <OrganNode> × 4
│               local state: hovered (bool)
│               onClick → calls onSelect(organ)
│
└── <GlassModal organ={selectedOrgan} onClose={() => setSelectedOrgan(null)} />
        renders only when selectedOrgan !== null
```

---

## Future Enhancements (not built yet)
- [ ] Add more organs from the full anatomical map
- [ ] Import a custom GLTF wireframe human silhouette (replace sphere nodes)
- [ ] Add glowing connection lines between related nodes (`<Line>` from drei)
- [ ] Mobile touch controls and responsive modal layout
- [ ] Node entry animation (staggered fade-in on load)
- [ ] Sound design — subtle tone on node click
