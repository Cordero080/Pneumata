# React Explained — Through the Lens of Pneumata

This document explains React concepts using the actual code in this project as examples. If you've never used React before, read this alongside the source files.

---

## 1. What React Is (and Why We Use It)

React is a JavaScript library for building UIs out of **components** — small, reusable pieces of UI that each manage their own logic and appearance.

Without React, you'd manually manipulate the DOM:
```js
document.getElementById('modal').style.display = 'block'
document.querySelector('.title').textContent = organ.name
```

With React, you describe *what* the UI should look like given the current data, and React figures out the minimum DOM changes needed:
```jsx
{selectedOrgan && <GlassModal organ={selectedOrgan} />}
```

This is called **declarative** programming — you declare the outcome, not the steps.

---

## 2. Components

Every file in `src/components/` is a component. A component is just a **JavaScript function that returns JSX** (HTML-like syntax that React compiles into DOM elements).

```jsx
// GlassModal.jsx
function GlassModal({ organ, onClose }) {
  return (
    <div className="modal-overlay">
      <h2>{organ.organ} → {organ.hardware}</h2>
    </div>
  )
}
```

**Rules:**
- Component names must start with a capital letter (`GlassModal`, not `glassModal`)
- A component can only return one root element (wrap siblings in `<>...</>` if needed)
- JSX uses `className` instead of `class` (because `class` is a reserved JS keyword)

---

## 3. Props — How Components Receive Data

Props are the **parameters of a component**. They flow *downward* from parent to child — never the other way.

In `App.jsx`:
```jsx
<GlassModal organ={selectedOrgan} onClose={() => setSelectedOrgan(null)} />
```

In `GlassModal.jsx`, those become available as the first argument:
```jsx
function GlassModal({ organ, onClose }) {
  // organ is the organ object
  // onClose is a function we can call
}
```

Think of props like function arguments. The parent controls what data the child sees.

---

## 4. State — The Engine of Interactivity

State is **data that can change over time**, causing the UI to re-render.

In `App.jsx`:
```jsx
import { useState } from 'react'

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null)
  //         ^                ^                    ^
  //   current value    setter function       initial value
}
```

- `selectedOrgan` starts as `null` (no modal shown)
- When a user clicks a node, `setSelectedOrgan(organ)` is called
- React re-renders `App` and everything that depends on `selectedOrgan`
- The modal appears because `selectedOrgan !== null`

**Key rule:** Never mutate state directly. Always use the setter:
```jsx
// WRONG
selectedOrgan = someOrgan

// RIGHT
setSelectedOrgan(someOrgan)
```

### Local vs. Lifted State

`OrganNode.jsx` has its own local state for hover:
```jsx
const [hovered, setHovered] = useState(false)
```

This doesn't need to live in `App.jsx` — nothing outside `OrganNode` cares whether a specific node is hovered. Keep state as local as possible.

`selectedOrgan` lives in `App.jsx` because **both** `Scene` (which triggers it) and `GlassModal` (which displays it) need to know about it. When state needs to be shared between siblings, you *lift it up* to their common parent.

---

## 5. How Components Link Together in This App

```
App.jsx
│
│  const [selectedOrgan, setSelectedOrgan] = useState(null)
│
├── <Scene onSelect={setSelectedOrgan} />
│       │
│       │  receives onSelect as a prop
│       │
│       └── <OrganNode organ={...} onSelect={onSelect} />
│                 │
│                 │  const [hovered, setHovered] = useState(false)
│                 │
│                 │  onClick → onSelect(organ)   ← calls App's setter!
│
└── <GlassModal organ={selectedOrgan} onClose={() => setSelectedOrgan(null)} />
          │
          │  receives the organ object as a prop
          │  renders null if organ is null (no modal)
          │  calls onClose to reset state → modal disappears
```

The click in `OrganNode` triggers a function that was defined in `App.jsx`. This is how React passes behavior upward — not by breaking the one-way flow, but by passing setter functions as props. The data still only flows down; the *ability to change* it flows down too, as a callback.

---

## 6. useRef — Accessing the Actual DOM/3D Object

```jsx
// OrganNode.jsx
const meshRef = useRef()

<mesh ref={meshRef} ...>
```

`useRef` gives you a mutable container that persists across renders. When attached to a JSX element with `ref={meshRef}`, `meshRef.current` points directly to the underlying Three.js `Mesh` object.

This lets you imperatively mutate properties in the animation loop without triggering a re-render:
```jsx
meshRef.current.material.emissiveIntensity = 1.8  // direct mutation — intentional!
```

If you used state for this (`setEmissiveIntensity(1.8)`), React would re-render on every animation frame (60 times/sec) — a huge performance hit.

**Rule of thumb:** Use `useRef` for things that change every frame or that React doesn't need to know about.

---

## 7. useFrame — React Three Fiber's Animation Hook

`useFrame` is not a core React hook — it's from `@react-three/fiber`. It runs a callback **every frame** (inside the WebGL render loop):

```jsx
import { useFrame } from '@react-three/fiber'

useFrame((state) => {
  const t = state.clock.getElapsedTime()
  meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.2
})
```

- `state.clock.getElapsedTime()` returns seconds since the scene started
- `Math.sin(t * 2)` oscillates between -1 and 1, creating a pulse
- This runs ~60 times per second — keep it fast, no heavy computation here

---

## 8. Conditional Rendering

React uses plain JavaScript conditionals inside JSX:

```jsx
// Render nothing if no organ selected
{selectedOrgan && <GlassModal organ={selectedOrgan} />}

// Or inside the component itself (early return)
function GlassModal({ organ, onClose }) {
  if (!organ) return null
  return <div>...</div>
}
```

Both patterns are used in this project. Early return is cleaner when the whole component is conditional.

---

## 9. Rendering a List

```jsx
// Scene.jsx
{organs.map((organ) => (
  <OrganNode key={organ.id} organ={organ} onSelect={onSelect} />
))}
```

- `.map()` transforms the data array into an array of components
- `key` is required — React uses it to efficiently track which items changed
- Always use a stable unique ID for `key` (not the array index)

---

## 10. The Data Flow Summary for Pneumata

| What changes | Where state lives | Who reads it | How it changes |
|---|---|---|---|
| Which organ is selected | `App.jsx` | `GlassModal.jsx` | `OrganNode` calls `onSelect(organ)` |
| Is a node hovered | `OrganNode.jsx` | Same `OrganNode` only | `onPointerOver/Out` events |
| Emissive intensity | Three.js mesh (via `useRef`) | No one — direct 3D mutation | `useFrame` loop |
