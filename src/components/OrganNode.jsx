import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const CATEGORY_COLORS = {
  logic: { color: "#ffd700", emissive: "#ffaa00" },
  thermal: { color: "#00f2ff", emissive: "#0088ff" },
  power: { color: "#ff3131", emissive: "#880000" },
  digestive: { color: "#39ff14", emissive: "#156600" },
  spirit: { color: "#ffffff", emissive: "#ffffff" },
};

function OrganNode({ organ, onSelect, onHover, nodeOpacity = 1 }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { color, emissive } =
    CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const isSpirit = organ.category === "spirit";

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];
    const base = hovered ? 4 : 2;
    meshRef.current.material.emissiveIntensity =
      base + Math.sin(t * 3 + phase) * 0.5;

    // Smooth opacity for view mode (target is 0.18 × nodeOpacity)
    meshRef.current.material.opacity +=
      (0.18 * nodeOpacity - meshRef.current.material.opacity) * 0.08;

    if (glowRef.current) {
      const glowTarget = (hovered ? 0.22 : 0.1) * nodeOpacity;
      glowRef.current.material.opacity +=
        (glowTarget - glowRef.current.material.opacity) * 0.08;
    }

    // Inner bright core — pulses independently, slightly faster
    if (innerRef.current) {
      const innerIntensity = isSpirit ? 12 : 6;
      innerRef.current.material.emissiveIntensity =
        innerIntensity + Math.sin(t * 5 + phase) * (isSpirit ? 4 : 2);
      innerRef.current.material.opacity +=
        (nodeOpacity - innerRef.current.material.opacity) * 0.08;
    }

    // Spirit aura
    if (isSpirit && auraRef.current) {
      const targetScale = hovered ? 5 : 1;
      const cur = auraRef.current.scale.x;
      auraRef.current.scale.setScalar(cur + (targetScale - cur) * 0.06);
      const targetOpacity = hovered ? 0.1 : 0;
      auraRef.current.material.opacity +=
        (targetOpacity - auraRef.current.material.opacity) * 0.06;
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

  const isLeft = organ.position[0] <= 0;

  return (
    <group position={organ.position}>
      {/* Spirit expanding aura */}
      {isSpirit && (
        <mesh ref={auraRef} scale={1}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Soft outer halo — same as original */}
      <mesh ref={glowRef} scale={hovered ? 3.5 : 2.5}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Main node sphere — same as original */}
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
          color={color}
          emissive={emissive}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Small bright inner core — new addition */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.004, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={isSpirit ? "#ffffff" : color}
          emissiveIntensity={isSpirit ? 12 : 6}
          toneMapped={false}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>

      {/* Side label with connector line */}
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
            <div
              style={{
                background: "rgba(5, 8, 20, 0.72)",
                border: `1px solid ${color}55`,
                borderRadius: "4px",
                padding: "3px 10px",
                fontSize: "10px",
                fontFamily: "'Orbitron', system-ui, sans-serif",
                color: color,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: `0 0 10px ${color}26`,
                letterSpacing: "0.04em",
              }}
            >
              {organ.organ}
            </div>
            <div
              style={{
                width: "28px",
                height: "1px",
                background: `linear-gradient(to right, ${color}26, ${color}80)`,
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
