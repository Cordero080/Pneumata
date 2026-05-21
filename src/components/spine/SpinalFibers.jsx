import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { smoothPoints, MALE_SPINE_POINTS } from "./spineData";

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

const IS_MOBILE = window.innerWidth <= 768;

// Fewer trail steps on mobile
const TRAIL = IS_MOBILE
  ? [
      { tOff: 0.0, opacity: 1.0 },
      { tOff: 0.012, opacity: 0.7 },
      { tOff: 0.024, opacity: 0.45 },
      { tOff: 0.04, opacity: 0.25 },
      { tOff: 0.06, opacity: 0.1 },
      { tOff: 0.08, opacity: 0.04 },
    ]
  : [
      { tOff: 0.0, opacity: 1.0 },
      { tOff: 0.008, opacity: 0.8 },
      { tOff: 0.016, opacity: 0.62 },
      { tOff: 0.024, opacity: 0.46 },
      { tOff: 0.032, opacity: 0.32 },
      { tOff: 0.032, opacity: 0.32 },
      { tOff: 0.032, opacity: 0.32 },
      { tOff: 0.04, opacity: 0.2 },
      { tOff: 0.04, opacity: 0.2 },
      { tOff: 0.04, opacity: 0.2 },
      { tOff: 0.05, opacity: 0.12 },
      { tOff: 0.062, opacity: 0.06 },
      { tOff: 0.062, opacity: 0.06 },
      { tOff: 0.062, opacity: 0.06 },
      { tOff: 0.076, opacity: 0.06 },
      { tOff: 0.076, opacity: 0.06 },
      { tOff: 0.076, opacity: 0.06 },
      { tOff: 0.076, opacity: 0.02 },
      { tOff: 0.076, opacity: 0.02 },
      { tOff: 0.076, opacity: 0.02 },
    ];

const DOT_SIZE = 0.002;

// Pre-build flat instance list: [tractIdx, pulseIdx, trailIdx]
const INSTANCES = [];
for (let ti = 0; ti < TRACTS.length; ti++) {
  const tract = TRACTS[ti];
  for (let pi = 0; pi < tract.pulses; pi++) {
    for (let tri = 0; tri < TRAIL.length; tri++) {
      INSTANCES.push({ ti, pi, tri });
    }
  }
}
const INSTANCE_COUNT = INSTANCES.length;

// Fast lookup: given t in [0,1], interpolate between pre-sampled points
function sampleLUT(lut, t) {
  const last = lut.length - 1;
  const scaled = Math.max(0, Math.min(1, t)) * last;
  const i = Math.floor(scaled);
  const f = scaled - i;
  if (i >= last) return lut[last];
  const a = lut[i];
  const b = lut[i + 1];
  return _lutTmp.set(
    a.x + (b.x - a.x) * f,
    a.y + (b.y - a.y) * f,
    a.z + (b.z - a.z) * f,
  );
}
const _lutTmp = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3(1, 1, 1);
const _quat = new THREE.Quaternion();
const _color = new THREE.Color();

export default function SpinalFibers({ spinePoints, viewMode }) {
  const instanceRef = useRef();
  const pulseT = useRef({});

  const { luts, linePoints } = useMemo(() => {
    const smoothed = smoothPoints(MALE_SPINE_POINTS);
    const luts = {};
    const linePoints = {};
    for (const tract of TRACTS) {
      const pts = smoothed.map(
        (p) => new THREE.Vector3(p[0] + tract.xOff, p[1], p[2]),
      );
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
      luts[tract.id] = curve.getPoints(CURVE_SAMPLES);
      linePoints[tract.id] = luts[tract.id];
    }
    return { luts, linePoints };
  }, []);

  useFrame((_, delta) => {
    const mesh = instanceRef.current;
    if (!mesh || !luts) return;
    const d = Math.min(delta, 0.05);
    const mult =
      viewMode === "breathing" ? 0.15 : viewMode === "unified" ? 0.5 : 1.0;

    // Advance all pulse positions
    for (const tract of TRACTS) {
      if (pulseT.current[tract.id] === undefined)
        pulseT.current[tract.id] = Math.random();
      pulseT.current[tract.id] =
        (((pulseT.current[tract.id] + tract.dir * tract.speed * d) % 1) + 1) %
        1;
    }

    // Update all instances in one loop
    for (let idx = 0; idx < INSTANCES.length; idx++) {
      const { ti, pi, tri } = INSTANCES[idx];
      const tract = TRACTS[ti];
      const lut = luts[tract.id];
      const step = TRAIL[tri];
      const t0 = pulseT.current[tract.id];
      const tHead = (((t0 + pi / tract.pulses) % 1) + 1) % 1;
      const t = Math.max(0, Math.min(1, tHead - tract.dir * step.tOff));

      _pos.copy(sampleLUT(lut, t));
      _matrix.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(idx, _matrix);

      _color.copy(tract.color).multiplyScalar(step.opacity * mult);
      mesh.setColorAt(idx, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (!luts) return null;

  const mult =
    viewMode === "breathing" ? 0.15 : viewMode === "unified" ? 0.5 : 1.0;

  return (
    <group>
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

      <instancedMesh
        ref={instanceRef}
        args={[null, null, INSTANCE_COUNT]}
        renderOrder={7}
      >
        <sphereGeometry args={[DOT_SIZE, 5, 5]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          toneMapped={false}
          vertexColors
        />
      </instancedMesh>
    </group>
  );
}
