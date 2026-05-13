import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PULSES = [
  { delay: 0, inner: 0.014, outer: 0.0175, speed: 9 },
  { delay: 0.06, inner: 0.014, outer: 0.0155, speed: 10 },
  { delay: 0.13, inner: 0.014, outer: 0.0148, speed: 11 },
  { delay: 0.2, inner: 0.014, outer: 0.0145, speed: 9.5 },
  { delay: 0.3, inner: 0.014, outer: 0.015, speed: 8.5 },
  { delay: 0.38, inner: 0.014, outer: 0.0172, speed: 9 },
  { delay: 0.44, inner: 0.014, outer: 0.0152, speed: 10 },
];

function HeartRings({ pulseRef, nodeOpacity }) {
  const refs = useRef([]);
  const states = useRef(PULSES.map(() => ({ scale: 0, opacity: 0 })));
  const lastBeatCount = useRef(0);
  const beatTime = useRef(-1);

  useFrame((state, delta) => {
    if (pulseRef.current !== lastBeatCount.current) {
      lastBeatCount.current = pulseRef.current;
      beatTime.current = state.clock.getElapsedTime();
    }

    const t = state.clock.getElapsedTime();

    states.current.forEach((s, i) => {
      if (!refs.current[i]) return;

      const elapsed = beatTime.current >= 0 ? t - beatTime.current : -1;
      const shouldFire = elapsed >= PULSES[i].delay;

      if (shouldFire && s.opacity <= 0 && elapsed < PULSES[i].delay + 0.05) {
        s.scale = 1.0;
        s.opacity = 0.9;
      }

      if (s.opacity <= 0.01) {
        s.opacity = 0;
        s.scale = 0;
        refs.current[i].scale.setScalar(0);
        refs.current[i].material.opacity = 0;
        return;
      }

      s.scale += delta * PULSES[i].speed;
      s.opacity *= 0.91;
      refs.current[i].scale.setScalar(s.scale);
      refs.current[i].material.opacity = s.opacity * nodeOpacity;
    });
  });

  return (
    <>
      {PULSES.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          rotation={[0, 0, 0]}
          renderOrder={4}
        >
          <ringGeometry args={[p.inner, p.outer, 72]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={3}
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
