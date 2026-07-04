import { forwardRef } from "react";

// Faceted hardware-style node marker — soft spherical glow halo (ambient bloom)
// wrapping a faceted core + inner bright core (the "component" itself).
// Pure geometry/material composition — OrganNode owns all per-frame animation
// (opacity, emissive pulse, rotation, scale) via the refs passed in/forwarded.
const NodeCore = forwardRef(function NodeCore(
  { glowRef, innerRef, color, emissive, isSpirit, sz, isMobile },
  meshRef,
) {
  const segSm = isMobile ? 5 : 12;
  // detail: 0 keeps the true 8-face octahedron (sharp facets); anything higher
  // subdivides toward a smooth sphere, which defeats the whole point here.
  const detail = 0;

  return (
    <>
      {/* Soft outer halo — ambient bloom, stays spherical. Skipped on mobile to save draw calls. */}
      {!isMobile && (
        <mesh ref={glowRef} renderOrder={5}>
          <sphereGeometry args={[sz.glow, segSm, segSm]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1}
            toneMapped={false}
            transparent
            opacity={0.1}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      )}

      {/* Main node — faceted, reads as a hardware component rather than a light bokeh */}
      <mesh ref={meshRef} renderOrder={5}>
        <octahedronGeometry args={[sz.main, detail]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.18}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Small bright inner core — same faceted language, smaller/brighter */}
      <mesh ref={innerRef} renderOrder={6}>
        <octahedronGeometry args={[sz.inner, detail]} />
        <meshStandardMaterial
          color={isSpirit ? "#ffffff" : color}
          emissive={isSpirit ? "#ffffff" : color}
          emissiveIntensity={isSpirit ? 12 : 6}
          toneMapped={false}
          transparent
          opacity={1}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </>
  );
});

export default NodeCore;
