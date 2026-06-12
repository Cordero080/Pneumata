import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { organs } from "../../data/organs";
import { CATEGORY_COLORS } from "../../data/categories";
import { RIB_EDGES } from "../spine/spineData";

// Primary disc index for each organ's spinal connection.
// Indices map to SPINAL_LEVELS order: 0=C2-C3, 5=C7-T1, 10=T5-T6 … 23=S1-S2.
// Cranial-only organs (eyes, ears, brain regions) are omitted — they get brain tracts below.
const NERVE_DISC = {
  vocal_cords: 0, // C1-C3 → C2-C3
  thyroid: 1, // C2-C4 → C3-C4
  diaphragm: 2, // C3-C5 (phrenic) → C4-C5
  heart: 7, // T1-T5 (cardiac accelerator) → T2-T3
  left_lung: 9, // T2-T7 (pulmonary plexus) → T4-T5
  right_lung: 9,
  bone_marrow: 8, // T2-T6 (intercostal/sternal) → T3-T4
  esophagus: 10, // T5-T6 (upper splanchnic)
  stomach: 12, // T6-T9 (celiac plexus) → T7-T8
  liver: 13, // T7-T9 (greater splanchnic) → T8-T9
  spleen: 13, // T6-T10 (celiac plexus)
  pancreas: 13, // T6-T10 (splanchnic)
  adrenals: 13, // T5-T11 (greater splanchnic); disc 13=T8 gives vertical drop to organ — T10 was same Y as adrenal, producing horizontal arc
  small_intestine: 14, // T9-T11 (lesser splanchnic)
  large_intestine: 17, // T11-L2 (lumbar splanchnic)
  right_kidney: 15, // T10-T12 (least splanchnic)
  left_kidney: 15,
  bladder: 23, // S2-S4 (pelvic splanchnic) → S1-S2
  lymph_cervical: 1, // C2-C4
  lymph_axillary: 5, // C5-T1 (brachial plexus) → C7-T1
  lymph_inguinal: 18, // L1-L2 (inguinal nerve)
};

// White matter tracts between brain region nodes.
// Each entry: [fromId, toId, label] — rendered as short direct lines.
const BRAIN_TRACTS = [
  ["left_hemisphere", "right_hemisphere", "corpus callosum"],
  ["frontal_lobe", "thalamus", "thalamocortical"],
  ["frontal_lobe", "amygdala", "prefrontal-amygdala"],
  ["amygdala", "hippocampus", "amygdalohippocampal"],
  ["thalamus", "hippocampus", "fornix-thalamic"],
  ["hypothalamus", "pituitary", "hypothalamic-pituitary axis"],
  ["hypothalamus", "brain_stem", "hypothalamospinal"],
  ["thalamus", "brain_stem", "corticospinal descending"],
];

// Body half-width at key Y levels for arc-peak clamping.
// Prevents lower thoracic arcs from grazing the body silhouette edge.
const TORSO_HALF_WIDTH = [
  [1.45, 0.11], // collar / T1
  [1.3, 0.14], // upper thorax
  [1.15, 0.15], // lower thorax / diaphragm
  [1.0, 0.13], // upper abdomen
  [0.88, 0.1], // lower abdomen
];
function torsoHalfWidthAt(y) {
  const tw = TORSO_HALF_WIDTH;
  if (y >= tw[0][0]) return tw[0][1];
  if (y <= tw[tw.length - 1][0]) return tw[tw.length - 1][1];
  for (let i = 0; i < tw.length - 1; i++) {
    const [y0, w0] = tw[i];
    const [y1, w1] = tw[i + 1];
    if (y >= y1) return w0 + (w1 - w0) * ((y0 - y) / (y0 - y1));
  }
  return 0.12;
}

