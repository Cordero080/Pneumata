import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// CatmullRom control points — aortic root → arch → descending → bifurcation
// z transitions from anterior (+) at the heart to flush-against-spine (-) as it descends
const CONTROL_POINTS = [
  new THREE.Vector3(-0.04, 1.35, 0.08), // aortic root (left ventricle)
  new THREE.Vector3(-0.02, 1.42, 0.06), // ascending aorta
  new THREE.Vector3(0.01, 1.38, 0.02), // arch apex — hooks over and descends
  new THREE.Vector3(0.02, 1.25, -0.02), // proximal descending (anterior spine)
  new THREE.Vector3(0.02, 1.0, -0.04), // mid descending thoracic
  new THREE.Vector3(0.01, 0.82, -0.01), // abdominal bifurcation (~L4)
];

function AortaLine({ opacity }) {
  const tubeRef = useRef();
  const glowRef = useRef();
  const surgeRef = useRef();

  // Curve and geometries are stable — computed once
  const curve = useMemo(() => new THREE.CatmullRomCurve3(CONTROL_POINTS), []);

  useFrame((state) => {
    // Surge travels the full path every 2.5 s
    const t = (state.clock.getElapsedTime() * 0.4) % 1;

    if (surgeRef.current) {
      surgeRef.current.position.copy(curve.getPoint(t));
      // Fade in/out near the endpoints so it doesn't pop
      const fade = Math.min(t * 10, 1, (1 - t) * 10);
      surgeRef.current.material.opacity +=
        (fade * opacity - surgeRef.current.material.opacity) * 0.12;
    }

    if (tubeRef.current) {
      tubeRef.current.material.opacity +=
        (opacity * 0.9 - tubeRef.current.material.opacity) * 0.08;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity +=
        (opacity * 0.12 - glowRef.current.material.opacity) * 0.08;
    }
  });

  return (
    <group>
      {/* Outer glow shell — BackSide so it halos outward from the tube */}
      <mesh ref={glowRef}>
        <tubeGeometry args={[curve, 80, 0.008, 8, false]} />
        <meshStandardMaterial
          color="#ff2020"
          emissive="#ff2020"
          emissiveIntensity={1}
          transparent
          opacity={opacity * 0.12}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Core cable — dark red body with emissive glow */}
      <mesh ref={tubeRef}>
        <tubeGeometry args={[curve, 80, 0.003, 8, false]} />
        <meshStandardMaterial
          color="#330000"
          emissive="#ff2020"
          emissiveIntensity={2}
          transparent
          opacity={opacity * 0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Traveling surge — bright orb that rides the curve */}
      <mesh ref={surgeRef}>
        <sphereGeometry args={[0.008, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ff5050"
          emissiveIntensity={10}
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
