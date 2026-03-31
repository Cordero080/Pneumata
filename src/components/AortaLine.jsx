import { useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

// Aorta: emerges from left ventricle, arches at T3 level, descends left of spine
// to bifurcation at L4. z goes anterior→posterior as it descends behind organs.
const AORTA_POINTS = [
  [-0.04, 1.3, 0.06], // origin: left ventricle (heart)
  [-0.02, 1.45, 0.02], // ascending aorta / arch apex (~T3, corrected higher)
  [0.02, 1.28, -0.02], // proximal descending thoracic (body's left of spine)
  [0.02, 1.1, -0.04], // mid descending thoracic
  [0.01, 0.92, -0.02], // abdominal aorta
  [0.0, 0.8, -0.01], // bifurcation (~L4)
];

function AortaLine({ opacity }) {
  const coreRef = useRef();
  const glowRef = useRef();

  useFrame(() => {
    if (!coreRef.current?.material) return;

    // Smooth opacity transition toward target
    const mat = coreRef.current.material;
    mat.opacity += (opacity - mat.opacity) * 0.08;

    const glowMat = glowRef.current?.material;
    if (glowMat) {
      glowMat.opacity += (opacity * 0.3 - glowMat.opacity) * 0.08;
    }

    // Positive increment = dashes travel from start→end (heart → bifurcation)
    if (mat.dashOffset !== undefined) {
      mat.dashOffset += 0.006;
    }
  });

  return (
    <group>
      {/* Core arterial trace */}
      <Line
        ref={coreRef}
        points={AORTA_POINTS}
        color="#ff3131"
        lineWidth={1.8}
        transparent
        opacity={opacity}
        dashed
        dashSize={0.018}
        gapSize={0.012}
      />
      {/* Soft red glow */}
      <Line
        ref={glowRef}
        points={AORTA_POINTS}
        color="#880000"
        lineWidth={7}
        transparent
        opacity={opacity * 0.3}
      />
    </group>
  );
}

export default AortaLine;