function buildPath(discPt, organPos, side, discIdx) {
  const [dx, dy, dz] = discPt;
  const [ox, oy, oz] = organPos;
  const p0x = dx + side * 0.016;

  // Thoracic (T1–T12, disc idx 6–17): QuadraticBezier with derived control point.
  // Full formula: cx = 2*rx - 0.5*ox - 0.5*p0x  (accounts for both endpoints).
  // Then two clamps:
  //   (a) Midline guard — cx must stay on the same side as `side` so the arc
  //       cannot cross the spine for mid-X organs like stomach/adrenals.
  //   (b) Silhouette clamp — arc peak at t=0.5 ≈ 0.25*p0x + 0.5*cx + 0.25*ox
  //       is clamped to torso half-width at the rib Y level.
  if (discIdx >= 6 && discIdx <= 17) {
    const ribKey = side < 0 ? "L" : "R";
    const [rx, ry, rz] = RIB_EDGES[discIdx][ribKey];
    let cx = 2 * rx - 0.5 * ox - 0.5 * p0x;

    // (a) midline guard
    cx = side < 0 ? Math.min(cx, -0.01) : Math.max(cx, 0.01);

    // (b) silhouette clamp
    const maxW = torsoHalfWidthAt(ry) - 0.01;
    const peak = 0.25 * p0x + 0.5 * cx + 0.25 * ox;
    if (Math.abs(peak) > maxW) {
      cx = 2 * Math.sign(side) * maxW - 0.5 * p0x - 0.5 * ox;
    }

    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p0x, dy, dz),
      new THREE.Vector3(cx, ry, rz),
      new THREE.Vector3(ox, oy, oz),
    ).getPoints(28);
  }

  // Cervical (0–5): lateral spread increases with disc index so arcs don't converge.
  // C2 (idx 0) → baseLatX 0.040 (narrow neck); C7-T1 (idx 5) → 0.080 (wider base).
  // Lumbar/sacral (18–23): fixed 0.065 floor, unchanged.
  const baseLatX = discIdx <= 5 ? 0.04 + discIdx * 0.008 : 0.065;
  const lateralX = side * Math.max(baseLatX, Math.abs(ox) * 1.3);
  const p1 = new THREE.Vector3(
    lateralX,
    dy * 0.5 + oy * 0.5,
    dz * 0.3 + oz * 0.7,
  );
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(p0x, dy, dz),
    p1,
    new THREE.Vector3(ox, oy, oz),
  ).getPoints(24);
}

function NerveRoots({ spinePoints, hoveredCategory, viewMode, showNerves }) {
  const organMap = useMemo(
    () => Object.fromEntries(organs.map((o) => [o.id, o])),
    [],
  );

  const routes = useMemo(() => {
    if (!spinePoints) return [];
    const maxIdx = spinePoints.length - 1;

    return organs
      .filter((o) => o.type === "point" && NERVE_DISC[o.id] !== undefined)
      .flatMap((organ) => {
        const discIdx = Math.min(NERVE_DISC[organ.id], maxIdx);
        const discPt = spinePoints[discIdx];
        const color = CATEGORY_COLORS[organ.category] ?? "#ffffff";
        const ox = organ.position[0];
        const sides = Math.abs(ox) < 0.06 ? [-1, 1] : [Math.sign(ox)];

        return sides.map((side) => ({
          id: `${organ.id}_${side > 0 ? "r" : "l"}`,
          points: buildPath(discPt, organ.position, side, discIdx),
          color,
          category: organ.category,
          isBrain: false,
        }));
      });
  }, [spinePoints]);

  const brainTracts = useMemo(() => {
    return BRAIN_TRACTS.flatMap(([fromId, toId], i) => {
      const a = organMap[fromId];
      const b = organMap[toId];
      if (!a || !b) return [];
      // Slight arc — midpoint nudged anteriorly so tracts don't clip through skull
      const mid = new THREE.Vector3(
        (a.position[0] + b.position[0]) * 0.5,
        (a.position[1] + b.position[1]) * 0.5,
        Math.max(a.position[2], b.position[2]) + 0.015,
      );
      const pts = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...a.position),
        mid,
        new THREE.Vector3(...b.position),
      ]).getPoints(16);
      return [
        {
          id: `tract_${i}`,
          points: pts,
          color: CATEGORY_COLORS.logic,
          isBrain: true,
        },
      ];
    });
  }, [organMap]);

  const allRoutes = [...routes, ...brainTracts];
  if (!allRoutes.length) return null;

  // Base visibility from view mode (no NET)
  const modeVisible = viewMode === "unified" || viewMode === "logic";

  return (
    <>
      {allRoutes.map(({ id, points, color, category, isBrain }) => {
        const active = !isBrain && hoveredCategory === category;
        // NET on: full nerve map at high opacity in every mode
        // Mode visible (logic/unified): faint background nerves
        // Otherwise: nearly invisible
        const coreOpacity = active
          ? 0.9
          : showNerves
            ? isBrain
              ? 0.55
              : 0.72
            : modeVisible
              ? isBrain
                ? 0.25
                : 0.35
              : 0.08;
        const coreWidth = active
          ? 1.5
          : showNerves
            ? isBrain
              ? 0.8
              : 1.2
            : modeVisible
              ? isBrain
                ? 0.6
                : 1.0
              : 0.3;
        return (
          <Line
            key={id}
            points={points}
            color={color}
            lineWidth={coreWidth}
            transparent
            opacity={coreOpacity}
            toneMapped={false}
          />
        );
      })}
    </>
  );
}

export default NerveRoots;
