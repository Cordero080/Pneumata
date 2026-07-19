import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { meridians } from "../../data/meridians";
import { femaleMeridians } from "../../data/femaleMeridians";

// A single "qi" strip that travels one meridian line in flow order (the point
// array is already ordered), hugging the curve — no trailing geometry that
// pokes outside bends. Its brightness is a sawtooth: it FLARES the instant it
// reaches an acupoint node, then fades toward the next node where it flares
// again (in TCM the points are where qi gathers). Electric white with an
// additive glow sprite for the electromagnetic feel. meshBasicMaterial + one
// sprite, no lighting — cheap.
const QI_SPEED = 0.16; // fraction of the line per second
const QI_COLOR = "#ffffff"; // electric white
const QI_LEN = 0.018; // strip length (small)
const QI_RADIUS = 0.001; // ~line width
const QI_GLOW = 0.022; // glow sprite base scale
const QI_FLASH_DIST = 0.025; // proximity (world units) counted as "reached a node"
const QI_FLOOR = 0.14; // dim baseline brightness between nodes
const QI_DECAY = 2.6; // how fast the flare fades toward the next node
const CYL_AXIS = new THREE.Vector3(0, 1, 0); // cylinderGeometry default axis

// Soft radial glow texture, built once and shared by every pulse's sprite.
let _glowTex = null;
function glowTexture() {
  if (_glowTex) return _glowTex;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

function QiPulse({ points, nodes, phase }) {
  const groupRef = useRef();
  const stripRef = useRef();
  const glowRef = useRef();
  const pos = useRef(new THREE.Vector3());
  const tan = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());
  const energy = useRef(0); // 1 at a node, decays toward the next
  const wasNear = useRef(false);
  const curve = useMemo(() => {
    if (!points || points.length < 2) return null;
    const v = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(v, false);
  }, [points]);
  const nodeVecs = useMemo(
    () => (nodes ?? []).map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [nodes],
  );

  useFrame((state, delta) => {
    if (!curve || !groupRef.current) return;
    const t = (state.clock.getElapsedTime() * QI_SPEED + phase) % 1;
    curve.getPoint(t, pos.current);
    curve.getTangent(t, tan.current).normalize();
    quat.current.setFromUnitVectors(CYL_AXIS, tan.current);
    groupRef.current.position.copy(pos.current);
    groupRef.current.quaternion.copy(quat.current);

    // Sawtooth: flare to 1 on entering a node's radius, else decay.
    let minD = Infinity;
    for (const nv of nodeVecs) {
      const d = pos.current.distanceTo(nv);
      if (d < minD) minD = d;
    }
    const near = minD < QI_FLASH_DIST;
    if (near && !wasNear.current) energy.current = 1;
    wasNear.current = near;
    energy.current *= Math.exp(-delta * QI_DECAY);

    const bright = QI_FLOOR + energy.current * (1 - QI_FLOOR);
    if (stripRef.current) stripRef.current.material.opacity = bright;
    if (glowRef.current) {
      glowRef.current.material.opacity = bright * 0.9;
      const s = QI_GLOW * (0.6 + 0.9 * energy.current);
      glowRef.current.scale.set(s, s, 1);
    }
  });

  if (!curve) return null;
  return (
    <group ref={groupRef} renderOrder={7}>
      <mesh ref={stripRef}>
        <cylinderGeometry args={[QI_RADIUS, QI_RADIUS, QI_LEN, 5]} />
        <meshBasicMaterial
          color={QI_COLOR}
          transparent
          opacity={QI_FLOOR}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      <sprite ref={glowRef} scale={[QI_GLOW, QI_GLOW, 1]}>
        <spriteMaterial
          map={glowTexture()}
          color={QI_COLOR}
          transparent
          opacity={QI_FLOOR}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

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
// Female neck guide — routes the neck arc BACK toward the C5–C6 discs at the
// base of the female neck (midline, posterior) so it curves into the neck
// instead of hovering outside the lower, narrower female traps.
const FEMALE_CERVICAL_LYMPH = [0, 1.35, -0.05];

// Back-of-arm elbow — shared guide for the dorsal-arm meridians (SI, TW) whose
// lines jump from the lower arm to the shoulder/scapula and skip the elbow.
// Located off the checked LI-11 lateral-elbow node [0.29,1.1,0.01], nudged
// dorsal (z negative).
const DORSAL_ELBOW = [0.29, 1.1, -0.03];
// Female elbow — lower and slightly more medial (female arm sits lower and
// narrower) so the orange dorsal-arm lines (TW, SI) curve INTO the arm.
const FEMALE_DORSAL_ELBOW = [0.26, 1.0, -0.03];

// GB nape→shoulder guide — pulled in toward the C5–C6 disc (male spine ≈
// [0, 1.478, -0.038]) so the arc's halfway point dips deep into the neck
// instead of bowing outside the trapezius. Nearly midline + posterior.
const GB_NECK = [0.015, 1.51, -0.05];
const FEMALE_GB_NECK = [0.012, 1.38, -0.045]; // lower for the shorter female neck

// Smooth curve PASSING THROUGH every point in `points` (endpoints + interior
// guides). Centripetal Catmull-Rom — used when a segment needs more than one
// interior anchor (e.g. side-of-neck lymph node AND a jaw/cheek bend).
function curveThrough(points, samples = 24) {
  const v = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return new THREE.CatmullRomCurve3(v, false, "centripetal")
    .getPoints(samples)
    .map((p) => [p.x, p.y, p.z]);
}

export default function MeridianPaths({ bodyLandmarks, femaleMode = false, showQi = false }) {
  const paths = useMemo(() => {
    const result = [];
    const source = femaleMode ? femaleMeridians : meridians;
    const lymph = femaleMode ? FEMALE_CERVICAL_LYMPH : CERVICAL_LYMPH;
    const gbNeck = femaleMode ? FEMALE_GB_NECK : GB_NECK;
    for (const meridian of source) {
      if (meridian.points.length < 2) continue;
      let pts = meridian.pathPoints ?? meridian.points.map((p) => p.position);
      // Raw acupoint positions for the qi "pit-stop" swell — one side as-is,
      // the other mirrored, matching how the drawn line's L/R are built below.
      const nodesL = meridian.points.map((p) => p.position);
      const nodesR = nodesL.map(([x, y, z]) => [-x, y, z]);

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

      // Gallbladder (gb): now node-driven (pathPoints removed) so GB-20 is the
      // top node — the line no longer floats up to the eye/temple past it.
      // Show the upper segment GB-20 → GB-21 → GB-30 (nape → shoulder → hip),
      // and curve GB-20 → GB-21 IN through the neck (via gbNeck) so it doesn't
      // bow outside the trapezius. Widen the slice as lower GB nodes get placed.
      if (meridian.id === "gb") {
        pts = pts.slice(0, 3); // GB-20, GB-21, GB-30
        const neckArc = arcThroughGuide(pts[0], gbNeck, pts[1]); // GB-20 → interior → GB-21
        pts = [...neckArc, ...pts.slice(2)]; // + GB-30
      }

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
        // Arm SI-4 → SI-11 stays straight (nodes are placed on the arm).
        // Neck: SI-11 → SI-19 curves through the cervical lymph node.
        const neckArc = arcThroughGuide(pts[1], lymph, pts[2]);
        pts = [pts[0], ...neckArc]; // SI-4 → SI-11 → neck arc → SI-19
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
        const neck = curveThrough([pts[2], lymph, jaw, pts[3]]);
        pts = [pts[0], pts[1], ...neck]; // LI-10 → LI-11 → smooth neck curve → LI-20
      }

      // Triple Warmer (tw): curve the last segment TW-14 → TW-23 through the
      // cervical lymph node so it routes up the neck instead of a straight
      // diagonal from the back-shoulder to the front-of-face eyebrow. Points
      // are [TW-4, TW-5, TW-14, TW-23]; arm portion stays straight.
      if (meridian.id === "tw") {
        // Arm TW-4 → TW-5 → TW-14 stays straight (nodes are placed on the arm;
        // the old elbow arc over-warped near TW-5). Neck: TW-14 → TW-23 curves
        // through the lymph node.
        const neckArc = arcThroughGuide(pts[2], lymph, pts[3]); // TW-14 → lymph → TW-23
        pts = [pts[0], pts[1], ...neckArc]; // TW-4 → TW-5 → TW-14 → neck arc → TW-23
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
          nodes: nodesL,
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: applyBow(meridian.id, ptsL),
          nodes: nodesR,
        });
        continue;
      }

      if (meridian.bilateral) {
        result.push({
          id: `${meridian.id}-L`,
          color: meridian.color,
          points: applyBow(meridian.id, pts),
          nodes: nodesL,
        });
        result.push({
          id: `${meridian.id}-R`,
          color: meridian.color,
          points: applyBow(
            meridian.id,
            pts.map(([x, y, z]) => [-x, y, z]),
          ),
          nodes: nodesR,
        });
      } else {
        result.push({
          id: meridian.id,
          color: meridian.color,
          points: applyBow(meridian.id, pts),
          nodes: nodesL,
        });
      }
    }

    return result;
  }, [bodyLandmarks, femaleMode]);

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
      {showQi && paths.map(({ id, points, nodes }, i) => (
        <QiPulse
          key={`qi-${id}`}
          points={points}
          nodes={nodes}
          phase={(i * 0.61803) % 1}
        />
      ))}
    </group>
  );
}
