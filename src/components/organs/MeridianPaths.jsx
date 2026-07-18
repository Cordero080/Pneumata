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

// Smooth arc from p0 to p2 that PASSES THROUGH `guide` at its midpoint.
// Derives the QuadraticBezier control point (midpoint = 0.25·p0 + 0.5·ctrl +
// 0.25·p2, solved for ctrl) so an interior anatomical point — e.g. the
// cervical lymph node — becomes a real anchor the neck segment routes through,
// not just leans toward. Same derived-control idea as the nerve arcs.
function arcThroughGuide(p0, guide, p2, samples = 16) {
  const control = [
    2 * guide[0] - 0.5 * p0[0] - 0.5 * p2[0],
    2 * guide[1] - 0.5 * p0[1] - 0.5 * p2[1],
    2 * guide[2] - 0.5 * p0[2] - 0.5 * p2[2],
  ];
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...p0),
    new THREE.Vector3(...control),
    new THREE.Vector3(...p2),
  )
    .getPoints(samples)
    .map((v) => [v.x, v.y, v.z]);
}

// Cervical lymph node (interior neck) — shared anatomical guide for neck arcs.
// Coord from lymph_cervical in organs.js.
const CERVICAL_LYMPH = [0.04, 1.51, 0.01];

// Back-of-arm elbow — shared guide for the dorsal-arm meridians (SI, TW) whose
// lines jump from the lower arm to the shoulder/scapula and skip the elbow.
// Located off the checked LI-11 lateral-elbow node [0.29,1.1,0.01], nudged
// dorsal (z negative).
const DORSAL_ELBOW = [0.29, 1.1, -0.03];

// Smooth curve PASSING THROUGH every point in `points` (endpoints + interior
// guides). Centripetal Catmull-Rom — used when a segment needs more than one
// interior anchor (e.g. side-of-neck lymph node AND a jaw/cheek bend).
function curveThrough(points, samples = 24) {
  const v = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return new THREE.CatmullRomCurve3(v, false, "centripetal")
    .getPoints(samples)
    .map((p) => [p.x, p.y, p.z]);
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
      // directly, not this array), only the connecting line is shortened. Then
      // smooth shoulder → elbow → forearm → wrist through the checked nodes
      // (LU-1, LU-5, LU-7; LU-9 is the wrist endpoint).
      if (meridian.id === "lu") pts = curveThrough(pts.slice(0, -1));

      // Pericardium (pc): stop the line at PC-7 (wrist) — don't draw the
      // last two segments out to PC-8/PC-9 (palm/fingertip) — then smooth the
      // anterior forearm through all three checked nodes (PC-3 elbow, PC-6
      // forearm, PC-7 wrist).
      if (meridian.id === "pc") pts = curveThrough(pts.slice(0, 3));

      // Heart (ht): stop the line at HT-7 (wrist) — don't draw the last
      // segment out to HT-9 (fingertip). HT-7 is index 1 in this meridian's
      // points array (HT-3, HT-7, HT-9).
      if (meridian.id === "ht") pts = pts.slice(0, 2);

      // Gallbladder (gb): stop the line at GB-20 (nape) — don't draw the
      // rest of the path down through GB-21/30/34/40/44 (shoulder to foot).
      // GB-20 is index 2 in this meridian's pathPoints array.
      if (meridian.id === "gb") pts = pts.slice(0, 3);

      // Spleen (sp): smooth the leg portion (SP-3 → SP-6 → SP-9 → SP-10) into
      // one curve riding the inner-leg contour, anchored by the checked SP-6
      // (ankle) and SP-10 (thigh). Then curve SP-10 → SP-21 (thigh → chest)
      // through the hip landmark so it rides up over the hip instead of a flat
      // diagonal across the abdomen. (Abdominal organ nodes all cluster near
      // SP-21, so the mesh-sampled hip is the better mid-span anchor.)
      if (meridian.id === "sp") {
        const legCurve = curveThrough(pts.slice(0, 4));
        const hip = bodyLandmarks?.hip_right;
        const torso = hip
          ? arcThroughGuide(pts[3], hip, pts[4]) // SP-10 → hip → SP-21
          : [pts[3], pts[4]];
        pts = [...legCurve, ...torso.slice(1)]; // join at SP-10
      }

      // Small Intestine (si): start the line at SI-4 (wrist) — drop SI-3, the
      // hand point (index 0), whose position field is a hand-landmark
      // placeholder that would otherwise shoot the line down to the thigh.
      // Then replace the straight SI-11 → SI-19 chord with a smooth
      // QuadraticBezier arc pulled toward the cervical lymph node (interior
      // neck, coord from lymph_cervical in organs.js), so the neck segment
      // curves inward up the neck. Arm portion (SI-4 → SI-11) stays straight.
      if (meridian.id === "si") {
        pts = pts.slice(1); // → [SI-4, SI-11, SI-19]
        // Arm: curve SI-4 (wrist) → SI-11 (scapula) through the elbow so it
        // rides up the back of the arm instead of cutting medial across the gap.
        const armArc = arcThroughGuide(pts[0], DORSAL_ELBOW, pts[1]); // SI-4 → elbow → SI-11
        // Neck: SI-11 → SI-19 through the cervical lymph node.
        const neckArc = arcThroughGuide(pts[1], CERVICAL_LYMPH, pts[2]);
        pts = [...armArc, ...neckArc.slice(1)]; // join at SI-11 without duplicating it
      }

      // Large Intestine (li): start the line at LI-10 (forearm) — drop LI-4,
      // the hand point (index 0), whose hand-landmark position sits on the
      // wrist and made the line terminate on the PC-9 node. Then curve the
      // last segment LI-15 → LI-20 (shoulder → beside nostril) through the
      // cervical lymph node so it runs up the front of the neck to the face,
      // instead of a straight diagonal. Arm portion stays straight.
      if (meridian.id === "li") {
        pts = pts.slice(1); // → [LI-10, LI-11, LI-15, LI-20]
        // Two guides: lymph node (lower, side of neck) then a jaw/cheek bend
        // (upper) so the curve comes up the side of the neck and forward under
        // the jaw before reaching the nostril. Jaw point derived from the
        // thyroid ref [0,1.53,0.03] — its height/forward-depth, kept lateral.
        const jaw = [0.05, 1.56, 0.05];
        const neck = curveThrough([pts[2], CERVICAL_LYMPH, jaw, pts[3]]);
        pts = [pts[0], pts[1], ...neck]; // LI-10 → LI-11 → smooth neck curve → LI-20
      }

      // Triple Warmer (tw): curve the last segment TW-14 → TW-23 through the
      // cervical lymph node so it routes up the neck instead of a straight
      // diagonal from the back-shoulder to the front-of-face eyebrow. Points
      // are [TW-4, TW-5, TW-14, TW-23]; arm portion stays straight.
      if (meridian.id === "tw") {
        // Arm: curve TW-5 (forearm) → TW-14 (shoulder) through the elbow so
        // the upper arm doesn't bulge lateral. Neck: TW-14 → TW-23 through
        // the lymph node (as before). TW-4 → TW-5 stays straight.
        const armArc = arcThroughGuide(pts[1], DORSAL_ELBOW, pts[2]); // TW-5 → elbow → TW-14
        const neckArc = arcThroughGuide(pts[2], CERVICAL_LYMPH, pts[3]); // TW-14 → lymph → TW-23
        pts = [pts[0], ...armArc, ...neckArc.slice(1)]; // join at TW-14 without duplicating
      }

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
