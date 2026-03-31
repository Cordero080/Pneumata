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

// Tiny inner core radius — everything else is scaled up from this
const R = 0.005;

function OrganNode({ organ, onSelect, onHover, nodeOpacity = 1 }) {
  const coreRef = useRef();
  const coronaRef = useRef();
  const glowRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { color, emissive } =
    CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const isSpirit = organ.category === "spirit";

  // Spirit core pulses faster and brighter
  const coreIntensity = isSpirit ? 8 : 4;
  const pulseSpeed = isSpirit ? 4 : 3;
  const glowBaseScale = isSpirit ? 5 : 3.5;
  const glowHoverScale = isSpirit ? 7 : 5;

  useFrame((state) => {
    if (!coreRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];
    const pulse = Math.sin(t * pulseSpeed + phase);

    // Core brightness animation
    coreRef.current.material.emissiveIntensity =
      coreIntensity + pulse * (isSpirit ? 3 : 1);

    // Smooth opacity toward viewMode target
    coreRef.current.material.opacity +=
      (nodeOpacity - coreRef.current.material.opacity) * 0.08;

    // Corona breathes
    if (coronaRef.current) {
      const coronaTarget = (hovered ? 0.45 : 0.25) * nodeOpacity;
      coronaRef.current.material.opacity +=
        (coronaTarget - coronaRef.current.material.opacity) * 0.08;
    }

    // Outer glow pulses
    if (glowRef.current) {
      const glowTarget = ((hovered ? 0.14 : 0.07) + pulse * 0.03) * nodeOpacity;
      glowRef.current.material.opacity +=
        (glowTarget - glowRef.current.material.opacity) * 0.08;
    }

    // Spirit aura expands on hover
    if (isSpirit && auraRef.current) {
      const targetScale = hovered ? 8 : 1;
      const cur = auraRef.current.scale.x;
      auraRef.current.scale.setScalar(cur + (targetScale - cur) * 0.06);
      const targetOpacity = hovered ? 0.12 : 0;
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
      {/* Spirit expanding aura field */}
      {isSpirit && (
        <mesh ref={auraRef} scale={1}>
          <sphereGeometry args={[R, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Outer soft glow — large, very faint */}
      <mesh ref={glowRef} scale={hovered ? glowHoverScale : glowBaseScale}>
        <sphereGeometry args={[R, 8, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.07}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Corona — mid-layer radiation ring */}
      <mesh ref={coronaRef} scale={hovered ? 2.2 : 1.6}>
        <sphereGeometry args={[R, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1.5}
          transparent
          opacity={0.25}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Tiny bright inner core — the actual "node" */}
      <mesh
        ref={coreRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(organ);
        }}
      >
        <sphereGeometry args={[R, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={coreIntensity}
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
