import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Body's LEFT side (x > 0):
// heart → neck → cranium → left shoulder → left arm → left hand
// → return up arm → left chest/torso → left hip → left knee → left foot
// → return up calf → spine → back of neck → (loop, closed)
const LEFT_PATH = [
  new THREE.Vector3(-0.04, 1.3, 0.06), // heart
  new THREE.Vector3(0.0, 1.48, 0.03), // neck
  new THREE.Vector3(0.0, 1.62, 0.02), // cranium
  new THREE.Vector3(0.05, 1.48, -0.01), // left neck/upper
  new THREE.Vector3(0.14, 1.4, 0.0), // left shoulder
  new THREE.Vector3(0.21, 1.2, 0.01), // left elbow
  new THREE.Vector3(0.27, 0.96, 0.01), // left hand
  new THREE.Vector3(0.2, 1.15, 0.0), // left forearm return
  new THREE.Vector3(0.12, 1.35, 0.01), // left shoulder return
  new THREE.Vector3(0.04, 1.25, 0.04), // left chest
  new THREE.Vector3(0.05, 1.05, 0.04), // left mid-torso
  new THREE.Vector3(0.07, 0.8, 0.02), // left hip
  new THREE.Vector3(0.08, 0.5, 0.01), // left knee
  new THREE.Vector3(0.07, 0.08, 0.01), // left foot
  new THREE.Vector3(0.06, 0.46, -0.01), // left calf return
  new THREE.Vector3(0.05, 0.8, -0.03), // left hip return
  new THREE.Vector3(0.02, 1.0, -0.04), // spine mid
  new THREE.Vector3(0.02, 1.25, -0.04), // spine upper
  new THREE.Vector3(0.0, 1.42, -0.02), // back of neck
];

// Body's RIGHT side (x < 0): symmetric mirror
const RIGHT_PATH = [
  new THREE.Vector3(-0.04, 1.3, 0.06), // heart
  new THREE.Vector3(0.0, 1.48, 0.03), // neck
  new THREE.Vector3(0.0, 1.62, 0.02), // cranium
  new THREE.Vector3(-0.05, 1.48, -0.01), // right neck/upper
  new THREE.Vector3(-0.14, 1.4, 0.0), // right shoulder
  new THREE.Vector3(-0.21, 1.2, 0.01), // right elbow
  new THREE.Vector3(-0.27, 0.96, 0.01), // right hand
  new THREE.Vector3(-0.2, 1.15, 0.0), // right forearm return
  new THREE.Vector3(-0.12, 1.35, 0.01), // right shoulder return
  new THREE.Vector3(-0.04, 1.25, 0.04), // right chest
  new THREE.Vector3(-0.05, 1.05, 0.04), // right mid-torso
  new THREE.Vector3(-0.07, 0.8, 0.02), // right hip
  new THREE.Vector3(-0.08, 0.5, 0.01), // right knee
  new THREE.Vector3(-0.07, 0.08, 0.01), // right foot
  new THREE.Vector3(-0.06, 0.46, -0.01), // right calf return
  new THREE.Vector3(-0.05, 0.8, -0.03), // right hip return
  new THREE.Vector3(0.02, 1.0, -0.04), // spine mid (shared)
  new THREE.Vector3(0.02, 1.25, -0.04), // spine upper (shared)
  new THREE.Vector3(0.0, 1.42, -0.02), // back of neck
];

const HEART_POS = new THREE.Vector3(-0.04, 1.3, 0.06);
const HEART_TRIGGER_DIST = 0.06;

// One traveling orb + PointLight on a closed loop
function CircuitOrb({
  curve,
  phaseOffset,
  opacity,
  heartbeatRef,
  lastBeatTimeRef,
}) {
  const orbRef = useRef();
  const lightRef = useRef();
  const wasNear = useRef(false);

  useFrame((state, delta) => {
    // Full loop every ~4.5 s
    const t = (state.clock.getElapsedTime() * 0.22 + phaseOffset) % 1;
    const point = curve.getPoint(t);

    // Increment counter each time orb enters heart zone — shared cooldown prevents
    // the closing segment from double-firing and both orbs hitting back-to-back
    if (heartbeatRef) {
      const near = point.distanceTo(HEART_POS) < HEART_TRIGGER_DIST;
      if (near && !wasNear.current) {
        const now = state.clock.getElapsedTime();
        if (now - lastBeatTimeRef.current > 1.5) {
          heartbeatRef.current += 1;
          lastBeatTimeRef.current = now;
        }
      }
      wasNear.current = near;
    }

    // delta-time lerp — matches 0.12/frame at 60fps
    const lerp = 1 - Math.exp(-delta * 7.7);

    if (orbRef.current) {
      orbRef.current.position.copy(point);
      orbRef.current.material.opacity +=
        (opacity - orbRef.current.material.opacity) * lerp;
    }

    if (lightRef.current) {
      lightRef.current.position.copy(point);
      lightRef.current.intensity +=
        (opacity * 1.4 - lightRef.current.intensity) * lerp;
    }
  });

  return (
    <group>
      <pointLight
        ref={lightRef}
        color="#ff2020"
        intensity={0}
        distance={0.32}
        decay={2}
      />
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.008, 10, 10]} />
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

function BodyCirculation({ opacity, heartbeatRef }) {
  // closed: true → seamless loop, no snap at endpoints
  const leftCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LEFT_PATH, true),
    [],
  );
  const rightCurve = useMemo(
    () => new THREE.CatmullRomCurve3(RIGHT_PATH, true),
    [],
  );

  // Shared cooldown — prevents closing-segment double-fires and back-to-back beats
  const lastBeatTimeRef = useRef(-999);

  return (
    <group>
      {/* Left circuit — starts at phase 0 */}
      <CircuitOrb
        curve={leftCurve}
        phaseOffset={0}
        opacity={opacity}
        heartbeatRef={heartbeatRef}
        lastBeatTimeRef={lastBeatTimeRef}
      />
      {/* Right circuit — starts half a loop behind so they're always opposite */}
      <CircuitOrb
        curve={rightCurve}
        phaseOffset={0.5}
        opacity={opacity}
        heartbeatRef={heartbeatRef}
        lastBeatTimeRef={lastBeatTimeRef}
      />
    </group>
  );
}

export default BodyCirculation;
