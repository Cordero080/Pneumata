import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,0.85)");
  g.addColorStop(0.4, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Safe inner volume only: y 1.628–1.728, x ±0.038, z –0.044 to +0.028
// No paths end near pituitary — all endpoints stay in mid-brain
const PATHS = [
  // Corpus callosum — left to right
  [
    [-0.036, 1.682, 0.004],
    [-0.018, 1.687, 0.009],
    [0.0, 1.688, 0.011],
    [0.018, 1.687, 0.009],
    [0.036, 1.682, 0.004],
  ],
  // Left hemisphere loop
  [
    [-0.03, 1.724, 0.002],
    [-0.038, 1.702, 0.005],
    [-0.036, 1.674, 0.006],
    [-0.028, 1.648, 0.003],
    [-0.016, 1.63, 0.0],
  ],
  // Right hemisphere loop
  [
    [0.03, 1.724, 0.002],
    [0.038, 1.702, 0.005],
    [0.036, 1.674, 0.006],
    [0.028, 1.648, 0.003],
    [0.016, 1.63, 0.0],
  ],
  // Frontal arc — shallow z
  [
    [-0.018, 1.71, 0.022],
    [-0.008, 1.706, 0.027],
    [0.0, 1.704, 0.028],
    [0.008, 1.706, 0.027],
    [0.018, 1.71, 0.022],
  ],
  // Posterior arc — shallow negative z
  [
    [-0.01, 1.72, -0.032],
    [-0.004, 1.704, -0.04],
    [0.0, 1.684, -0.044],
    [0.004, 1.664, -0.04],
    [0.008, 1.644, -0.032],
  ],
  // Central vertical
  [
    [0.004, 1.726, 0.003],
    [0.002, 1.7, -0.004],
    [0.0, 1.67, -0.014],
    [-0.002, 1.642, -0.008],
    [0.0, 1.628, 0.001],
  ],
  // Left diagonal
  [
    [-0.024, 1.714, 0.018],
    [-0.014, 1.696, 0.005],
    [-0.003, 1.676, -0.009],
    [0.006, 1.654, -0.025],
    [0.014, 1.634, -0.036],
  ],
  // Right diagonal
  [
    [0.024, 1.714, 0.018],
    [0.014, 1.696, 0.005],
    [0.003, 1.676, -0.009],
    [-0.006, 1.654, -0.025],
    [-0.014, 1.634, -0.036],
  ],
];

const SPARKS = [
  { pathIndex: 0, speed: 0.3, phase: 0.0, color: new THREE.Color("#00ffff") },
  { pathIndex: 0, speed: 0.3, phase: 0.55, color: new THREE.Color("#ff00ff") },
  { pathIndex: 1, speed: 0.26, phase: 0.1, color: new THREE.Color("#00ffff") },
  { pathIndex: 1, speed: 0.26, phase: 0.6, color: new THREE.Color("#ff003c") },
  { pathIndex: 2, speed: 0.26, phase: 0.3, color: new THREE.Color("#00ffff") },
  { pathIndex: 2, speed: 0.26, phase: 0.8, color: new THREE.Color("#00ff88") },
  { pathIndex: 3, speed: 0.38, phase: 0.2, color: new THREE.Color("#00ffff") },
  { pathIndex: 3, speed: 0.38, phase: 0.7, color: new THREE.Color("#ff00ff") },
  { pathIndex: 4, speed: 0.42, phase: 0.0, color: new THREE.Color("#00b3ff") },
  { pathIndex: 4, speed: 0.42, phase: 0.5, color: new THREE.Color("#ffee00") },
  { pathIndex: 5, speed: 0.22, phase: 0.15, color: new THREE.Color("#c300ff") },
  { pathIndex: 6, speed: 0.28, phase: 0.35, color: new THREE.Color("#00ffff") },
  { pathIndex: 6, speed: 0.28, phase: 0.75, color: new THREE.Color("#ffee00") },
  { pathIndex: 7, speed: 0.34, phase: 0.45, color: new THREE.Color("#00ff88") },
];

// Tips at mesh extremities — displaced by ~mesh-radius from each center
const TIPS = [
  {
    pos: [0.033, 1.713, 0.035],
    color: new THREE.Color("#00ffff"),
    freq: 1.2,
    phase: 0.0,
  },
  {
    pos: [0.008, 1.713, 0.022],
    color: new THREE.Color("#00ffff"),
    freq: 1.5,
    phase: 0.8,
  },
  {
    pos: [0.024, 1.687, 0.041],
    color: new THREE.Color("#00ffff"),
    freq: 1.0,
    phase: 1.6,
  },
  {
    pos: [-0.02, 1.659, -0.02],
    color: new THREE.Color("#00ff88"),
    freq: 1.3,
    phase: 0.4,
  },
  {
    pos: [-0.02, 1.631, -0.02],
    color: new THREE.Color("#00ff88"),
    freq: 1.1,
    phase: 1.2,
  },
  {
    pos: [-0.033, 1.645, -0.012],
    color: new THREE.Color("#00ff88"),
    freq: 0.9,
    phase: 2.0,
  },
  {
    pos: [0.01, 1.611, 0.005],
    color: new THREE.Color("#ffee00"),
    freq: 1.4,
    phase: 0.2,
  },
  {
    pos: [-0.01, 1.611, 0.012],
    color: new THREE.Color("#ffee00"),
    freq: 1.2,
    phase: 1.0,
  },
  {
    pos: [0.0, 1.589, 0.005],
    color: new THREE.Color("#ffee00"),
    freq: 1.6,
    phase: 1.8,
  },
];

const FEMALE_Y_OFFSET = 1.615 - 1.672;

function NeuralActivity({ brainZoom, cellZoom, femaleMode }) {
  const tubeRefs = useRef([]);
  const sparkRefs = useRef(
    SPARKS.map((s) => ({ group: null, mat: null, glowMat: null, t: s.phase })),
  );
  const tipRefs = useRef(TIPS.map(() => ({ mat: null, glowMat: null })));
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const curves = useMemo(
    () =>
      PATHS.map(
        (pts) =>
          new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))),
      ),
    [],
  );

  const tubes = useMemo(
    () =>
      curves.map(
        (curve) => new THREE.TubeGeometry(curve, 80, 0.0004, 4, false),
      ),
    [curves],
  );

  useFrame((state, delta) => {
    const active = brainZoom || cellZoom;
    const t = state.clock.getElapsedTime();

    const tubeTarget = active ? 0.09 : 0;
    tubeRefs.current.forEach((m) => {
      if (m) m.opacity += (tubeTarget - m.opacity) * 0.05;
    });

    SPARKS.forEach((spark, i) => {
      const d = sparkRefs.current[i];
      if (!d.group) return;
      d.t = (d.t + delta * spark.speed) % 1;
      const pt = curves[spark.pathIndex].getPoint(d.t);
      d.group.position.copy(pt);
      const target = active ? 1.0 : 0;
      if (d.mat) d.mat.opacity += (target - d.mat.opacity) * 0.07;
      if (d.glowMat)
        d.glowMat.opacity += (target * 0.4 - d.glowMat.opacity) * 0.07;
    });

    TIPS.forEach((tip, i) => {
      const ref = tipRefs.current[i];
      if (!ref.mat) return;
      const pulse = (Math.sin(t * tip.freq * Math.PI * 2 + tip.phase) + 1) / 2;
      ref.mat.opacity +=
        ((active ? 0.4 + pulse * 0.6 : 0) - ref.mat.opacity) * 0.08;
      ref.glowMat.opacity +=
        ((active ? pulse * 0.3 : 0) - ref.glowMat.opacity) * 0.08;
    });
  });

  return (
    <group position={[0, femaleMode ? FEMALE_Y_OFFSET : 0, 0]}>
      {tubes.map((geo, i) => (
        <mesh key={`tube-${i}`} geometry={geo} renderOrder={4}>
          <meshBasicMaterial
            ref={(m) => {
              if (m) tubeRefs.current[i] = m;
            }}
            color="#003344"
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {SPARKS.map((spark, i) => (
        <group
          key={`spark-${i}`}
          ref={(g) => {
            if (g) sparkRefs.current[i].group = g;
          }}
        >
          <sprite renderOrder={8} scale={[0.014, 0.014, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) sparkRefs.current[i].glowMat = m;
              }}
              map={glowTex}
              color={spark.color}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          <sprite renderOrder={9} scale={[0.004, 0.004, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) sparkRefs.current[i].mat = m;
              }}
              map={glowTex}
              color={spark.color}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}

      {TIPS.map((tip, i) => (
        <group key={`tip-${i}`} position={tip.pos}>
          <sprite renderOrder={7} scale={[0.016, 0.016, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) tipRefs.current[i].glowMat = m;
              }}
              map={glowTex}
              color={tip.color}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          <sprite renderOrder={8} scale={[0.005, 0.005, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) tipRefs.current[i].mat = m;
              }}
              map={glowTex}
              color={tip.color}
              transparent
              opacity={0}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

export default NeuralActivity;
