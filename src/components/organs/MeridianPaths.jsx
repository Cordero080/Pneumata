import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { meridians } from "../../data/meridians";

export default function MeridianPaths({ bodyLandmarks }) {
  const paths = useMemo(() => {
    const result = [];
    for (const meridian of meridians) {
      if (meridian.points.length < 2) continue;
      let pts = meridian.pathPoints ?? meridian.points.map((p) => p.position);

      // Lung (lu): stop the line at LU-9 (wrist) — don't draw the last
      // segment out to LU-11 (fingertip), it was cutting across empty space.
      // Dot markers for LU-11 are untouched (MeridianLayer reads meridian.points
      // directly, not this array), only the connecting line is shortened.
      if (meridian.id === "lu") pts = pts.slice(0, -1);

      // Pericardium (pc): stop the line at PC-7 (wrist) — don't draw the
      // last two segments out to PC-8/PC-9 (palm/fingertip). PC-7 is index 2
      // in this meridian's points array (PC-3, PC-6, PC-7, PC-8, PC-9).
      if (meridian.id === "pc") pts = pts.slice(0, 3);

      // Heart (ht): stop the line at HT-7 (wrist) — don't draw the last
      // segment out to HT-9 (fingertip). HT-7 is index 1 in this meridian's
      // points array (HT-3, HT-7, HT-9).
      if (meridian.id === "ht") pts = pts.slice(0, 2);

      // Gallbladder (gb): stop the line at GB-20 (nape) — don't draw the
      // rest of the path down through GB-21/30/34/40/44 (shoulder to foot).
      // GB-20 is index 2 in this meridian's pathPoints array.
      if (meridian.id === "gb") pts = pts.slice(0, 3);

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
