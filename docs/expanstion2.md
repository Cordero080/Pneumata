The Refined Engineering Ticket for Claude Code:

Role: Expert React / R3F Developer.
Objective: Implement Layer Toggling and the "Main Power Rail" (Aorta).

Task 1: State Management (App.jsx)

Create a new piece of state: viewMode (default: 'logic'). Options: 'logic', 'power', 'unified'.

Build a small UI Controller component (Glassmorphism style, bottom-right) to toggle between these three modes.

Task 2: The Circulatory Prototype (Scene.jsx)

Create a Circulatory Layer. This layer should only be visible (or have opacity: 1) when viewMode is 'power' or 'unified'.

Add the Aorta (Main Power Rail) using a @react-three/drei <Line>.

Coordinates: [[ -0.04, 1.30, 0.06], [0, 1.38, 0.02], [0, 1.25, -0.02], [0, 1.10, -0.04], [0, 0.90, -0.01]]

Material: A glowing red meshLineMaterial (or similar) with a "dash" animation to simulate the pulse of current moving away from the heart.

Task 3: Layer Logic

Logic Mode: Gold nodes at 100% opacity, Red/Blue lines at 0%.

Power Mode: Red/Blue lines at 100% opacity, Gold nodes at 10% (ghosted).

Unified Mode: All layers at 60-80% opacity for a balanced view.

4. The Visual Reward
When this is done, you’ll be able to click [ POWER ] and watch a glowing red "energy cable" emerge from the Heart and snake down the spine of your frosted-glass female model. It will move the app from a "collection of dots" to a "network of flows."