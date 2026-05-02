import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { nerves } from "../../data/nerves";
import { CATEGORY_COLORS } from "../../data/categories";

// Map single vertebral level name → spinePoints array index (24 levels, top→bottom)
// Each index corresponds to a SPINAL_LEVELS disc entry in spineData.js
const LEVEL_TO_INDEX = {
  C2: 0,
  C3: 1,
  C4: 2,
  C5: 3,
  C6: 4,
  C7: 5,
  T1: 6,
  T2: 7,
  T3: 8,
  T4: 9,
  T5: 10,
  T6: 11,
  T7: 12,
  T8: 13,
  T9: 14,
  T10: 15,
  T11: 16,
  T12: 17,
  L1: 18,
  L2: 19,
  L3: 20,
  L4: 21,
  L5: 22,
  S1: 23,
  S2: 23,
  S3: 23,
};

const CURVE_SAMPLES = 50;

// ─── Curve builders ─────────────────────────────────────────────────────────

function spineOrigin(spinalLevels, spinePoints, xSign) {
  const indices = spinalLevels
    .map((l) => LEVEL_TO_INDEX[l])
    .filter((i) => i !== undefined && i < spinePoints.length);
  if (!indices.length) return null;

  const avgIdx = Math.round(
    indices.reduce((s, i) => s + i, 0) / indices.length,
  );
  const pt = spinePoints[Math.min(avgIdx, spinePoints.length - 1)];

  // Start at foraminal exit only — no spine centerline point.
  // Including center → exit → landmark creates a sharp kink that Catmull-Rom
  // smooths by bowing outward, pushing nerves outside the mesh.
  return new THREE.Vector3(pt[0] + xSign * 0.022, pt[1], pt[2] + 0.025);
}

function buildCurve(nerve, spinePoints, bodyLandmarks, xSign) {
  const pts = [];

  if (nerve.spinalLevels.length > 0) {
    const exit = spineOrigin(nerve.spinalLevels, spinePoints, xSign);
    if (!exit) return null;
    pts.push(exit);
  } else {
    // Cranial nerve (vagus) — approximate brainstem/upper cervical start
    const top = spinePoints[0];
    if (!top) return null;
    pts.push(new THREE.Vector3(xSign * 0.018, top[1] + 0.06, top[2] + 0.02));
  }

  for (const key of nerve.landmarks) {
    const lm = bodyLandmarks?.[key];
    if (lm) pts.push(new THREE.Vector3(...lm));
  }

  // No landmark data — only extend laterally for thoracic nerves (intercostals etc.)
  // Cervical nerves like phrenic descend medially and shouldn't get a lateral stub.
  if (pts.length === 1) {
    const avgIdx = nerve.spinalLevels
      .map((l) => LEVEL_TO_INDEX[l])
      .filter((i) => i !== undefined)
      .reduce((s, i, _, a) => s + i / a.length, 0);
    if (avgIdx >= 6) {
      const exit = pts[0];
      pts.push(new THREE.Vector3(exit.x + xSign * 0.14, exit.y, exit.z + 0.04));
    }
  }
  if (pts.length < 2) return null;
  // tension 0.9 = very tight, stays close to control points, minimal overshoot
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.9);
}

function buildSympathethicCurves(spinePoints) {
  // Paravertebral ganglia chain — follows spine with small lateral + anterior offset
  if (spinePoints.length < 2) return [];
  return [-1, 1].map((xSign) => {
    const pts = spinePoints.map(
      (p) => new THREE.Vector3(p[0] + xSign * 0.022, p[1], p[2] + 0.018),
    );
    return new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
  });
}

function getCurvesForNerve(nerve, spinePoints, bodyLandmarks) {
  if (nerve.id === "sympathetic_chain") {
    return buildSympathethicCurves(spinePoints);
  }
  if (nerve.side === "bilateral") {
    return [-1, 1]
      .map((sign) => buildCurve(nerve, spinePoints, bodyLandmarks, sign))
      .filter(Boolean);
  }
  const xSign = nerve.side === "left" ? -1 : 1;
  const c = buildCurve(nerve, spinePoints, bodyLandmarks, xSign);
  return c ? [c] : [];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NerveSystem({
  spinePoints,
  bodyLandmarks,
  viewMode,
  hoveredCategory,
  showNerves,
}) {
  if (!showNerves || !spinePoints) return null;

  const allCurves = useMemo(() => {
    const out = {};
    for (const nerve of nerves) {
      out[nerve.id] = getCurvesForNerve(nerve, spinePoints, bodyLandmarks);
    }
    return out;
  }, [spinePoints, bodyLandmarks]);

  // Pulse animation — one t-value per nerve, advanced in useFrame
  const pulseRefs = useRef({});
  const pulseT = useRef({});

  useFrame((_, delta) => {
    for (const nerve of nerves) {
      const curves = allCurves[nerve.id];
      if (!curves?.length) continue;
      // Animate pulses for all nerves — NET shows everything regardless of viewMode

      if (pulseT.current[nerve.id] === undefined) {
        // Stagger start positions so pulses don't all fire simultaneously
        pulseT.current[nerve.id] = Math.random();
      }
      pulseT.current[nerve.id] =
        (pulseT.current[nerve.id] + delta * nerve.pulseSpeed * 0.22) % 1;

      const t0 = pulseT.current[nerve.id];

      curves.forEach((curve, ci) => {
        for (let pi = 0; pi < nerve.pulseCount; pi++) {
          const t = (t0 + pi / nerve.pulseCount) % 1;
          const ref = pulseRefs.current[`${nerve.id}_${ci}_${pi}`];
          if (ref) ref.position.copy(curve.getPoint(t));
        }
      });
    }
  });

  return (
    <>
      {nerves.flatMap((nerve) => {
        const curves = allCurves[nerve.id];
        if (!curves?.length) return [];

        const categoryColor = CATEGORY_COLORS[nerve.category] ?? "#aaaaaa";
        const color = categoryColor;
        const catMatch = !hoveredCategory || hoveredCategory === nerve.category;
        const opacity = catMatch ? 0.85 : 0.06;
        const width = catMatch ? 2.2 : 0.5;

        return curves.map((curve, ci) => {
          const points = curve.getPoints(CURVE_SAMPLES);
          return (
            <group key={`${nerve.id}_${ci}`}>
              <Line
                points={points}
                color={color}
                lineWidth={width}
                opacity={opacity}
                transparent
              />
              {Array.from({ length: nerve.pulseCount }, (_, pi) => (
                <mesh
                  key={pi}
                  ref={(el) => {
                    if (el) pulseRefs.current[`${nerve.id}_${ci}_${pi}`] = el;
                  }}
                >
                  <sphereGeometry args={[0.0038, 6, 6]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={catMatch ? 0.95 : 0.3}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          );
        });
      })}
    </>
  );
}
