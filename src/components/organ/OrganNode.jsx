import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CATEGORY_COLORS, CATEGORY_EMISSIVE } from "../../data/categories";

const IS_MOBILE = window.innerWidth <= 768;

import HeartRings from "./HeartRings";
import OrganLabel from "./OrganLabel";

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
  brainZoom,
  cellZoom,
  darkMode,
  femaleMode,
  femalePositions,
  previewedOrganId,
  onPreview,
  onClearPreview,
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const auraRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Resolve position: explicit override → landmark-mapped → raw male position
  const femalePos =
    femaleMode && (femalePositions?.get(organ.id) || organ.femalePosition);
  const femaleBrainPos =
    femaleMode &&
    (femalePositions?.get(organ.id + ":brain") || organ.femaleBrainPosition);
  const resolvedPos = femalePos || organ.position;
  const resolvedBrainPos = femaleBrainPos || organ.brainPosition;

  const fullPos = useRef(
    new THREE.Vector3(resolvedPos[0], resolvedPos[1], resolvedPos[2]),
  );
  const zoomedPos = useRef(
    resolvedBrainPos
      ? new THREE.Vector3(
          resolvedBrainPos[0],
          resolvedBrainPos[1],
          resolvedBrainPos[2],
        )
      : null,
  );
  const currentPos = useRef(
    new THREE.Vector3(resolvedPos[0], resolvedPos[1], resolvedPos[2]),
  );

  useEffect(() => {
    const pos = femalePos || organ.position;
    const brain = femaleBrainPos || organ.brainPosition;
    fullPos.current.set(pos[0], pos[1], pos[2]);
    if (brain) {
      zoomedPos.current?.set(brain[0], brain[1], brain[2]);
    }
    currentPos.current.copy(fullPos.current);
    if (groupRef.current) {
      groupRef.current.position.copy(fullPos.current);
    }
  }, [femaleMode, femalePositions]);

  const color = CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const emissive = CATEGORY_EMISSIVE[organ.category] ?? CATEGORY_EMISSIVE.logic;
  const isSpirit = organ.category === "spirit";
  const isPreview = previewedOrganId === organ.id;
  const isExternallyHighlighted =
    !hovered && hoveredCategory === organ.category;

  useFrame((state) => {
    // Lerp group position — nodes live in male-GLB coordinate space and never relocate
    if (groupRef.current) {
      const target =
        brainZoom && zoomedPos.current ? zoomedPos.current : fullPos.current;
      currentPos.current.lerp(target, 0.06);
      groupRef.current.position.copy(currentPos.current);
    }

    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];

    const brainFade = cellZoom || (brainZoom && !organ.brainPosition) ? 0 : 1;
    const base = hovered ? 4 : isExternallyHighlighted ? 3.5 : 2;
    meshRef.current.material.emissiveIntensity =
      base + Math.sin(t * 3 + phase) * 0.5;

    meshRef.current.material.opacity +=
      (0.18 * nodeOpacity * brainFade - meshRef.current.material.opacity) *
      0.08;

    // Breathing scale pulse — lungs in power mode, spirit node always
    if (breathingRef) {
      if (isSpirit) {
        const targetScale = 1 + breathingRef.current * 0.25;
        const cur = meshRef.current.scale.x;
        meshRef.current.scale.setScalar(cur + (targetScale - cur) * 0.04);
      } else if (viewMode === "power") {
        const targetScale = 1 + breathingRef.current * 0.08;
        const cur = meshRef.current.scale.x;
        meshRef.current.scale.setScalar(cur + (targetScale - cur) * 0.06);
      }
    }

    if (glowRef.current) {
      const glowTarget =
        (hovered ? 0.22 : isExternallyHighlighted ? 0.18 : 0.1) * nodeOpacity;
      glowRef.current.scale.setScalar(
        hovered ? 3.5 : isExternallyHighlighted ? 3.0 : 2.5,
      );
      glowRef.current.material.opacity +=
        (glowTarget * brainFade - glowRef.current.material.opacity) * 0.08;
    }

    if (innerRef.current) {
      const innerBase = isSpirit ? 12 : 6;
      innerRef.current.material.emissiveIntensity =
        innerBase + Math.sin(t * 5 + phase) * (isSpirit ? 4 : 2);
      innerRef.current.material.opacity +=
        (nodeOpacity * brainFade - innerRef.current.material.opacity) * 0.08;
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
    if (cellZoom || (brainZoom && !organ.brainPosition)) return;
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

  return (
    <group ref={groupRef}>
      {/* Spirit expanding aura */}
      {isSpirit && (
        <mesh ref={auraRef} scale={1}>
          <sphereGeometry args={[0.016, 16, 16]} />
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

      {/* Heartbeat rings — only on heart node */}
      {pulseRef && <HeartRings pulseRef={pulseRef} nodeOpacity={nodeOpacity} />}

      {/* Soft outer halo */}
      <mesh ref={glowRef} renderOrder={5}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.1}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Main node sphere */}
      <mesh ref={meshRef} renderOrder={5}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0.18}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Invisible enlarged hit target — easier to tap on mobile */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={(e) => {
          e.stopPropagation();
          if (cellZoom || (brainZoom && !organ.brainPosition)) return;
          if (IS_MOBILE) {
            if (isPreview) {
              // Second tap — open modal
              onClearPreview?.();
              onSelect(organ);
            } else {
              // First tap — preview: show label + highlight category
              onPreview?.(organ);
              onCategoryHover?.(organ.category);
            }
          } else {
            // Desktop: click opens modal directly
            onSelect(organ);
          }
        }}
      >
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Small bright inner core */}
      <mesh ref={innerRef} renderOrder={6}>
        <sphereGeometry args={[0.007, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={isSpirit ? "#ffffff" : color}
          emissiveIntensity={isSpirit ? 12 : 6}
          toneMapped={false}
          transparent
          opacity={1}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Label — on hover (desktop) or first tap (mobile preview) */}
      {(hovered || isPreview) &&
        !cellZoom &&
        !(brainZoom && !organ.brainPosition) && (
          <OrganLabel
            organ={organ}
            color={color}
            darkMode={darkMode}
            onSelect={() => {
              onClearPreview?.();
              onSelect(organ);
            }}
          />
        )}
    </group>
  );
}

export default OrganNode;
