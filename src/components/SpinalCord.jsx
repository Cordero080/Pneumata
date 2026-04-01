import { useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const CATEGORY_COLORS = {
  logic: "#ffd700",
  thermal: "#00f2ff",
  power: "#ff3131",
  digestive: "#39ff14",
  sensory: "#ff8c00",
  renal: "#b06bff",
  immune: "#00e5cc",
};

// 24 intervertebral disc levels, top → bottom.
// Category = organ system innervated at that spinal level.
const SPINAL_LEVELS = [
  { level: "C2–C3", category: "logic", innervates: "Occiput & neck muscles" },
  { level: "C3–C4", category: "logic", innervates: "Neck, upper shoulder" },
  {
    level: "C4–C5",
    category: "thermal",
    innervates: "Diaphragm (phrenic nerve)",
  },
  { level: "C5–C6", category: "sensory", innervates: "Deltoid, biceps" },
  { level: "C6–C7", category: "sensory", innervates: "Wrist extensors, thumb" },
  { level: "C7–T1", category: "sensory", innervates: "Triceps, fingers" },
  {
    level: "T1–T2",
    category: "power",
    innervates: "Hand intrinsics, upper chest",
  },
  {
    level: "T2–T3",
    category: "power",
    innervates: "Cardiac accelerator nerve",
  },
  { level: "T3–T4", category: "power", innervates: "Heart & lungs" },
  { level: "T4–T5", category: "thermal", innervates: "Lungs & bronchi" },
  { level: "T5–T6", category: "digestive", innervates: "Esophagus & aorta" },
  { level: "T6–T7", category: "digestive", innervates: "Stomach" },
  { level: "T7–T8", category: "digestive", innervates: "Stomach & liver" },
  { level: "T8–T9", category: "digestive", innervates: "Liver & gallbladder" },
  { level: "T9–T10", category: "digestive", innervates: "Pancreas & spleen" },
  { level: "T10–T11", category: "renal", innervates: "Kidneys & adrenals" },
  { level: "T11–T12", category: "renal", innervates: "Kidneys & ureters" },
  { level: "T12–L1", category: "digestive", innervates: "Small intestine" },
  { level: "L1–L2", category: "digestive", innervates: "Large intestine" },
  { level: "L2–L3", category: "renal", innervates: "Appendix & bladder" },
  {
    level: "L3–L4",
    category: "renal",
    innervates: "Bladder & reproductive organs",
  },
  { level: "L4–L5", category: "immune", innervates: "Lower extremities" },
  { level: "L5–S1", category: "immune", innervates: "Bladder, rectum, feet" },
  { level: "S1–S2", category: "immune", innervates: "Bladder & pelvic floor" },
];

function SpinalCord({
  organ,
  onSelect,
  nodeOpacity = 1,
  dynamicPoints,
  hoveredCategory,
  onCategoryHover,
}) {
  const coreRef = useRef();
  const glowRef = useRef();
  const discRefs = useRef([]);

  // Sync hoveredCategory into a ref so useFrame can read it without stale closure
  const hoveredCategoryRef = useRef(null);
  hoveredCategoryRef.current = hoveredCategory;
  const hoveredDiscIndexRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.7 + Math.sin(t * 2.5) * 0.3;

    if (coreRef.current?.material) {
      const target = pulse * nodeOpacity;
      coreRef.current.material.opacity +=
        (target - coreRef.current.material.opacity) * 0.08;
    }
    if (glowRef.current?.material) {
      const target = pulse * 0.25 * nodeOpacity;
      glowRef.current.material.opacity +=
        (target - glowRef.current.material.opacity) * 0.08;
    }

    // Highlight discs whose category matches hovered organ/disc, or disc is directly hovered
    discRefs.current.forEach((mesh, i) => {
      if (!mesh?.material) return;
      const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
      const isCategoryHighlighted =
        hoveredCategoryRef.current === levelData.category;
      const isDirectlyHovered = hoveredDiscIndexRef.current === i;
      const target = isDirectlyHovered
        ? 0.7
        : isCategoryHighlighted
          ? 0.55
          : 0.2;
      mesh.material.opacity += (target - mesh.material.opacity) * 0.1;
    });
  });

  const pts = dynamicPoints ?? organ.points;

  return (
    <group>
      {/* Thin bright PCIe trace */}
      <Line
        ref={coreRef}
        points={pts}
        color="#00d4ff"
        lineWidth={1.5}
        transparent
        opacity={0.8}
      />
      {/* Wide soft glow halo */}
      <Line
        ref={glowRef}
        points={pts}
        color="#0066ff"
        lineWidth={8}
        transparent
        opacity={0.2}
      />
      {/* Vertebral disc markers — color-coded, interactive */}
      {pts.map((pt, i) => {
        const levelData = SPINAL_LEVELS[Math.min(i, SPINAL_LEVELS.length - 1)];
        const color = CATEGORY_COLORS[levelData.category];
        return (
          <mesh
            key={`disc-${i}`}
            position={pt}
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
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Invisible hit targets — each opens a disc-specific modal */}
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
            key={i}
            position={pt}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(discOrgan);
            }}
          >
            <sphereGeometry args={[0.04, 4, 4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default SpinalCord;
