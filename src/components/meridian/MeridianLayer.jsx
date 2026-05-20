import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { meridians } from "../../data/meridians";

function MeridianPoint({ point, color, scale }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetIntensity = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = hovered ? 3.5 : 0.8;
    targetIntensity.current += (target - targetIntensity.current) * 0.12;
    meshRef.current.material.emissiveIntensity = targetIntensity.current;
    const s = hovered ? 1.4 : 1.0;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (s - meshRef.current.scale.x) * 0.15,
    );
  });

  return (
    <group position={point.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        renderOrder={6}
      >
        <octahedronGeometry args={[0.008 * scale, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={4} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.82)",
              border: `1px solid ${color}`,
              borderRadius: 6,
              padding: "6px 10px",
              color: "#f0f0f0",
              fontSize: 11,
              maxWidth: 180,
              whiteSpace: "normal",
              lineHeight: 1.4,
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ color, fontWeight: 700, marginBottom: 2 }}>
              {point.id} · {point.name}
            </div>
            <div style={{ opacity: 0.85, fontSize: 10 }}>{point.function}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function MeridianLayer({ scale = 1 }) {
  return (
    <group>
      {meridians.map((meridian) =>
        meridian.points.map((point) => {
          const pts = meridian.bilateral
            ? [
                point,
                {
                  ...point,
                  position: [
                    -point.position[0],
                    point.position[1],
                    point.position[2],
                  ],
                },
              ]
            : [point];

          return pts.map((p, i) => (
            <MeridianPoint
              key={`${point.id}-${i}`}
              point={p}
              color={meridian.color}
              scale={scale}
            />
          ));
        }),
      )}
    </group>
  );
}
