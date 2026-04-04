import { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Smooth z-values with a 3-point moving average to remove sampling noise
function smoothPoints(pts, passes = 2) {
  let out = pts.map((p) => [...p]);
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 1; i < out.length - 1; i++) {
      out[i][2] = (out[i - 1][2] + out[i][2] + out[i + 1][2]) / 3;
      out[i][1] = (out[i - 1][1] + out[i][1] + out[i + 1][1]) / 3;
    }
  }
  return out;
}

// Build N-1 shortened segments between disc points, leaving a gap at each disc
function buildSegments(pts, gapHalf = 0.007) {
  const segments = [];
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const dir = new THREE.Vector3();
  for (let i = 0; i < pts.length - 1; i++) {
    v1.set(...pts[i]);
    v2.set(...pts[i + 1]);
    dir.subVectors(v2, v1).normalize();
    segments.push([
      [v1.x + dir.x * gapHalf, v1.y + dir.y * gapHalf, v1.z + dir.z * gapHalf],
      [v2.x - dir.x * gapHalf, v2.y - dir.y * gapHalf, v2.z - dir.z * gapHalf],
    ]);
  }
  return segments;
}

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
  const coreRefs = useRef([]);
  const glowRefs = useRef([]);
  const discRefs = useRef([]);

  // Sync hoveredCategory into a ref so useFrame can read it without stale closure
  const hoveredCategoryRef = useRef(null);
  hoveredCategoryRef.current = hoveredCategory;
  const hoveredDiscIndexRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.7 + Math.sin(t * 2.5) * 0.3;

    const coreTarget = pulse * nodeOpacity;
    const glowTarget = pulse * 0.25 * nodeOpacity;
    coreRefs.current.forEach((r) => {
      if (r?.material)
        r.material.opacity += (coreTarget - r.material.opacity) * 0.08;
    });
    glowRefs.current.forEach((r) => {
      if (r?.material)
        r.material.opacity += (glowTarget - r.material.opacity) * 0.08;
    });

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

  const pts = useMemo(
    () => smoothPoints(dynamicPoints ?? organ.points),
    [dynamicPoints, organ.points],
  );
  const segments = useMemo(() => buildSegments(pts), [pts]);

  // Disc orientations — average of neighboring segment directions so discs tilt with the spine
  const discQuats = useMemo(() => {
    const _Y = new THREE.Vector3(0, 1, 0);
    return pts.map((_, i) => {
      const curr = new THREE.Vector3(...pts[i]);
      const hasPrev = i > 0;
      const hasNext = i < pts.length - 1;
      let dir;
      if (hasPrev && hasNext) {
        const d1 = new THREE.Vector3()
          .subVectors(curr, new THREE.Vector3(...pts[i - 1]))
          .normalize();
        const d2 = new THREE.Vector3()
          .subVectors(new THREE.Vector3(...pts[i + 1]), curr)
          .normalize();
        dir = new THREE.Vector3().addVectors(d1, d2).normalize();
      } else if (hasNext) {
        dir = new THREE.Vector3()
          .subVectors(new THREE.Vector3(...pts[i + 1]), curr)
          .normalize();
      } else {
        dir = new THREE.Vector3()
          .subVectors(curr, new THREE.Vector3(...pts[i - 1]))
          .normalize();
      }
      return new THREE.Quaternion().setFromUnitVectors(_Y, dir);
    });
  }, [pts]);

  // Vertebral bodies — cylinder between each pair of disc points, oriented along spine
  // Radius scales anatomically: cervical (top, i=0) smallest → lumbar (bottom) largest
  const vertebrae = useMemo(() => {
    const _Y = new THREE.Vector3(0, 1, 0);
    const _X = new THREE.Vector3(1, 0, 0);
    const total = pts.length - 1;
    return pts.slice(0, -1).map((pt, i) => {
      const a = new THREE.Vector3(...pt);
      const b = new THREE.Vector3(...pts[i + 1]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const height = dir.length() * 0.55;
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      dir.normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(_Y, dir);
      // Cervical: 0.014 → Lumbar: 0.030
      const tNorm = i / (total - 1);
      const radius = 0.014 + tNorm * 0.016;

      // Spinous process: perpendicular to spine axis, pointing posteriorly (-z)
      const posterior = new THREE.Vector3().crossVectors(dir, _X).normalize();
      if (posterior.z > 0) posterior.negate();
      const spinousQuat = new THREE.Quaternion().setFromUnitVectors(
        _Y,
        posterior,
      );
      // Longest in mid-thoracic (sin peak), shorter at cervical and lumbar
      const spinousLen = 0.012 + Math.sin(tNorm * Math.PI) * 0.018;
      const spinousCenter = mid
        .clone()
        .add(posterior.clone().multiplyScalar(radius + spinousLen * 0.5));

      // Transverse processes: two halves with central gap, offset posteriorly to attach at arch
      const canalHalf = radius * 0.7;
      // Lumbar processes are stubbier/wider, cervical are narrower
      const transHalfLen = radius * 0.85 + tNorm * radius * 0.3;
      const transOffset = canalHalf + transHalfLen / 2;
      // Shift posteriorly so they attach at the pedicles behind the body
      const postShift = posterior.clone().multiplyScalar(radius * 0.55);

      // Superior pitch: thoracic processes angle upward most (~15°), cervical/lumbar near-horizontal
      // Rotate around global Z axis so all vertebrae pitch consistently
      const transPitch = Math.sin(tNorm * Math.PI) * 0.26;
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        transPitch,
      );
      // Right process: tip at +X, base at -X; taper outward
      const rightTransQuat = new THREE.Quaternion()
        .setFromUnitVectors(_Y, _X)
        .premultiply(pitchQuat);
      // Left process: tip at -X — mirror so taper is still tip-outward
      const _X_neg = new THREE.Vector3(-1, 0, 0);
      const leftTransQuat = new THREE.Quaternion()
        .setFromUnitVectors(_Y, _X_neg)
        .premultiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            -transPitch,
          ),
        );

      const leftTrans = [
        mid.x - transOffset + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      ];
      const rightTrans = [
        mid.x + transOffset + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      ];

      // Vertebral body as a lathe profile: waisted barrel with flared endplates
      // Profile: wider at top/bottom (endplates), narrower at waist (center)
      const h = height;
      const bodyGeo = new THREE.LatheGeometry(
        [
          new THREE.Vector2(radius * 1.06, -h / 2),
          new THREE.Vector2(radius * 0.93, -h * 0.28),
          new THREE.Vector2(radius * 0.84, 0),
          new THREE.Vector2(radius * 0.93, h * 0.28),
          new THREE.Vector2(radius * 1.06, h / 2),
        ],
        12,
      );

      return {
        mid,
        height,
        quat,
        radius,
        bodyGeo,
        spinousQuat,
        spinousLen,
        spinousCenter,
        transHalfLen,
        leftTransQuat,
        rightTransQuat,
        leftTrans,
        rightTrans,
      };
    });
  }, [pts]);

  return (
    <group>
      {/* Segmented PCIe trace — gaps at each disc level */}
      {segments.map((seg, i) => (
        <Line
          key={`core-${i}`}
          ref={(el) => (coreRefs.current[i] = el)}
          points={seg}
          color="#00d4ff"
          lineWidth={1.5}
          transparent
          opacity={0.8}
        />
      ))}
      {segments.map((seg, i) => (
        <Line
          key={`glow-${i}`}
          ref={(el) => (glowRefs.current[i] = el)}
          points={seg}
          color="#0066ff"
          lineWidth={8}
          transparent
          opacity={0.2}
        />
      ))}
      {/* Vertebral body glow — faint bone-white cylinder at each inter-disc space */}
      {vertebrae.map(
        (
          {
            mid,
            height,
            quat,
            radius,
            bodyGeo,
            spinousQuat,
            spinousLen,
            spinousCenter,
            transHalfLen,
            leftTransQuat,
            rightTransQuat,
            leftTrans,
            rightTrans,
          },
          i,
        ) => (
          <group key={`vb-${i}`}>
            {/* Vertebral body — waisted lathe profile */}
            <mesh position={mid} quaternion={quat}>
              <primitive object={bodyGeo} attach="geometry" />
              <meshStandardMaterial
                color="#a8c8ff"
                emissive="#6699cc"
                emissiveIntensity={2.5}
                transparent
                opacity={0.22}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {/* Spinous process — tapered spike pointing posteriorly */}
            <mesh position={spinousCenter} quaternion={spinousQuat}>
              <cylinderGeometry args={[0.003, 0.005, spinousLen, 6]} />
              <meshStandardMaterial
                color="#a8c8ff"
                emissive="#6699cc"
                emissiveIntensity={2.5}
                transparent
                opacity={0.18}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {/* Transverse processes — tapered, pitched upward at thoracic */}
            {[
              [leftTrans, leftTransQuat],
              [rightTrans, rightTransQuat],
            ].map(([pos, tq], side) => (
              <mesh key={side} position={pos} quaternion={tq}>
                <cylinderGeometry args={[0.001, 0.003, transHalfLen, 6]} />
                <meshStandardMaterial
                  color="#a8c8ff"
                  emissive="#6699cc"
                  emissiveIntensity={2.5}
                  transparent
                  opacity={0.16}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        ),
      )}

      {/* Vertebral disc markers — color-coded, interactive */}
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
