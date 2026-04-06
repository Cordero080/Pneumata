import { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { buildSegments } from "./spineData";

function SpineLines({ pts, SC, nodeOpacity }) {
  const coreRefs = useRef([]);
  const glowRefs = useRef([]);
  const segments = useMemo(() => buildSegments(pts), [pts]);

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
  });

  // Cauda equina — nerve roots descending from conus medullaris (~L1) to sacrum
  const caudaLines = useMemo(() => {
    const conus = pts[Math.max(0, Math.floor(pts.length * 0.55))];
    return Array.from({ length: 9 }, (_, i) => {
      const frac = i / 8;
      const lateral = (frac - 0.5) * 0.038;
      const endY = conus[1] - 0.07 - frac * 0.09;
      const endZ = conus[2] + 0.004;
      const midY = conus[1] - 0.03;
      return {
        key: `ce-${i}`,
        points: [
          [conus[0], conus[1], conus[2]],
          [lateral * 0.35, midY, conus[2]],
          [lateral, endY, endZ],
        ],
      };
    });
  }, [pts]);

  return (
    <>
      {segments.map((seg, i) => (
        <Line
          key={`core-${i}`}
          ref={(el) => (coreRefs.current[i] = el)}
          points={seg}
          color={SC.core}
          lineWidth={1.5}
          transparent
          opacity={SC.coreOp}
          depthTest={false}
        />
      ))}
      {segments.map((seg, i) => (
        <Line
          key={`glow-${i}`}
          ref={(el) => (glowRefs.current[i] = el)}
          points={seg}
          color={SC.glow}
          lineWidth={8}
          transparent
          opacity={SC.glowOp}
          depthTest={false}
        />
      ))}
      {caudaLines.map(({ key, points }) => (
        <Line
          key={key}
          points={points}
          color={SC.cauda}
          lineWidth={0.55}
          transparent
          opacity={SC.caudaOp}
          depthTest={false}
        />
      ))}
    </>
  );
}

export default SpineLines;
