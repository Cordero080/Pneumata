import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Procedural lung shape: an ellipsoid (sphere scaled tall and shallow).
// Shows when the corresponding lung node is hovered.
// Breathes on a 5-second sine-wave cycle while visible.
function LungVolume({ position, visible }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // 5-second breathing cycle (2π / 5 ≈ 1.257 rad/s)
    const breathe = (Math.sin(t * 1.257) + 1) / 2;
    const targetOpacity = visible ? 0.12 + breathe * 0.14 : 0;
    // Smooth fade-in / fade-out
    meshRef.current.material.opacity +=
      (targetOpacity - meshRef.current.material.opacity) * 0.06;
  });

  return (
    // Scale to lung proportions: tall (y), narrower (x), shallow front-to-back (z)
    <mesh ref={meshRef} position={position} scale={[1, 1.9, 0.65]}>
      <sphereGeometry args={[0.02, 16, 12]} />
      <meshPhysicalMaterial
        color="#ffeea0"
        emissive="#ffcc44"
        emissiveIntensity={0.4}
        transparent
        opacity={0}
        transmission={0.4}
        roughness={0.3}
        depthWrite={false}
      />
    </mesh>
  );
}

export default LungVolume;
