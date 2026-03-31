import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

function OrganNode({ organ, onSelect, onHover }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];
    const base = hovered ? 4 : 2;
    meshRef.current.material.emissiveIntensity =
      base + Math.sin(t * 3 + phase) * 0.5;
    if (glowRef.current) {
      const glowBase = hovered ? 0.22 : 0.1;
      glowRef.current.material.opacity =
        glowBase + Math.sin(t * 3 + phase) * 0.04;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(organ.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = "default";
  };

  // Labels for left-side organs (x <= 0) go LEFT; right-side go RIGHT
  const isLeft = organ.position[0] <= 0;

  return (
    <group position={organ.position}>
      {/* Core spark */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(organ);
        }}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Soft outer halo */}
      <mesh ref={glowRef} scale={hovered ? 3.5 : 2.5}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Side label with connector line — appears outside the body */}
      {hovered && (
        <Html
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
            overflow: "visible",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: isLeft ? "row-reverse" : "row",
              gap: 0,
              whiteSpace: "nowrap",
              transform: isLeft
                ? "translate(calc(-100% - 8px), -50%)"
                : "translate(8px, -50%)",
            }}
          >
            {/* Label */}
            <div
              style={{
                background: "rgba(5, 8, 20, 0.72)",
                border: "1px solid rgba(255, 200, 0, 0.35)",
                borderRadius: "4px",
                padding: "3px 10px",
                fontSize: "10px",
                fontFamily: "'Orbitron', system-ui, sans-serif",
                color: "#ffd700",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 0 10px rgba(255, 180, 0, 0.15)",
                letterSpacing: "0.04em",
              }}
            >
              {organ.organ}
            </div>
            {/* Connector line */}
            <div
              style={{
                width: "28px",
                height: "1px",
                background:
                  "linear-gradient(to right, rgba(255,200,0,0.15), rgba(255,200,0,0.5))",
                flexShrink: 0,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}

export default OrganNode;
