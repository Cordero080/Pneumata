# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps (first time)
npm run dev          # start dev server at localhost:5173
npm run build        # production build
npm run preview      # preview production build
```

## Architecture

Vite + React app. The entry point is `src/main.jsx` → `src/App.jsx`.

**State lives in `App.jsx`** — `selectedOrgan` (null or organ object) is the only global state. It flows down to `Scene` (via `onSelect`) and `GlassModal` (via `organ`). Nothing else needs to be global.

**3D layer** (`src/components/Scene.jsx`, `OrganNode.jsx`):
- `Scene.jsx` owns the `<Canvas>` from `@react-three/fiber` — lights, `<Stars>`, `<OrbitControls>`, and maps organs to `<OrganNode>`.
- `OrganNode.jsx` manages its own `hovered` state locally. Uses `useRef` + `useFrame` to animate emissive intensity directly on the Three.js material (bypassing React re-renders). Uses `<Html>` from `@react-three/drei` for the hover tooltip.

**UI layer** (`src/components/GlassModal.jsx`):
- Pure presentational component — renders nothing when `organ` prop is null. Clicking the overlay backdrop calls `onClose`.

**Data** (`src/data/organs.js`):
- Single exported array `organs`. Adding a new organ = adding an object to this array. The `position` field is a `[x, y, z]` tuple for Three.js placement.

**SCSS** (`src/styles/`):
- `_variables.scss` — all design tokens (colors, typography, transitions). Edit here first.
- `_base.scss` — CSS reset and body defaults.
- `_modal.scss` — glassmorphism modal component styles.
- `main.scss` — imports all partials; also owns app shell and header styles.

## Docs

- `docs/plan.md` — build phases, architecture decisions, future enhancements checklist.
- `docs/react-explainer.md` — React concepts (state, props, refs, hooks) explained through this codebase.
