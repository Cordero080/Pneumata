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

// meshBasicMaterial + a per-instance ALPHA attribute (injected via
// onBeforeCompile). This lets each instance fade independently under one shared
// material — the ONLY faithful way to reproduce the original per-orb opacity
// pulse while instanced. Colors stay full (never dimmed toward black), so the
// glow is a faint COLORED halo, not a dark ring. Normal blending, like before.
function makeAlphaMaterial(extra) {
  const m = new THREE.MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    ...extra,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader =
      "attribute float instanceAlpha;\nvarying float vAlpha;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vAlpha = instanceAlpha;",
      );
    shader.fragmentShader =
      "varying float vAlpha;\n" +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\n  gl_FragColor.a *= vAlpha;",
      );
  };
  return m;
}

function buildInstanced(particles, radiusScale, extra) {
  const count = particles.length;
  const geo = new THREE.SphereGeometry(1, 6, 6);
  const alphas = new Float32Array(count);
  geo.setAttribute(
    "instanceAlpha",
    new THREE.InstancedBufferAttribute(alphas, 1),
  );
  const mesh = new THREE.InstancedMesh(geo, makeAlphaMaterial(extra), count);
  // Static full base colors (never change) + fixed per-instance size.
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  particles.forEach((d, i) => {
    dummy.scale.setScalar(d.radius * radiusScale);
    dummy.position.set(0, -999, 0); // real position set each frame
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(d.colorHex);
    mesh.setColorAt(i, color);
  });
  mesh.instanceColor.needsUpdate = true;
  return { mesh, alphas };
}

function OrbField({ particles }) {
  const count = particles.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const angles = useMemo(() => particles.map((d) => d.angle), [particles]);

  const core = useMemo(() => buildInstanced(particles, 1, {}), [particles]);
  const glow = useMemo(
    () => buildInstanced(particles, 2, { side: THREE.BackSide }),
    [particles],
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
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

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(d.radius);
      dummy.updateMatrix();
      core.mesh.setMatrixAt(i, dummy.matrix);
      core.alphas[i] = d.baseOpacity * (0.35 + pulse * 0.65);

      dummy.scale.setScalar(d.radius * 2);
      dummy.updateMatrix();
      glow.mesh.setMatrixAt(i, dummy.matrix);
      glow.alphas[i] = 0.1 + pulse * 0.18;
    }
    core.mesh.instanceMatrix.needsUpdate = true;
    glow.mesh.instanceMatrix.needsUpdate = true;
    core.mesh.geometry.attributes.instanceAlpha.needsUpdate = true;
    glow.mesh.geometry.attributes.instanceAlpha.needsUpdate = true;
  });

  return (
    <>
      <primitive object={glow.mesh} />
      <primitive object={core.mesh} />
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

  if (!spectralColors || particles.length === 0) return null;

  return <OrbField particles={particles} />;
}
