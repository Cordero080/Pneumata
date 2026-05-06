import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const THEMES = {
  wave: { color: "#1a0a3a", emissive: "#0d0022", emissiveIntensity: 0.35 },
  grid: { color: "#001a2e", emissive: "#002244", emissiveIntensity: 0.45 },
  pulse: { color: "#1a0010", emissive: "#33001a", emissiveIntensity: 0.4 },
};

export default function WaveBackground({ theme = "wave" }) {
  const meshRef = useRef();
  const geometryRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 5, 32, 32);
    geo.userData.originalPositions = new Float32Array(
      geo.attributes.position.array,
    );
    return geo;
  }, []);

  const mat = THEMES[theme] ?? THEMES.wave;

  useFrame((state) => {
    if (!geometryRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = geometryRef.current.attributes.position.array;
    const orig = geometryRef.current.userData.originalPositions;

    for (let i = 0; i < pos.length; i += 3) {
      const x = orig[i];
      const y = orig[i + 1];
      pos[i + 2] =
        Math.sin(x * 0.8 + t * 0.5) * 0.12 +
        Math.sin(y * 0.8 + t * 0.35) * 0.12 +
        Math.sin((x + y) * 0.5 + t * 0.42) * 0.08;
    }
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();

    if (meshRef.current) meshRef.current.rotation.z = t * 0.018;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.85, -2.8]} rotation={[0, 0, 0]}>
      <primitive object={geometry} ref={geometryRef} attach="geometry" />
      <meshStandardMaterial
        color={mat.color}
        emissive={mat.emissive}
        emissiveIntensity={mat.emissiveIntensity}
        side={THREE.DoubleSide}
        metalness={0.6}
        roughness={0.4}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}
