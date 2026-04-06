import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function HeartRings({ pulseRef, nodeOpacity }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const ringStates = useRef([
    { scale: 0, opacity: 0 },
    { scale: 0, opacity: 0 },
    { scale: 0, opacity: 0 },
  ]);
  const lastBeatCount = useRef(0);

  useFrame(() => {
    if (pulseRef.current !== lastBeatCount.current) {
      lastBeatCount.current = pulseRef.current;
      ringStates.current[0] = { scale: 1.0, opacity: 0.9 };
      ringStates.current[1] = { scale: 0.5, opacity: 0.75 };
      ringStates.current[2] = { scale: 0.1, opacity: 0.6 };
    }
    [ring1Ref, ring2Ref, ring3Ref].forEach((ref, i) => {
      if (!ref.current) return;
      const rs = ringStates.current[i];
      rs.scale += 0.08;
      rs.opacity *= 0.945;
      ref.current.scale.setScalar(rs.scale);
      ref.current.material.opacity = rs.opacity * nodeOpacity;
    });
  });

  return (
    <>
      <mesh ref={ring1Ref} renderOrder={4}>
        <ringGeometry args={[0.013, 0.022, 48]} />
        <meshBasicMaterial
          color="#ff3131"
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]} renderOrder={4}>
        <ringGeometry args={[0.013, 0.022, 48]} />
        <meshBasicMaterial
          color="#ff6060"
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]} renderOrder={4}>
        <ringGeometry args={[0.013, 0.022, 48]} />
        <meshBasicMaterial
          color="#ff9090"
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export default HeartRings;
