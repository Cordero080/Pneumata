import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const CURVE_SAMPLES = 80;

const FIBERS = [
  {
    id: "sensory",
    xOff: -0.004,
    zOff: 0.0,
    color: "#00d4ff",
    dir: 1,
    speed: 0.28,
    pulses: 4,
    opacity: 0.9,
    width: 2.0,
  },
  {
    id: "core",
    xOff: 0.0,
    zOff: 0.0,
    color: "#d0e8ff",
    dir: 0,
    speed: 0,
    pulses: 0,
    opacity: 0.5,
    width: 1.4,
  },
  {
    id: "motor",
    xOff: 0.004,
    zOff: 0.0,
    color: "#ff5533",
    dir: -1,
    speed: 0.22,
    pulses: 4,
    opacity: 0.9,
    width: 2.0,
  },
];

// Trail segments per comet: [tOffset behind head, scale, opacity multiplier]
const TRAIL = [
  [0.0, 1.0, 1.0],
  [0.012, 0.7, 0.55],
  [0.022, 0.45, 0.28],
  [0.03, 0.25, 0.12],
];

export default function SpinalFibers({ spinePoints, viewMode }) {
  const trailRefs = useRef({});
  const pulseT = useRef({});

  const { curves, linePoints } = useMemo(() => {
    if (!spinePoints || spinePoints.length < 2)
      return { curves: {}, linePoints: {} };
    const curves = {};
    const linePoints = {};
    for (const fiber of FIBERS) {
      const pts = spinePoints.map(
        (p) => new THREE.Vector3(p[0] + fiber.xOff, p[1], p[2] + fiber.zOff),
      );
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
      curves[fiber.id] = curve;
      linePoints[fiber.id] = curve.getPoints(CURVE_SAMPLES);
    }
    return { curves, linePoints };
  }, [spinePoints]);

  useFrame((_, delta) => {
    for (const fiber of FIBERS) {
      if (!fiber.pulses || fiber.dir === 0) continue;
      const curve = curves[fiber.id];
      if (!curve) continue;

      if (pulseT.current[fiber.id] === undefined) {
        pulseT.current[fiber.id] = Math.random();
      }
      pulseT.current[fiber.id] =
        (((pulseT.current[fiber.id] + fiber.dir * fiber.speed * delta) % 1) +
          1) %
        1;
      const t0 = pulseT.current[fiber.id];

      for (let pi = 0; pi < fiber.pulses; pi++) {
        const tHead = (((t0 + pi / fiber.pulses) % 1) + 1) % 1;
        for (let ti = 0; ti < TRAIL.length; ti++) {
          const [tOff] = TRAIL[ti];
          // trail flows opposite to direction of travel
          const tTrail = (((tHead - fiber.dir * tOff) % 1) + 1) % 1;
          const ref = trailRefs.current[`${fiber.id}_${pi}_${ti}`];
          if (ref) ref.position.copy(curve.getPoint(tTrail));
        }
      }
    }
  });

  if (!spinePoints) return null;

  const modeOpacityMult =
    viewMode === "breathing" ? 0.25 : viewMode === "unified" ? 0.6 : 1.0;

  return (
    <>
      {FIBERS.map((fiber) => {
        const pts = linePoints[fiber.id];
        if (!pts) return null;
        const baseOpacity = fiber.opacity * modeOpacityMult;

        return (
          <group key={fiber.id}>
            <Line
              points={pts}
              color={fiber.color}
              lineWidth={fiber.width}
              opacity={baseOpacity}
              transparent
            />
            {Array.from({ length: fiber.pulses }, (_, pi) =>
              TRAIL.map(([, scale, opMult], ti) => (
                <mesh
                  key={`${pi}_${ti}`}
                  ref={(el) => {
                    if (el) trailRefs.current[`${fiber.id}_${pi}_${ti}`] = el;
                  }}
                  renderOrder={3}
                >
                  <sphereGeometry args={[0.004 * scale, 6, 6]} />
                  <meshBasicMaterial
                    color={fiber.color}
                    transparent
                    opacity={baseOpacity * opMult * 1.3}
                    toneMapped={false}
                  />
                </mesh>
              )),
            )}
          </group>
        );
      })}
    </>
  );
}
