import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CATEGORY_COLORS, SPINAL_LEVELS, DISC_STYLES } from "./spineData";

// ── CHI → SPINE REACTION — rationale ─────────────────────────────────────────
// In TCM, qi flowing through a meridian acts on that meridian's organ. In this
// model the spine is the bus that innervates the organs (each disc already
// carries the `category` of the organ SYSTEM it serves — see SPINAL_LEVELS).
// So when qi flows, the disc that innervates a given system should react — the
// spine "feeling" the channel fire. We reuse the exact HOVER reaction (brighten
// toward activeOpacity + scale up), just driven by a chi wave instead of the
// cursor, so it reads consistently.
//
// The wave sweeps the organ systems in a descending sequence (roughly cervical
// → sacral by where each system sits), so the spine lights up region by region
// as qi cycles — a legible echo of the flow rather than an anatomically exact
// 12-meridian jump-around.
const CATEGORY_PHASE = {
  logic: 0.0, // cervical / brain
  sensory: 0.14, // cervical
  power: 0.3, // upper thoracic (heart)
  thermal: 0.42, // thoracic (lungs)
  digestive: 0.56, // mid thoracic–lumbar
  renal: 0.72, // lower thoracic–lumbar
  immune: 0.86, // lumbar–sacral
  spirit: 0.0,
};
const DISC_WAVE_SPEED = 0.12; // cycles per second down the spine
const DISC_WAVE_WIDTH = 0.16; // fraction of the cycle a system is lit at once

function DiscMarkers({
  pts,
  discQuats,
  darkMode,
  meshMode,
  hoveredCategory,
  onCategoryHover,
  onSelect,
  showQi = false,
}) {
  const discRefs = useRef([]);
  const hoveredDiscIndexRef = useRef(null);
  const hoveredCategoryRef = useRef(null);
  hoveredCategoryRef.current = hoveredCategory;

  // Separate dark / light style objects — tune each independently
  const isDarkMesh = darkMode ? meshMode <= 2 : meshMode === 0;
  const style = DISC_STYLES[isDarkMesh ? "dark" : "light"];

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const waveT = showQi ? (time * DISC_WAVE_SPEED) % 1 : -1;

    discRefs.current.forEach((mesh, i) => {
      if (!mesh?.material) return;
      const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
      const isDirectlyHovered = hoveredDiscIndexRef.current === i;
      const isCategoryHighlighted =
        hoveredCategoryRef.current === levelData.category;

      // Chi activation — 0..1, peaks as the wave reaches this disc's system.
      let chi = 0;
      if (showQi) {
        const ph = CATEGORY_PHASE[levelData.category] ?? 0;
        let dist = Math.abs(waveT - ph);
        dist = Math.min(dist, 1 - dist); // wrap-around
        chi = Math.max(0, 1 - dist / DISC_WAVE_WIDTH);
        chi *= chi; // sharpen the pass-through
      }

      // Same reaction as hover, whichever is strongest: direct hover >
      // category-highlight/chi. Chi reuses the category-highlight values.
      let targetOpacity = style.baseOpacity;
      let targetScale = 1.0;
      if (isDirectlyHovered) {
        targetOpacity = style.hoverOpacity;
        targetScale = 1.6;
      } else if (isCategoryHighlighted) {
        targetOpacity = style.activeOpacity;
        targetScale = 1.4;
      }
      // Blend chi in on top (never dimmer than the hover target).
      const chiOpacity =
        style.baseOpacity + chi * (style.activeOpacity - style.baseOpacity);
      targetOpacity = Math.max(targetOpacity, chiOpacity);
      targetScale = Math.max(targetScale, 1 + chi * 0.4);

      mesh.material.opacity += (targetOpacity - mesh.material.opacity) * 0.12;
      const s = mesh.scale.x;
      mesh.scale.setScalar(s + (targetScale - s) * 0.12);
    });
  });

  return (
    <>
      {/* Visible disc markers */}
      {pts.map((pt, i) => {
        const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
        const color = CATEGORY_COLORS[levelData.category];
        // Graduate disc radius: cervical small → lumbar large → sacral taper
        // 24 levels: 0=C2, ~18=L1, ~23=S2. Peak at L1-L3 (index 18-20).
        const t = i / 23;
        const discRadius = 0.013 + 0.009 * Math.sin(t * Math.PI * 0.88 + 0.1);
        return (
          <mesh
            key={`disc-${i}`}
            position={pt}
            quaternion={discQuats[i]}
            ref={(el) => (discRefs.current[i] = el)}
            onPointerOver={(e) => {
              e.stopPropagation();
              hoveredDiscIndexRef.current = i;
              onCategoryHover?.(levelData.category);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              hoveredDiscIndexRef.current = null;
              onCategoryHover?.(null);
              document.body.style.cursor = "default";
            }}
          >
            <cylinderGeometry args={[discRadius, discRadius, 0.006, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={style.emissive}
              metalness={style.metalness}
              roughness={style.roughness}
              transparent
              opacity={style.baseOpacity}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Invisible hit targets — larger sphere so clicks land easily */}
      {pts.map((pt, i) => {
        const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
        const discOrgan = {
          id: `disc_${levelData.level}`,
          organ: `${levelData.level} Disc`,
          hardware: "Bus Arbitration Layer",
          category: levelData.category,
          bioFunction: `Fibrocartilaginous cushion between the ${levelData.level} vertebrae. Absorbs compressive spinal load, maintains foraminal height for clean nerve root exit, and prevents adjacent vertebral bodies from grinding. Primary innervation at this level: ${levelData.innervates}.`,
          hardFunction:
            "Signal isolation and arbitration layer between adjacent PCIe bus channels. Prevents simultaneous transmission on shared lane segments, isolates signal bleed between neighboring channels, and maintains clean separation so each peripheral's assigned slot receives uncontested access.",
          synthesis:
            "The disc and the arbitration layer solve the same problem: two adjacent active channels cannot occupy the same physical space simultaneously without one degrading the other. Cushion is architecture.",
          spinalConnection: `${levelData.level} — innervates ${levelData.innervates}. This disc maintains the nerve root exit geometry that allows the ${levelData.category} system signal to leave the backbone without interference from adjacent channels.`,
        };
        return (
          <mesh
            key={`hit-${i}`}
            position={pt}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(discOrgan);
            }}
          >
            <sphereGeometry args={[0.04, 4, 4]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default DiscMarkers;
