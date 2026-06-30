import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { meridians } from "../../data/meridians";

export default function MeridianPaths({ bodyLandmarks }) {
  const paths = useMemo(() => {
    const result = [];
    for (const meridian of meridians) {
      if (meridian.points.length < 2) continue;
      let pts = meridian.pathPoints ?? meridian.points.map((p) => p.position);

      // Replace first pathPoint with actual mesh-sampled wrist position (nerve endpoint)
      if (meridian.handPathLandmark && meridian.pathPoints) {
        const hr = bodyLandmarks?.wrist_right;
        const hl = bodyLandmarks?.wrist_left;
        const tail = pts.slice(1);
        const ptsR = hr ? [hr, ...tail] : pts;
        const ptsL = hl
          ? [hl, ...tail.map(([x, y, z]) => [-x, y, z])]
          : pts.map(([x, y, z]) => [-x, y, z]);
        result.push({
          id: `${meridian.id}-L`,
          color: meridian.color,
          points: ptsR,
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: ptsL,
        });
        continue;
      }

      if (meridian.bilateral) {
        result.push({
          id: `${meridian.id}-L`,
          color: meridian.color,
          points: pts,
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: pts.map(([x, y, z]) => [-x, y, z]),
        });
      } else {
        result.push({ id: meridian.id, color: meridian.color, points: pts });
      }
    }
    return result;
  }, [bodyLandmarks]);

  return (
    <group>
      {paths.map(({ id, color, points }) => (
        <Line
          key={id}
          points={points}
          color={color}
          lineWidth={1.0}
          transparent
          opacity={0.55}
          depthWrite={false}
          depthTest={false}
          renderOrder={5}
        />
      ))}
    </group>
  );
}
