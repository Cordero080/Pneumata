import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SWEEP_DURATION = 10; // seconds per full sweep
const Y_START = 0.3;
const Y_END = 2.15;

function ScanLine({ darkMode }) {
  const lineRef = useRef();
  const glowRef = useRef();
  const color = darkMode ? "#00f2ff" : "#2277bb";

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % SWEEP_DURATION) / SWEEP_DURATION;
    const y = Y_START + t * (Y_END - Y_START);
    const fade = Math.min(t * 5, 1) * Math.min((1 - t) * 5, 1);

    if (lineRef.current) {
      lineRef.current.position.y = y;
      lineRef.current.material.opacity = 0.75 * fade;
    }
    if (glowRef.current) {
      glowRef.current.position.y = y - 0.055;
      glowRef.current.material.opacity = 0.14 * fade;
    }
  });

  return (
    <group position={[0, 0, -0.9]}>
      <mesh ref={lineRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.85, 0.003]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.14}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default ScanLine;
