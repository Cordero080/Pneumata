import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Control points per anatomical spec:
//   Heart origin z: +0.07 (behind sternum, anterior)
//   Aortic arch    z: +0.03 (still anterior, hooks over)
//   Descending     z: -0.04 (flush against anterior spine)
const CONTROL_POINTS = [
  new THREE.Vector3(-0.04, 1.35, 0.07), // aortic root (left ventricle)
  new THREE.Vector3(-0.02, 1.42, 0.05), // ascending aorta
  new THREE.Vector3(0.01, 1.38, 0.03), // arch apex
  new THREE.Vector3(0.02, 1.25, -0.04), // proximal descending — hugs spine
  new THREE.Vector3(0.02, 1.0, -0.04), // mid descending thoracic
  new THREE.Vector3(0.01, 0.82, -0.04), // abdominal bifurcation (~L4)
];

function AortaLine({ opacity }) {
  const tubeRef = useRef();
  const glowRef = useRef();
  const surgeRef = useRef();
  const lightRef = useRef();

  const curve = useMemo(() => new THREE.CatmullRomCurve3(CONTROL_POINTS), []);

  useFrame((state) => {
    // One full pass every 2 s
    const t = (state.clock.getElapsedTime() * 0.5) % 1;
    const point = curve.getPoint(t);

    // Fade in/out near endpoints to avoid snap
    const fade = Math.min(t * 10, 1, (1 - t) * 10);
    const surgeTarget = fade * opacity;

    if (surgeRef.current) {
      surgeRef.current.position.copy(point);
      surgeRef.current.material.opacity +=
        (surgeTarget - surgeRef.current.material.opacity) * 0.12;
    }

    // PointLight rides with the surge
    if (lightRef.current) {
      lightRef.current.position.copy(point);
      lightRef.current.intensity +=
        (fade * opacity * 1.2 - lightRef.current.intensity) * 0.12;
    }

    if (tubeRef.current) {
      tubeRef.current.material.opacity +=
        (opacity * 0.85 - tubeRef.current.material.opacity) * 0.08;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity +=
        (opacity * 0.15 - glowRef.current.material.opacity) * 0.08;
    }
  });

  return (
    <group>
      {/* Red point light — casts glow on nearby ribs as surge passes */}
      <pointLight
        ref={lightRef}
        color="#ff2020"
        intensity={0}
        distance={0.35}
        decay={2}
      />

      {/* Outer glow shell */}
      <mesh ref={glowRef}>
        <tubeGeometry args={[curve, 80, 0.012, 8, false]} />
        <meshStandardMaterial
          color="#ff2020"
          emissive="#ff2020"
          emissiveIntensity={1}
          transparent
          opacity={opacity * 0.15}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Core cable — thin, dark red body with emissive red */}
      <mesh ref={tubeRef}>
        <tubeGeometry args={[curve, 80, 0.005, 8, false]} />
        <meshStandardMaterial
          color="#220000"
          emissive="#ff2020"
          emissiveIntensity={2.5}
          transparent
          opacity={opacity * 0.85}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Traveling surge orb */}
      <mesh ref={surgeRef}>
        <sphereGeometry args={[0.009, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ff4040"
          emissiveIntensity={12}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default AortaLine;
