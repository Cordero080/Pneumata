import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { smoothPoints } from "./spineData";

const CURVE_SAMPLES = 80;

const TRACTS = [
  {
    id: "dorsal_l",
    xOff: -0.002,
    color: new THREE.Color("#00d4ff"),
    dir: 1,
    speed: 0.09,
    pulses: 3,
  },
  {
    id: "dorsal_r",
    xOff: 0.002,
    color: new THREE.Color("#00aaff"),
    dir: 1,
    speed: 0.1,
    pulses: 3,
  },
  {
    id: "spinothal_a",
    xOff: -0.0012,
    color: new THREE.Color("#cc55ff"),
    dir: 1,
    speed: 0.07,
    pulses: 3,
  },
  {
    id: "spinothal_l",
    xOff: 0.0012,
    color: new THREE.Color("#aa33ee"),
    dir: 1,
    speed: 0.08,
    pulses: 3,
  },
  {
    id: "spinocereb_a",
    xOff: -0.0004,
    color: new THREE.Color("#22dd88"),
    dir: 1,
    speed: 0.06,
    pulses: 2,
  },
  {
    id: "spinocereb_b",
    xOff: -0.0004,
    color: new THREE.Color("#c7dd22"),
    dir: 1,
    speed: 0.06,
    pulses: 2,
  },
  {
    id: "spinocereb_c",
    xOff: -0.0004,
    color: new THREE.Color("#22dd88"),
    dir: 1,
    speed: 0.06,
    pulses: 2,
  },
  {
    id: "spinocereb_p",
    xOff: 0.0004,
    color: new THREE.Color("#dcf78b"),
    dir: 1,
    speed: 0.05,
    pulses: 2,
  },
  {
    id: "cortico_l",
    xOff: -0.0016,
    color: new THREE.Color("#fe7159"),
    dir: -1,
    speed: 0.09,
    pulses: 3,
  },
  {
    id: "cortico_r",
    xOff: 0.0016,
    color: new THREE.Color("#ff6600"),
    dir: -1,
    speed: 0.08,
    pulses: 3,
  },
  {
    id: "cortico_ant",
    xOff: 0.0,
    color: new THREE.Color("#ffaa22"),
    dir: -1,
    speed: 0.06,
    pulses: 2,
  },
  {
    id: "rubrospinal",
    xOff: -0.0008,
    color: new THREE.Color("#ff8833"),
    dir: -1,
    speed: 0.07,
    pulses: 2,
  },
  {
    id: "vestibulo",
    xOff: 0.0008,
    color: new THREE.Color("#ffe044"),
    dir: -1,
    speed: 0.05,
    pulses: 2,
  },
  {
    id: "reticulo",
    xOff: 0.0,
    color: new THREE.Color("#aaddff"),
    dir: -1,
    speed: 0.04,
    pulses: 2,
  },
];

// Trail: head + N fading steps behind it
const TRAIL = [
  { tOff: 0.0, size: 0.003, opacity: 1.0 },
  { tOff: 0.008, size: 0.003, opacity: 0.8 },
  { tOff: 0.016, size: 0.003, opacity: 0.62 },
  { tOff: 0.024, size: 0.0028, opacity: 0.46 },
  { tOff: 0.032, size: 0.0023, opacity: 0.32 },
  { tOff: 0.032, size: 0.0023, opacity: 0.32 },
  { tOff: 0.032, size: 0.0023, opacity: 0.32 },
  { tOff: 0.04, size: 0.0021, opacity: 0.2 },
  { tOff: 0.04, size: 0.0021, opacity: 0.2 },
  { tOff: 0.04, size: 0.0021, opacity: 0.2 },
  { tOff: 0.05, size: 0.00017, opacity: 0.12 },
  { tOff: 0.062, size: 0.0005, opacity: 0.06 },
  { tOff: 0.062, size: 0.0005, opacity: 0.06 },
  { tOff: 0.062, size: 0.0005, opacity: 0.06 },
  { tOff: 0.076, size: 0.0003, opacity: 0.06 },
  { tOff: 0.076, size: 0.0003, opacity: 0.06 },
  { tOff: 0.076, size: 0.0003, opacity: 0.06 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
  { tOff: 0.076, size: 0.0003, opacity: 0.02 },
];

export default function SpinalFibers({ spinePoints, viewMode }) {
  const meshRefs = useRef({});
  const pulseT = useRef({});

  const { curves, linePoints } = useMemo(() => {
    if (!spinePoints || spinePoints.length < 2)
      return { curves: null, linePoints: null };
    // Use the same smoothed data that DiscMarkers uses so fiber paths
    // pass through disc centers instead of deviating from them.
    const smoothed = smoothPoints(spinePoints);
    const curves = {};
    const linePoints = {};
    for (const tract of TRACTS) {
      const pts = smoothed.map((p) => {
        return new THREE.Vector3(p[0] + tract.xOff, p[1], p[2]);
      });
      curves[tract.id] = new THREE.CatmullRomCurve3(
        pts,
        false,
        "centripetal",
        0.5,
      );
      linePoints[tract.id] = curves[tract.id].getPoints(CURVE_SAMPLES);
    }
    return { curves, linePoints };
  }, [spinePoints]);

  useFrame((_, delta) => {
    if (!curves) return;
    const mult =
      viewMode === "breathing" ? 0.15 : viewMode === "unified" ? 0.5 : 1.0;

    for (const tract of TRACTS) {
      const curve = curves[tract.id];
      if (!curve) continue;

      if (pulseT.current[tract.id] === undefined)
        pulseT.current[tract.id] = Math.random();
      pulseT.current[tract.id] =
        (((pulseT.current[tract.id] + tract.dir * tract.speed * delta) % 1) +
          1) %
        1;
      const t0 = pulseT.current[tract.id];

      for (let pi = 0; pi < tract.pulses; pi++) {
        const tHead = (((t0 + pi / tract.pulses) % 1) + 1) % 1;
        for (let ti = 0; ti < TRAIL.length; ti++) {
          const step = TRAIL[ti];
          const t = Math.max(0, Math.min(1, tHead - tract.dir * step.tOff));
          const ref = meshRefs.current[`${tract.id}_${pi}_${ti}`];
          if (ref) {
            ref.position.copy(curve.getPoint(t));
            ref.material.opacity = step.opacity * mult;
          }
        }
      }
    }
  });

  if (!spinePoints || !curves) return null;

  const mult =
    viewMode === "breathing" ? 0.15 : viewMode === "unified" ? 0.5 : 1.0;

  return (
    <group>
      {/* Background tract lines — thick and visible */}
      {linePoints &&
        TRACTS.map((tract) => (
          <group key={tract.id}>
            <Line
              points={linePoints[tract.id]}
              color={tract.color}
              lineWidth={4}
              opacity={0.12 * mult}
              transparent
            />
            <Line
              points={linePoints[tract.id]}
              color={tract.color}
              lineWidth={1.5}
              opacity={0.45 * mult}
              transparent
            />
          </group>
        ))}

      {/* Animated comet trails */}
      {TRACTS.map((tract) =>
        Array.from({ length: tract.pulses }, (_, pi) =>
          TRAIL.map((step, ti) => (
            <mesh
              key={`${tract.id}_${pi}_${ti}`}
              ref={(el) => {
                if (el) meshRefs.current[`${tract.id}_${pi}_${ti}`] = el;
              }}
              renderOrder={7}
            >
              <sphereGeometry args={[step.size, 7, 7]} />
              <meshBasicMaterial
                color={tract.color}
                transparent
                opacity={step.opacity * mult}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )),
        ),
      )}
    </group>
  );
}
