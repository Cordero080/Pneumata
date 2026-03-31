import { useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function SpinalCord({ organ, onSelect, nodeOpacity = 1 }) {
  const coreRef = useRef();
  const glowRef = useRef();

  // Pulse opacity to simulate a live data bus; respects viewMode nodeOpacity
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.7 + Math.sin(t * 2.5) * 0.3;
    if (coreRef.current?.material) {
      const target = pulse * nodeOpacity;
      coreRef.current.material.opacity +=
        (target - coreRef.current.material.opacity) * 0.08;
    }
    if (glowRef.current?.material) {
      const target = pulse * 0.25 * nodeOpacity;
      glowRef.current.material.opacity +=
        (target - glowRef.current.material.opacity) * 0.08;
    }
  });

  return (
    <group>
      {/* Thin bright PCIe trace */}
      <Line
        ref={coreRef}
        points={organ.points}
        color="#00d4ff"
        lineWidth={1.5}
        transparent
        opacity={0.8}
      />
      {/* Wide soft glow halo */}
      <Line
        ref={glowRef}
        points={organ.points}
        color="#0066ff"
        lineWidth={8}
        transparent
        opacity={0.2}
      />
      {/* Invisible hit targets at each vertebra for click detection */}
      {organ.points.map((pt, i) => (
        <mesh
          key={i}
          position={pt}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(organ);
          }}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export default SpinalCord;
