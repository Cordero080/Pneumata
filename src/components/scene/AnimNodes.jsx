import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { organs } from "../../data/organs";
import { CATEGORY_COLORS } from "../../data/categories";

const POINT_ORGANS = organs.filter((o) => o.type === "point");

// FBX root bone (hips) is hardcoded to world (0, 0.45, -0.9) every frame.
// Mixamo FBX root = hips, not feet — hips sit at organ-space y≈0.875 (50% of 1.75).
// Group offset: y = 0.45 - 0.875 = -0.425, z = -0.9
const GROUP_Y = -0.425; // tune if nodes sit too high or low on the figure
const GROUP_Z = -0.9;

function AnimNode({ organ }) {
  const ref = useRef();
  const color = organ.nodeColor ?? CATEGORY_COLORS[organ.category];
  const phase = organ.position[0] * 5 + organ.position[1] * 3;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.material.emissiveIntensity =
      1.1 + Math.sin(t * 2.8 + phase) * 0.45;
  });

  return (
    <mesh position={organ.position} ref={ref}>
      <sphereGeometry args={[0.013, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.1}
        transparent
        opacity={0.72}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function AnimNodes() {
  return (
    <group position={[0, GROUP_Y, GROUP_Z]}>
      {POINT_ORGANS.map((organ) => (
        <AnimNode key={organ.id} organ={organ} />
      ))}
    </group>
  );
}

export default AnimNodes;
