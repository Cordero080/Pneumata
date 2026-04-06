import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CATEGORY_COLORS, SPINAL_LEVELS, DISC_STYLES } from "./spineData";

function DiscMarkers({
  pts,
  discQuats,
  darkMode,
  meshMode,
  hoveredCategory,
  onCategoryHover,
  onSelect,
}) {
  const discRefs = useRef([]);
  const hoveredDiscIndexRef = useRef(null);
  const hoveredCategoryRef = useRef(null);
  hoveredCategoryRef.current = hoveredCategory;

  // Separate dark / light style objects — tune each independently
  const isDarkMesh = darkMode ? meshMode <= 2 : meshMode === 0;
  const style = DISC_STYLES[isDarkMesh ? "dark" : "light"];

  useFrame(() => {
    discRefs.current.forEach((mesh, i) => {
      if (!mesh?.material) return;
      const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
      const isDirectlyHovered = hoveredDiscIndexRef.current === i;
      const isCategoryHighlighted =
        hoveredCategoryRef.current === levelData.category;

      const targetOpacity = isDirectlyHovered
        ? style.hoverOpacity
        : isCategoryHighlighted
          ? style.activeOpacity
          : style.baseOpacity;
      const targetScale = isDirectlyHovered
        ? 1.6
        : isCategoryHighlighted
          ? 1.4
          : 1.0;

      mesh.material.opacity += (targetOpacity - mesh.material.opacity) * 0.12;
      const s = mesh.scale.x;
      mesh.scale.setScalar(s + (targetScale - s) * 0.12);
    });
  });

  return (
    <>
      {/* Visible disc markers */}
      {pts.map((pt, i) => {
        const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
        const color = CATEGORY_COLORS[levelData.category];
        return (
          <mesh
            key={`disc-${i}`}
            position={pt}
            quaternion={discQuats[i]}
            ref={(el) => (discRefs.current[i] = el)}
            onPointerOver={(e) => {
              e.stopPropagation();
              hoveredDiscIndexRef.current = i;
              onCategoryHover?.(levelData.category);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              hoveredDiscIndexRef.current = null;
              onCategoryHover?.(null);
              document.body.style.cursor = "default";
            }}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={style.emissive}
              metalness={style.metalness}
              roughness={style.roughness}
              transparent
              opacity={style.baseOpacity}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Invisible hit targets — larger sphere so clicks land easily */}
      {pts.map((pt, i) => {
        const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
        const discOrgan = {
          id: `disc_${levelData.level}`,
          organ: `${levelData.level} Disc`,
          hardware: "Bus Arbitration Layer",
          category: levelData.category,
          bio_function: `Fibrocartilaginous cushion between the ${levelData.level} vertebrae. Absorbs compressive spinal load, maintains foraminal height for clean nerve root exit, and prevents adjacent vertebral bodies from grinding. Primary innervation at this level: ${levelData.innervates}.`,
          hard_function:
            "Signal isolation and arbitration layer between adjacent PCIe bus channels. Prevents simultaneous transmission on shared lane segments, isolates signal bleed between neighboring channels, and maintains clean separation so each peripheral's assigned slot receives uncontested access.",
          synthesis:
            "The disc and the arbitration layer solve the same problem: two adjacent active channels cannot occupy the same physical space simultaneously without one degrading the other. Cushion is architecture.",
          spinalConnection: `${levelData.level} — innervates ${levelData.innervates}. This disc maintains the nerve root exit geometry that allows the ${levelData.category} system signal to leave the backbone without interference from adjacent channels.`,
        };
        return (
          <mesh
            key={`hit-${i}`}
            position={pt}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(discOrgan);
            }}
          >
            <sphereGeometry args={[0.04, 4, 4]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default DiscMarkers;
