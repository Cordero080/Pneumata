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

// Figure vertical centre
const FIGURE_Y_CENTER = 0.85;
// Particles spread wide around the whole figure
const SWELL_R_MIN = 0.001;
const SWELL_R_MAX = 1.88;
const SWELL_Y_SPREAD = 1.0; // ± from centre

const PARTICLE_COUNT = 150;

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
      // Fast swirl — vary speed so inner/outer orbit at different rates
      orbitSpeed: (0.009 + rng() * 0.005) * (rng() > 0.5 ? 1 : -1),
      // Wide elliptic wobble layered on top of the orbit
      wobbleAmp: 0.35 + rng() * 0.45,
      wobbleFreq: 0.15 + rng() * 0.55,
      wobblePhase: rng() * Math.PI * 2,
      // Vertical drift
      yDriftAmp: 0.08 + rng() * 0.22,
      yDriftFreq: 0.1 + rng() * 0.3,
      yDriftPhase: rng() * Math.PI * 2,
      // Pulse
      pulseSpeed: 0.5 + rng() * 1.5,
      pulseOffset: rng() * Math.PI * 2,
      baseOpacity: 0.6 + rng() * 0.4,
      radius: 0.004 + rng() * 0.006,
    });
  }

  return list;
}

function Particle({ d }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const coreMatRef = useRef();
  const glowMatRef = useRef();
  const angleRef = useRef(d.angle);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    angleRef.current += delta * d.orbitSpeed;
    const a = angleRef.current;

    // Wide swirling orbit with an elliptic wobble
    const x =
      Math.cos(a) * d.orbitR +
      Math.sin(t * d.wobbleFreq + d.wobblePhase) * d.wobbleAmp;
    const z =
      Math.sin(a) * d.orbitR +
      Math.cos(t * d.wobbleFreq + d.wobblePhase + 0.9) * d.wobbleAmp;
    const y =
      d.initY + Math.sin(t * d.yDriftFreq + d.yDriftPhase) * d.yDriftAmp;

    meshRef.current.position.set(x, y, z);
    if (glowRef.current) glowRef.current.position.set(x, y, z);

    const pulse = Math.sin(t * d.pulseSpeed + d.pulseOffset) * 0.5 + 0.5;
    if (coreMatRef.current)
      coreMatRef.current.opacity = d.baseOpacity * (0.35 + pulse * 0.65);
    if (glowMatRef.current) glowMatRef.current.opacity = 0.1 + pulse * 0.18;
  });

  const glowR = d.radius * 2;

  return (
    <>
      <mesh
        ref={meshRef}
        position={[
          Math.cos(d.angle) * d.orbitR,
          d.initY,
          Math.sin(d.angle) * d.orbitR,
        ]}
      >
        <sphereGeometry args={[d.radius, 6, 6]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={d.colorHex}
          transparent
          opacity={d.baseOpacity}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={glowRef}
        position={[
          Math.cos(d.angle) * d.orbitR,
          d.initY,
          Math.sin(d.angle) * d.orbitR,
        ]}
      >
        <sphereGeometry args={[glowR, 6, 6]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color={d.colorHex}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

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

  if (!spectralColors) return null;

  return (
    <>
      {particles.map((d) => (
        <Particle key={d.key} d={d} />
      ))}
    </>
  );
}
