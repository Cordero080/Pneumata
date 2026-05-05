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

// Confirmed world bounds (male): x ±0.0706, y 1.558–1.723, z -0.1048–+0.0769
// Safe inner volume: y 1.568–1.718, x ±0.062, z -0.092–+0.062
// Extend in z (not y) to reach frontal (+z) and occipital (-z) lobes
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
  // Thalamo-prefrontal relay
  [
    [0.0, 1.668, -0.008],
    [-0.01, 1.676, 0.002],
    [-0.018, 1.688, 0.014],
    [-0.028, 1.698, 0.018],
    [-0.034, 1.71, 0.02],
  ],
  // Left temporal arc
  [
    [-0.034, 1.722, 0.0],
    [-0.038, 1.708, -0.01],
    [-0.036, 1.69, -0.022],
    [-0.03, 1.672, -0.03],
    [-0.022, 1.652, -0.038],
  ],
  // Right temporal arc
  [
    [0.034, 1.722, 0.0],
    [0.038, 1.708, -0.01],
    [0.036, 1.69, -0.022],
    [0.03, 1.672, -0.03],
    [0.022, 1.652, -0.038],
  ],
  // Deep cross commissure
  [
    [-0.022, 1.636, -0.038],
    [-0.01, 1.648, -0.03],
    [0.0, 1.656, -0.024],
    [0.012, 1.648, -0.018],
    [0.024, 1.636, -0.012],
  ],
  // Frontal lobe sweep — mid y, deep positive z (into forehead)
  [
    [-0.044, 1.692, 0.04],
    [-0.022, 1.706, 0.054],
    [0.0, 1.71, 0.062],
    [0.022, 1.706, 0.054],
    [0.044, 1.692, 0.04],
  ],
  // Upper parietal — crown area, y capped at real mesh top
  [
    [-0.036, 1.714, -0.008],
    [-0.016, 1.718, 0.004],
    [0.0, 1.718, 0.01],
    [0.018, 1.716, 0.004],
    [0.036, 1.712, -0.008],
  ],
  // Left lateral sweep — outer hemisphere, mid to upper
  [
    [-0.064, 1.668, 0.008],
    [-0.06, 1.686, -0.01],
    [-0.054, 1.7, -0.022],
    [-0.044, 1.712, -0.028],
    [-0.03, 1.72, -0.032],
  ],
  // Right lateral sweep
  [
    [0.064, 1.668, 0.008],
    [0.06, 1.686, -0.01],
    [0.054, 1.7, -0.022],
    [0.044, 1.712, -0.028],
    [0.03, 1.72, -0.032],
  ],
  // Occipital arc — mid y, deep negative z (back of brain)
  [
    [-0.034, 1.688, -0.056],
    [-0.016, 1.698, -0.072],
    [0.0, 1.702, -0.082],
    [0.018, 1.696, -0.072],
    [0.032, 1.684, -0.056],
  ],
  // Left frontal relay — outer upper-left down to center
  [
    [-0.054, 1.714, 0.018],
    [-0.038, 1.716, 0.032],
    [-0.018, 1.712, 0.05],
    [0.002, 1.704, 0.058],
    [0.016, 1.692, 0.046],
  ],
  // Right frontal relay
  [
    [0.054, 1.714, 0.018],
    [0.038, 1.716, 0.032],
    [0.018, 1.712, 0.05],
    [-0.002, 1.704, 0.058],
    [-0.016, 1.692, 0.046],
  ],
  // Wide upper commissure — full left to right at upper level
  [
    [-0.06, 1.706, -0.004],
    [-0.03, 1.714, 0.002],
    [0.0, 1.718, 0.006],
    [0.03, 1.714, 0.002],
    [0.06, 1.706, -0.004],
  ],
  // Deep occipital descent — center, reaches far back
  [
    [0.004, 1.672, -0.052],
    [0.002, 1.658, -0.068],
    [0.0, 1.644, -0.08],
    [-0.002, 1.632, -0.088],
    [0.0, 1.622, -0.092],
  ],
  // Deep occipital sweep — left to right across back of brain
  [
    [-0.03, 1.648, -0.07],
    [-0.014, 1.638, -0.082],
    [0.0, 1.632, -0.09],
    [0.016, 1.638, -0.082],
    [0.028, 1.648, -0.07],
  ],
];

