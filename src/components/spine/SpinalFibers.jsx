import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { smoothPoints, MALE_SPINE_POINTS } from "./spineData";

const CURVE_SAMPLES = 80;

// Soft radial-gradient texture — the same trick the brain synapses use to look
// like glowing points instead of hard spheres. Built once, shared by every
// pulse sprite.
function makeGlowTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  // Very soft falloff — a faint halo with almost no hard core, so overlapping
  // sprites blend into a wispy glow instead of stacking into a solid pill.
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.12, "rgba(255,255,255,0.35)");
  g.addColorStop(0.5, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

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

// A pulse is now a small CLUSTER of 3 sparks (not a long comet trail — that
// read as a solid uniform line from a distance). The three sit close together
// with a little spacing, and each twinkles on its own phase (see useFrame), so
// the cluster reads as a dynamic burst of sparks firing along the cord with
// gaps between pulses — not a continuous streak.
const TRAIL = [
  { tOff: 0.0, size: 0.0024, opacity: 1.0 },
  { tOff: 0.014, size: 0.0019, opacity: 0.7 },
  { tOff: 0.03, size: 0.0015, opacity: 0.45 },
];

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

export default function SpinalFibers({ spinePoints, viewMode }) {
  const meshRefs = useRef({});
  const pulseT = useRef({});
  const glowTex = useMemo(() => makeGlowTexture(), []);

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

  useFrame((state, delta) => {
    if (!luts) return;
    const d = Math.min(delta, 0.05);
    const time = state.clock.getElapsedTime();
    const mult =
      viewMode === "breathing" ? 0.15 : viewMode === "unified" ? 0.5 : 1.0;

    let tractIdx = 0;
    for (const tract of TRACTS) {
      const lut = luts[tract.id];
      if (!lut) continue;

      if (pulseT.current[tract.id] === undefined)
        pulseT.current[tract.id] = Math.random();
      pulseT.current[tract.id] =
        (((pulseT.current[tract.id] + tract.dir * tract.speed * d) % 1) + 1) %
        1;
      const t0 = pulseT.current[tract.id];

      for (let pi = 0; pi < tract.pulses; pi++) {
        const tHead = (((t0 + pi / tract.pulses) % 1) + 1) % 1;
        // Firefly glow — each individual pulse breathes on its own phase, and
        // groups (tracts) are offset from each other, so the cord twinkles as
        // nested sequences rather than a uniform stream. 0.45..1.0 range keeps
        // it soft, never fully dark. FIREFLY_RATE tunes the twinkle speed.
        const groupPhase = tractIdx * 1.7 + pi * 2.3;
        for (let ti = 0; ti < TRAIL.length; ti++) {
          const step = TRAIL[ti];
          const t = Math.max(0, Math.min(1, tHead - tract.dir * step.tOff));
          const ref = meshRefs.current[`${tract.id}_${pi}_${ti}`];
          if (ref) {
            ref.position.copy(sampleLUT(lut, t));
            // Each spark in the 3-cluster twinkles on its OWN phase (ti offset),
            // dipping to ~0.15, so the group flickers dynamically rather than
            // glowing as one uniform blob.
            const firefly =
              0.15 +
              0.85 * (0.5 + 0.5 * Math.sin(time * 2.4 + groupPhase + ti * 2.1));
            ref.material.opacity = step.opacity * mult * firefly;
          }
        }
      }
      tractIdx++;
    }
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

      {TRACTS.map((tract) =>
        Array.from({ length: tract.pulses }, (_, pi) =>
          TRAIL.map((step, ti) => (
            // Soft glow sprite (radial-gradient texture) instead of a hard
            // sphere — this is what makes it read as a glowing synapse/firefly
            // point. White-hot head (first 3 steps), category-colored tail,
            // additive blend. Scale ~5× the old radius so the fuzzy glow is
            // visible but still a bit smaller than the brain synapses.
            <sprite
              key={`${tract.id}_${pi}_${ti}`}
              ref={(el) => {
                if (el) meshRefs.current[`${tract.id}_${pi}_${ti}`] = el;
              }}
              renderOrder={7}
              scale={[step.size * 2.4, step.size * 2.4, 1]}
            >
              <spriteMaterial
                map={glowTex}
                color={ti < 3 ? "#ffffff" : tract.color}
                transparent
                opacity={step.opacity * mult}
                depthWrite={false}
                depthTest={false}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          )),
        ),
      )}
    </group>
  );
}
