import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const CATEGORY_COLORS = {
  logic: { color: "#ffd700", emissive: "#ffaa00" },
  thermal: { color: "#00f2ff", emissive: "#0088ff" },
  power: { color: "#ff3131", emissive: "#880000" },
  digestive: { color: "#39ff14", emissive: "#156600" },
  spirit: { color: "#ffffff", emissive: "#ffffff" },
  sensory: { color: "#ff8c00", emissive: "#cc6600" },
  renal: { color: "#b06bff", emissive: "#7700cc" },
  immune: { color: "#00e5cc", emissive: "#007a6e" },
};

function OrganNode({
  organ,
  onSelect,
  onHover,
  nodeOpacity = 1,
  pulseRef,
  hoveredCategory,
  onCategoryHover,
  breathingRef,
  viewMode,
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);
  const lastBeatCount = useRef(0);

  // Three radiating rings — only animated on the heart node
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  // Each ring: { scale, opacity }
  const ringStates = useRef([
    { scale: 0, opacity: 0 },
    { scale: 0, opacity: 0 },
    { scale: 0, opacity: 0 },
  ]);

  const { color, emissive } =
    CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const isSpirit = organ.category === "spirit";

  const isExternallyHighlighted =
    !hovered && hoveredCategory === organ.category;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];
    const base = hovered ? 4 : isExternallyHighlighted ? 3.5 : 2;
    meshRef.current.material.emissiveIntensity =
      base + Math.sin(t * 3 + phase) * 0.5;

    meshRef.current.material.opacity +=
      (0.18 * nodeOpacity - meshRef.current.material.opacity) * 0.08;

    // Breathing scale pulse — lung nodes only, Power Mode only
    if (breathingRef && viewMode === "power") {
      const targetScale = 1 + breathingRef.current * 0.08;
      const cur = meshRef.current.scale.x;
      const next = cur + (targetScale - cur) * 0.06;
      meshRef.current.scale.setScalar(next);
    }

    // Fire rings when beat counter advances
    if (pulseRef && pulseRef.current !== lastBeatCount.current) {
      lastBeatCount.current = pulseRef.current;
      // Launch rings at staggered starting scales for layered ripple
      ringStates.current[0] = { scale: 1.0, opacity: 0.9 };
      ringStates.current[1] = { scale: 0.5, opacity: 0.75 };
      ringStates.current[2] = { scale: 0.1, opacity: 0.6 };
    }

    // Animate rings: expand + fade
    const ringRefs = [ring1Ref, ring2Ref, ring3Ref];
    ringRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const rs = ringStates.current[i];
      rs.scale += 0.08;
      rs.opacity *= 0.945;
      ref.current.scale.setScalar(rs.scale);
      ref.current.material.opacity = rs.opacity * nodeOpacity;
    });

    if (glowRef.current) {
      const glowTarget =
        (hovered ? 0.22 : isExternallyHighlighted ? 0.18 : 0.1) * nodeOpacity;
      glowRef.current.scale.setScalar(
        hovered ? 3.5 : isExternallyHighlighted ? 3.0 : 2.5,
      );
      glowRef.current.material.opacity +=
        (glowTarget - glowRef.current.material.opacity) * 0.08;
    }

    if (innerRef.current) {
      const innerBase = isSpirit ? 12 : 6;
      innerRef.current.material.emissiveIntensity =
        innerBase + Math.sin(t * 5 + phase) * (isSpirit ? 4 : 2);
      innerRef.current.material.opacity +=
        (nodeOpacity - innerRef.current.material.opacity) * 0.08;
    }

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
    onCategoryHover?.(organ.category);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
    onCategoryHover?.(null);
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

      {/* Radiating heartbeat rings — only rendered on heart node */}
      {pulseRef && (
        <>
          {/* Ring 1 — faces front (XY plane) */}
          <mesh ref={ring1Ref}>
            <ringGeometry args={[0.013, 0.022, 48]} />
            <meshBasicMaterial
              color="#ff3131"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Ring 2 — tilted 60° for depth */}
          <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[0.013, 0.022, 48]} />
            <meshBasicMaterial
              color="#ff6060"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Ring 3 — tilted 90° (horizontal) */}
          <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.013, 0.022, 48]} />
            <meshBasicMaterial
              color="#ff9090"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Soft outer halo */}
      <mesh ref={glowRef}>
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

      {/* Main node sphere */}
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

      {/* Small bright inner core */}
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
                background: isLeft
                  ? `linear-gradient(to left, ${color}26, ${color}80)`
                  : `linear-gradient(to right, ${color}26, ${color}80)`,
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