// Base spark definitions — each expands into main + 2 trailing particles
const BASE_SPARKS = [
  { pathIndex: 0, speed: 0.3,  phase: 0.0,  color: new THREE.Color("#00ffff") },
  { pathIndex: 0, speed: 0.3,  phase: 0.55, color: new THREE.Color("#ff00ff") },
  { pathIndex: 0, speed: 0.3,  phase: 0.28, color: new THREE.Color("#aaffff") },
  { pathIndex: 1, speed: 0.26, phase: 0.1,  color: new THREE.Color("#00ffff") },
  { pathIndex: 1, speed: 0.26, phase: 0.6,  color: new THREE.Color("#ff003c") },
  { pathIndex: 1, speed: 0.26, phase: 0.38, color: new THREE.Color("#00ff88") },
  { pathIndex: 2, speed: 0.26, phase: 0.3,  color: new THREE.Color("#00ffff") },
  { pathIndex: 2, speed: 0.26, phase: 0.8,  color: new THREE.Color("#00ff88") },
  { pathIndex: 2, speed: 0.26, phase: 0.55, color: new THREE.Color("#ff003c") },
  { pathIndex: 3, speed: 0.38, phase: 0.2,  color: new THREE.Color("#00ffff") },
  { pathIndex: 3, speed: 0.38, phase: 0.7,  color: new THREE.Color("#ff00ff") },
  { pathIndex: 3, speed: 0.38, phase: 0.45, color: new THREE.Color("#ffffff") },
  { pathIndex: 4, speed: 0.42, phase: 0.0,  color: new THREE.Color("#00b3ff") },
  { pathIndex: 4, speed: 0.42, phase: 0.5,  color: new THREE.Color("#ffee00") },
  { pathIndex: 4, speed: 0.42, phase: 0.25, color: new THREE.Color("#00ffcc") },
  { pathIndex: 5, speed: 0.22, phase: 0.15, color: new THREE.Color("#c300ff") },
  { pathIndex: 5, speed: 0.22, phase: 0.65, color: new THREE.Color("#ffffff") },
  { pathIndex: 5, speed: 0.22, phase: 0.4,  color: new THREE.Color("#8800ff") },
  { pathIndex: 6, speed: 0.28, phase: 0.35, color: new THREE.Color("#00ffff") },
  { pathIndex: 6, speed: 0.28, phase: 0.75, color: new THREE.Color("#ffee00") },
  { pathIndex: 6, speed: 0.28, phase: 0.55, color: new THREE.Color("#ff88ff") },
  { pathIndex: 7, speed: 0.34, phase: 0.45, color: new THREE.Color("#00ff88") },
  { pathIndex: 7, speed: 0.34, phase: 0.85, color: new THREE.Color("#ff6633") },
  { pathIndex: 7, speed: 0.34, phase: 0.65, color: new THREE.Color("#ffff44") },
  { pathIndex: 8, speed: 0.32, phase: 0.1,  color: new THREE.Color("#ffaa00") },
  { pathIndex: 8, speed: 0.32, phase: 0.6,  color: new THREE.Color("#ff44ff") },
  { pathIndex: 8, speed: 0.32, phase: 0.35, color: new THREE.Color("#00ffcc") },
  { pathIndex: 9, speed: 0.25, phase: 0.2,  color: new THREE.Color("#00ffcc") },
  { pathIndex: 9, speed: 0.25, phase: 0.7,  color: new THREE.Color("#ff0066") },
  { pathIndex: 9, speed: 0.25, phase: 0.45, color: new THREE.Color("#44ffff") },
  { pathIndex: 10, speed: 0.25, phase: 0.45, color: new THREE.Color("#00ccff") },
  { pathIndex: 10, speed: 0.25, phase: 0.9,  color: new THREE.Color("#aaff00") },
  { pathIndex: 10, speed: 0.25, phase: 0.68, color: new THREE.Color("#ff88cc") },
  { pathIndex: 11, speed: 0.35, phase: 0.05, color: new THREE.Color("#ff9900") },
  { pathIndex: 11, speed: 0.35, phase: 0.55, color: new THREE.Color("#00ffff") },
  { pathIndex: 11, speed: 0.35, phase: 0.30, color: new THREE.Color("#ffff00") },
  // Upper frontal arc (12)
  { pathIndex: 12, speed: 0.36, phase: 0.0,  color: new THREE.Color("#00ffff") },
  { pathIndex: 12, speed: 0.36, phase: 0.5,  color: new THREE.Color("#ff88ff") },
  { pathIndex: 12, speed: 0.36, phase: 0.25, color: new THREE.Color("#aaffff") },
  // Crown (13)
  { pathIndex: 13, speed: 0.28, phase: 0.2,  color: new THREE.Color("#ffffff") },
  { pathIndex: 13, speed: 0.28, phase: 0.7,  color: new THREE.Color("#aaffff") },
  { pathIndex: 13, speed: 0.28, phase: 0.45, color: new THREE.Color("#ff88ff") },
  // Left parietal (14)
  { pathIndex: 14, speed: 0.31, phase: 0.1,  color: new THREE.Color("#ff00ff") },
  { pathIndex: 14, speed: 0.31, phase: 0.6,  color: new THREE.Color("#ffee00") },
  { pathIndex: 14, speed: 0.31, phase: 0.35, color: new THREE.Color("#ff88aa") },
  // Right parietal (15)
  { pathIndex: 15, speed: 0.31, phase: 0.35, color: new THREE.Color("#00ff88") },
  { pathIndex: 15, speed: 0.31, phase: 0.82, color: new THREE.Color("#ff4400") },
  { pathIndex: 15, speed: 0.31, phase: 0.58, color: new THREE.Color("#88ffcc") },
  // Upper occipital (16)
  { pathIndex: 16, speed: 0.29, phase: 0.15, color: new THREE.Color("#00b3ff") },
  { pathIndex: 16, speed: 0.29, phase: 0.65, color: new THREE.Color("#cc00ff") },
  { pathIndex: 16, speed: 0.29, phase: 0.4,  color: new THREE.Color("#4466ff") },
  // Left frontal relay (17)
  { pathIndex: 17, speed: 0.33, phase: 0.05, color: new THREE.Color("#ffcc00") },
  { pathIndex: 17, speed: 0.33, phase: 0.55, color: new THREE.Color("#00ffcc") },
  { pathIndex: 17, speed: 0.33, phase: 0.30, color: new THREE.Color("#ffaa44") },
  // Right frontal relay (18)
  { pathIndex: 18, speed: 0.33, phase: 0.3,  color: new THREE.Color("#ff6688") },
  { pathIndex: 18, speed: 0.33, phase: 0.8,  color: new THREE.Color("#88ff44") },
  { pathIndex: 18, speed: 0.33, phase: 0.55, color: new THREE.Color("#ffccaa") },
  // Wide upper commissure (19)
  { pathIndex: 19, speed: 0.38, phase: 0.0,  color: new THREE.Color("#00ffff") },
  { pathIndex: 19, speed: 0.38, phase: 0.5,  color: new THREE.Color("#ffaa44") },
  { pathIndex: 19, speed: 0.38, phase: 0.25, color: new THREE.Color("#ffffff") },
  // Deep occipital descent (20)
  { pathIndex: 20, speed: 0.24, phase: 0.1,  color: new THREE.Color("#4488ff") },
  { pathIndex: 20, speed: 0.24, phase: 0.6,  color: new THREE.Color("#aa44ff") },
  { pathIndex: 20, speed: 0.24, phase: 0.35, color: new THREE.Color("#2255cc") },
  // Deep occipital sweep (21)
  { pathIndex: 21, speed: 0.27, phase: 0.3,  color: new THREE.Color("#00aaff") },
  { pathIndex: 21, speed: 0.27, phase: 0.75, color: new THREE.Color("#cc66ff") },
  { pathIndex: 21, speed: 0.27, phase: 0.52, color: new THREE.Color("#6644ff") },
];

