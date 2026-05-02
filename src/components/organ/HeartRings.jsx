import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RINGS = [
  { rotation: [0, 0, 0], color: "#ff0000" },
  { rotation: [Math.PI / 3, 0, 0], color: "#ff1111" },
  { rotation: [Math.PI / 2, 0, 0], color: "#ff2222" },
  { rotation: [Math.PI / 6, Math.PI / 4, 0], color: "#ff0808" },
];

function HeartRings({ pulseRef, nodeOpacity }) {
  const refs = useRef([]);
  const states = useRef(
    RINGS.map((_, i) => ({ scale: 0, opacity: 0, delay: i * 0.12 })),
  );
  const lastBeatCount = useRef(0);

  useFrame((_, delta) => {
    if (pulseRef.current !== lastBeatCount.current) {
      lastBeatCount.current = pulseRef.current;
      states.current.forEach((s, i) => {
        s.scale = 1.0;
        s.opacity = 0.95;
        s.delay = i * 0.12;
      });
    }

    states.current.forEach((s, i) => {
      if (!refs.current[i]) return;
      s.delay -= delta;
      if (s.delay > 0) return;
      s.scale += 0.1;
      s.opacity *= 0.94;
      refs.current[i].scale.setScalar(s.scale);
      refs.current[i].material.opacity = s.opacity * nodeOpacity;
    });
  });

  return (
    <>
      {RINGS.map(({ rotation, color }, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          rotation={rotation}
          renderOrder={4}
        >
          <ringGeometry args={[0.015, 0.019, 56]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

export default HeartRings;
