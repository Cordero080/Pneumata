import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { meridians } from "../../data/meridians";

// ── Interior-bow routing ──────────────────────────────────────────────────
// Same principle proven for the nerve arcs (docs/nerve-routing-technique.md):
// a QuadraticBezier control point PULLS the curve toward a target but the
// curve never passes through it, so it can't overshoot/loop outward. Here the
// target is the body core — each segment's control point is its midpoint
// pulled toward the central axis (x→0, z→0), so every long segment bows
// INWARD through the body instead of taking the straight shortest path that
// escapes the silhouette.
//
// Tuning: raise LATERAL_PULL / DEPTH_PULL to bow deeper into the body.
const BOW_LATERAL_PULL = 0.35; // how hard the mid gets pulled toward x=0
const BOW_DEPTH_PULL = 0.35; // how hard the mid gets pulled toward z=0 (core)
const BOW_SEG_SAMPLES = 16; // points sampled per segment

// Meridians that get interior-bow routing. Start with one to eyeball it in
// isolation; add ids here once the look is dialed in.
const INTERIOR_BOW_IDS = new Set(["bl"]);

function bowInterior(pts) {
  if (pts.length < 2) return pts;
  const v = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const out = [];
  for (let i = 0; i < v.length - 1; i++) {
    const a = v[i];
    const b = v[i + 1];
    const mid = a.clone().lerp(b, 0.5);
    const control = new THREE.Vector3(
      mid.x * (1 - BOW_LATERAL_PULL),
      mid.y,
      mid.z * (1 - BOW_DEPTH_PULL),
    );
    const seg = new THREE.QuadraticBezierCurve3(a, control, b).getPoints(
      BOW_SEG_SAMPLES,
    );
    // Drop the first sample of every segment after the first to avoid
    // duplicating the shared node between consecutive segments.
    out.push(...(i === 0 ? seg : seg.slice(1)));
  }
  return out;
}

function applyBow(id, pts) {
  return INTERIOR_BOW_IDS.has(id) ? bowInterior(pts) : pts;
}

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

      // Small Intestine (si): start the line at SI-4 (wrist) — drop SI-3, the
      // hand point (index 0), whose position field is a hand-landmark
      // placeholder that would otherwise shoot the line down to the thigh.
      // Line runs SI-4 → SI-11 → SI-19, same "stop at the wrist" rule as LU/PC/HT.
      if (meridian.id === "si") pts = pts.slice(1);

      // Large Intestine (li): start the line at LI-10 (forearm) — drop LI-4,
      // the hand point (index 0), whose hand-landmark position sits on the
      // wrist and made the line terminate on the PC-9 node. Line runs
      // LI-10 → LI-11 → LI-15 → LI-20.
      if (meridian.id === "li") pts = pts.slice(1);

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
          points: applyBow(meridian.id, ptsR),
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: applyBow(meridian.id, ptsL),
        });
        continue;
      }

      if (meridian.bilateral) {
        result.push({
          id: `${meridian.id}-L`,
          color: meridian.color,
          points: applyBow(meridian.id, pts),
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: applyBow(
            meridian.id,
            pts.map(([x, y, z]) => [-x, y, z]),
          ),
        });
      } else {
        result.push({
          id: meridian.id,
          color: meridian.color,
          points: applyBow(meridian.id, pts),
        });
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