// Expand each base spark into main + 2 trailing particles for action-potential trail effect
function withTrails(sparks) {
  const result = [];
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i];
    const parentIdx = result.length;
    result.push({
      ...s,
      trailOff: 0,
      maxOpacity: 1.0,
      scale: 1.0,
      parentIdx: null,
    });
    result.push({
      ...s,
      trailOff: 0.022,
      maxOpacity: 0.42,
      scale: 0.65,
      parentIdx,
    });
    result.push({
      ...s,
      trailOff: 0.042,
      maxOpacity: 0.18,
      scale: 0.38,
      parentIdx,
    });
  }
  return result;
}

const SPARKS = withTrails(BASE_SPARKS);

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
  {
    pos: [-0.034, 1.71, 0.02],
    color: new THREE.Color("#ffaa22"),
    freq: 1.1,
    phase: 0.5,
  },
  {
    pos: [-0.022, 1.652, -0.038],
    color: new THREE.Color("#00ffcc"),
    freq: 1.3,
    phase: 0.9,
  },
  {
    pos: [0.022, 1.652, -0.038],
    color: new THREE.Color("#00ccff"),
    freq: 1.0,
    phase: 1.4,
  },
  {
    pos: [-0.022, 1.636, -0.038],
    color: new THREE.Color("#ff9900"),
    freq: 1.5,
    phase: 0.3,
  },
  {
    pos: [0.024, 1.636, -0.012],
    color: new THREE.Color("#aaff00"),
    freq: 1.2,
    phase: 2.1,
  },
  // Frontal lobe peak
  {
    pos: [0.0, 1.71, 0.062],
    color: new THREE.Color("#ff88ff"),
    freq: 1.1,
    phase: 0.6,
  },
  // Crown parietal
  {
    pos: [0.0, 1.718, 0.01],
    color: new THREE.Color("#ffffff"),
    freq: 0.9,
    phase: 1.3,
  },
  // Left lateral outer
  {
    pos: [-0.064, 1.668, 0.008],
    color: new THREE.Color("#ff00ff"),
    freq: 1.3,
    phase: 0.2,
  },
  // Right lateral outer
  {
    pos: [0.064, 1.668, 0.008],
    color: new THREE.Color("#00ff88"),
    freq: 1.3,
    phase: 1.1,
  },
  // Occipital mid
  {
    pos: [0.0, 1.702, -0.082],
    color: new THREE.Color("#00b3ff"),
    freq: 1.2,
    phase: 0.7,
  },
  // Deep occipital bottom
  {
    pos: [0.0, 1.622, -0.092],
    color: new THREE.Color("#4488ff"),
    freq: 1.0,
    phase: 0.3,
  },
  // Deep occipital sweep mid
  {
    pos: [0.0, 1.632, -0.09],
    color: new THREE.Color("#cc66ff"),
    freq: 1.3,
    phase: 1.6,
  },
  // Wide upper commissure center
  {
    pos: [0.0, 1.722, 0.006],
    color: new THREE.Color("#ffaa44"),
    freq: 1.4,
    phase: 1.8,
  },
  // Left frontal lobe
  {
    pos: [-0.018, 1.718, 0.038],
    color: new THREE.Color("#ffcc00"),
    freq: 1.0,
    phase: 0.4,
  },
  // Right frontal lobe
  {
    pos: [0.018, 1.718, 0.038],
    color: new THREE.Color("#ff6688"),
    freq: 1.0,
    phase: 1.5,
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
    const t = state.clock.getElapsedTime();

    tubeRefs.current.forEach((m) => {
      if (m) m.opacity += (0.12 - m.opacity) * 0.05;
    });

    SPARKS.forEach((spark, i) => {
      const d = sparkRefs.current[i];
      if (!d.group) return;
      if (spark.parentIdx === null) {
        d.t = (d.t + delta * spark.speed) % 1;
      } else {
        d.t = sparkRefs.current[spark.parentIdx].t;
      }
      const tSelf = (((d.t - spark.trailOff) % 1) + 1) % 1;
      const pt = curves[spark.pathIndex].getPoint(tSelf);
      d.group.position.copy(pt);
      if (d.mat) d.mat.opacity += (spark.maxOpacity - d.mat.opacity) * 0.07;
      if (d.glowMat)
        d.glowMat.opacity +=
          (spark.maxOpacity * 0.4 - d.glowMat.opacity) * 0.07;
    });

    TIPS.forEach((tip, i) => {
      const ref = tipRefs.current[i];
      if (!ref.mat) return;
      const pulse = (Math.sin(t * tip.freq * Math.PI * 2 + tip.phase) + 1) / 2;
      ref.mat.opacity += (0.4 + pulse * 0.6 - ref.mat.opacity) * 0.08;
      ref.glowMat.opacity += (pulse * 0.3 - ref.glowMat.opacity) * 0.08;
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
            color="#0077aa"
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
          <sprite
            renderOrder={8}
            scale={[0.0133 * spark.scale, 0.0133 * spark.scale, 1]}
          >
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
          <sprite
            renderOrder={9}
            scale={[0.0038 * spark.scale, 0.0038 * spark.scale, 1]}
          >
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
