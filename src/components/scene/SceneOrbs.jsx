import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const THEME_HUE_SHIFTS = { nebula: 0, space: 120, sunset: 220, matrix: 180 };

const BASE_COLORS = [
  "#c708c7",
  "#0a2b41",
  "#8c0a3e9d",
  "#0080ff",
  "#ff6600",
  "#7ef605",
  "#8000ff",
  "#b3b30c",
];

const FIGURE_Y_CENTER = 0.85;
const SWELL_R_MIN = 0.001;
const SWELL_R_MAX = 1.88;
const SWELL_Y_SPREAD = 1.0;

const IS_MOBILE = window.innerWidth <= 768;
const PARTICLE_COUNT = IS_MOBILE ? 60 : 150;

function buildSpectralColors(hueShift) {
  return BASE_COLORS.map((hex) => {
    const c = new THREE.Color(hex);
    if (hueShift) c.offsetHSL(hueShift / 360, 0, 0);
    return c.getHex();
  });
}

function makeRng(seed) {
  let s = (seed * 166884525 + 1013904223) >>> 0;
  return () => {
    s = (s * 16649525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function buildParticleParams(spectralColors) {
  const rng = makeRng(77);
  const list = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const orbitR = SWELL_R_MIN + rng() * (SWELL_R_MAX - SWELL_R_MIN);
    const angle = rng() * Math.PI * 2;
    const initY = FIGURE_Y_CENTER + (rng() - 0.4) * 1 * SWELL_Y_SPREAD;

    list.push({
      key: `p${i}`,
      index: i,
      colorHex: spectralColors[i % spectralColors.length],
      angle,
      orbitR,
      initY,
      orbitSpeed: (0.009 + rng() * 0.005) * (rng() > 0.5 ? 1 : -1),
      wobbleAmp: 0.35 + rng() * 0.45,
      wobbleFreq: 0.15 + rng() * 0.55,
      wobblePhase: rng() * Math.PI * 2,
      yDriftAmp: 0.08 + rng() * 0.22,
      yDriftFreq: 0.1 + rng() * 0.3,
      yDriftPhase: rng() * Math.PI * 2,
      pulseSpeed: 0.5 + rng() * 1.5,
      pulseOffset: rng() * Math.PI * 2,
      baseOpacity: 0.6 + rng() * 0.4,
      radius: 0.004 + rng() * 0.006,
    });
  }

  return list;
}

const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3(1, 1, 1);
const _quat = new THREE.Quaternion();
const _color = new THREE.Color();

export default function SceneOrbs({ theme }) {
  const hueShift = THEME_HUE_SHIFTS[theme] ?? null;
  const spectralColors = useMemo(
    () => (hueShift !== null ? buildSpectralColors(hueShift) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );
  const particles = useMemo(
    () => (spectralColors ? buildParticleParams(spectralColors) : []),
    [spectralColors],
  );

  const coreRef = useRef();
  const glowRef = useRef();
  const anglesRef = useRef(particles.map((d) => d.angle));

  useFrame((state, delta) => {
    const core = coreRef.current;
    const glow = glowRef.current;
    if (!core || !glow) return;
    const t = state.clock.getElapsedTime();
    const angles = anglesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const d = particles[i];
      angles[i] += delta * d.orbitSpeed;
      const a = angles[i];

      const x =
        Math.cos(a) * d.orbitR +
        Math.sin(t * d.wobbleFreq + d.wobblePhase) * d.wobbleAmp;
      const z =
        Math.sin(a) * d.orbitR +
        Math.cos(t * d.wobbleFreq + d.wobblePhase + 0.9) * d.wobbleAmp;
      const y =
        d.initY + Math.sin(t * d.yDriftFreq + d.yDriftPhase) * d.yDriftAmp;
      const pulse = Math.sin(t * d.pulseSpeed + d.pulseOffset) * 0.5 + 0.5;

      _pos.set(x, y, z);
      _scale.setScalar(d.radius * 200);
      _matrix.compose(_pos, _quat, _scale);
      core.setMatrixAt(i, _matrix);

      _scale.setScalar(d.radius * 400);
      _matrix.compose(_pos, _quat, _scale);
      glow.setMatrixAt(i, _matrix);

      _color.setHex(d.colorHex);
      _color.multiplyScalar(d.baseOpacity * (0.35 + pulse * 0.65));
      core.setColorAt(i, _color);

      _color.setHex(d.colorHex);
      _color.multiplyScalar(0.1 + pulse * 0.18);
      glow.setColorAt(i, _color);
    }

    core.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
    if (core.instanceColor) core.instanceColor.needsUpdate = true;
    if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
  });

  if (!spectralColors || particles.length === 0) return null;

  return (
    <>
      <instancedMesh
        ref={coreRef}
        args={[null, null, particles.length]}
        renderOrder={1}
      >
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshBasicMaterial transparent depthWrite={false} vertexColors />
      </instancedMesh>
      <instancedMesh
        ref={glowRef}
        args={[null, null, particles.length]}
        renderOrder={0}
      >
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          vertexColors
        />
      </instancedMesh>
    </>
  );
}
