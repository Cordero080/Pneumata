import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { meridians } from "../../data/meridians";
import { femaleMeridians } from "../../data/femaleMeridians";
import { setActiveMeridian } from "../../data/activeMeridian";
import { ORGAN_TCM } from "../../data/tcmMapping";

const MERIDIANS_WITH_ORGANS = new Set(
  Object.values(ORGAN_TCM)
    .map((v) => v.meridianId)
    .filter(Boolean),
);

// Aperture texture — a glowing ring with a soft, dimmer center (not a solid
// ball), so a meridian point reads as a "well" where qi surfaces. Built once,
// shared by every point sprite.
let _apertureTex = null;
function apertureTexture() {
  if (_apertureTex) return _apertureTex;
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
  // Medium ring — hollow center, moderate rim (a touch thinner than the
  // original, not razor-thin).
  g.addColorStop(0, "rgba(255,255,255,0.18)"); // dim hollow center
  g.addColorStop(0.5, "rgba(255,255,255,0.3)");
  g.addColorStop(0.66, "rgba(255,255,255,1)"); // bright rim
  g.addColorStop(0.8, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)"); // fade out
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  _apertureTex = new THREE.CanvasTexture(c);
  return _apertureTex;
}

// Bright-center "star" texture — a tight glowing dot (opposite of the hollow
// aperture). Sits at the exact center of each point as a precision placement
// anchor, in the meridian's color.
let _coreTex = null;
function coreTexture() {
  if (_coreTex) return _coreTex;
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
  g.addColorStop(0, "rgba(255,255,255,1)"); // hot center
  g.addColorStop(0.25, "rgba(255,255,255,0.75)");
  g.addColorStop(0.6, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  _coreTex = new THREE.CanvasTexture(c);
  return _coreTex;
}

// Sequential well-up tuning
const WAVE_SPEED = 0.18; // how fast the activation wave travels a meridian
const WAVE_WIDTH = 0.14; // fraction of the channel lit at once (wider = softer)

function MeridianPoint({
  point,
  color,
  scale,
  meridian,
  index = 0,
  count = 1,
  flowPhase = 0,
  showQi = false,
  onShowConnection,
}) {
  const spriteRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [connectionActive, setConnectionActive] = useState(false);
  const haloRef = useRef();
  const glowRef = useRef(0); // lingering afterglow value (decays slowly)

  // Base sprite size (source points larger); the aperture ring is wider than
  // the old solid ball so it reads as a well, not a dot.
  const baseSize = (point.isSource ? 0.03 : 0.02) * scale;
  const pointPos = count > 1 ? index / (count - 1) : 0;

  useFrame((state) => {
    const s = spriteRef.current;
    if (!s) return;
    const time = state.clock.getElapsedTime();

    // Sequential well-up: a wave travels the channel in flow order (index 0 →
    // last). A point flares as the wave reaches it, then fades — only while qi
    // is on. Source points keep a steadier baseline glow.
    let wavePeak = 0;
    if (showQi) {
      let wave = (((time * WAVE_SPEED + flowPhase) % 1) + 1) % 1;
      let dist = Math.abs(wave - pointPos);
      dist = Math.min(dist, 1 - dist); // wrap-around
      wavePeak = Math.max(0, 1 - dist / WAVE_WIDTH);
      wavePeak *= wavePeak; // sharpen the arrival
    }
    // Afterglow: the point jumps to the wave peak, then decays slowly — so the
    // contact LINGERS and fades gently instead of snapping off with the wave.
    glowRef.current = Math.max(glowRef.current * 0.965, wavePeak);
    const activation = glowRef.current;

    // Richer resting saturation (idle raised) so channels read colorful even
    // when calm; activation flares them brighter on top.
    const idle = point.isSource ? 0.6 : 0.4;
    const targetOpacity = hovered
      ? 1
      : Math.min(1, idle + activation * (1 - idle));
    s.material.opacity += (targetOpacity - s.material.opacity) * 0.2;

    // Ripple: the aperture swells as the wave passes (and on hover).
    const swell = 1 + activation * 0.7 + (hovered ? 0.6 : 0);
    const target = baseSize * swell;
    const cur = s.scale.x;
    s.scale.setScalar(cur + (target - cur) * 0.2);

    // Source-point "absorbing" halo — a wider faint ring that CONTRACTS inward
    // toward the point as the wave hits, like it's drawing energy in. Source
    // points only (cheap + meaningful: yuan = where a channel sources its qi).
    if (haloRef.current) {
      const h = haloRef.current;
      const hScale = baseSize * (2.4 - activation * 1.2); // 2.4× → 1.2× as it absorbs
      const hc = h.scale.x;
      h.scale.setScalar(hc + (hScale - hc) * 0.15);
      const hOpacity = 0.12 + activation * 0.5;
      h.material.opacity += (hOpacity - h.material.opacity) * 0.15;
    }
  });

  return (
    <group position={point.position}>
      {/* Invisible hit target — a bit larger than the sprite for easy tap/hover */}
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setLabelOpen((v) => !v);
        }}
      >
        <sphereGeometry args={[baseSize * 1.6, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Source-point absorbing halo — wider faint ring that contracts inward
          as the wave hits. Rendered on source points only (cost + meaning). */}
      {point.isSource && (
        <sprite
          ref={haloRef}
          renderOrder={5}
          scale={[baseSize * 2.4, baseSize * 2.4, 1]}
        >
          <spriteMaterial
            map={apertureTexture()}
            color={color}
            transparent
            opacity={0.12}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}

      {/* Visible aperture — a glowing ring/well, not a solid ball */}
      <sprite ref={spriteRef} renderOrder={6} scale={[baseSize, baseSize, 1]}>
        <spriteMaterial
          map={apertureTexture()}
          color={color}
          transparent
          opacity={0.28}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Precision center-star — a tight bright dot in the meridian color at the
          exact node center, to place points against. Small + steady. */}
      <sprite renderOrder={7} scale={[baseSize * 0.32, baseSize * 0.32, 1]}>
        <spriteMaterial
          map={coreTexture()}
          color={color}
          transparent
          opacity={0.95}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {labelOpen && (
        <Html
          center
          portal={{ current: document.body }}
          zIndexRange={[9999, 9999]}
          style={{
            pointerEvents: "none",
            userSelect: "none",
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "relative",
              background: "rgba(220, 232, 248, 0.30)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.22), 0 0 20px ${color}20, inset 0 1.5px 0 rgba(255,255,255,0.70), inset 0 -1px 0 rgba(180,200,230,0.15)`,
              border: "1px solid rgba(255, 255, 255, 0.45)",
              borderRadius: "6px",
              padding: "22px 10px 6px 10px",
              maxWidth: "160px",
              whiteSpace: "normal",
              pointerEvents: "all",
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setLabelOpen(false);
                setConnectionActive(false);
                setActiveMeridian(null);
              }}
              style={{
                position: "absolute",
                top: "5px",
                right: "7px",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "rgba(8, 20, 48, 0.45)",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1,
                borderRadius: "3px",
              }}
            >
              ×
            </div>
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: "clamp(9px, 2.5vw, 12px)",
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: "rgba(8, 20, 48, 0.95)",
                textShadow: "0 1px 0 rgba(255, 255, 255, 0.75)",
                lineHeight: 1.2,
                textTransform: "uppercase",
              }}
            >
              {point.id} · {point.name}
            </div>
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: "clamp(7px, 2vw, 10px)",
                fontWeight: 500,
                letterSpacing: "0.10em",
                color: "rgba(241, 244, 248, 0.89)",
                lineHeight: 1.4,
                marginTop: "3px",
              }}
            >
              {point.function}
            </div>

            {/* See organ connection button — only for meridians with a linked organ node */}
            {MERIDIANS_WITH_ORGANS.has(meridian.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const next = !connectionActive;
                  setConnectionActive(next);
                  setActiveMeridian(next ? meridian.id : null);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.25)",
                  paddingTop: "6px",
                  paddingBottom: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  background: "none",
                  border: "none",
                  fontFamily: "'Orbitron', system-ui, sans-serif",
                  fontSize: "clamp(7px, 2vw, 10px)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "rgba(8, 20, 48, 0.80)",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textAlign: "left",
                  pointerEvents: "all",
                }}
              >
                {connectionActive
                  ? "Hide Connection ×"
                  : "See Organ Connection →"}
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Cache the last-seen wrist landmarks. On a body-model toggle, bodyLandmarks
// is briefly null/stale (and the female mesh never samples a wrist at all), so
// without this the hand nodes drop to their raw fingertip position — which sits
// at thigh level — until a full refresh re-samples. Falling back to the cached
// wrist keeps them in place across toggles.
let cachedWristRight = null;
let cachedWristLeft = null;

function resolvePos(point, bodyLandmarks, xSign) {
  if (point.useHandLandmark) {
    if (bodyLandmarks?.wrist_right)
      cachedWristRight = bodyLandmarks.wrist_right;
    if (bodyLandmarks?.wrist_left) cachedWristLeft = bodyLandmarks.wrist_left;
    const lm =
      xSign > 0
        ? (bodyLandmarks?.wrist_right ?? cachedWristRight)
        : (bodyLandmarks?.wrist_left ?? cachedWristLeft);
    if (lm) {
      const [wx, wy, wz] = lm;
      const [dx = 0, dy = 0, dz = 0] = point.handOffset ?? [];
      return [wx + dx * xSign, wy + dy, wz + dz];
    }
  }
  if (xSign < 0)
    return [-point.position[0], point.position[1], point.position[2]];
  return point.position;
}
export default function MeridianLayer({
  scale = 1,
  onShowConnection,
  bodyLandmarks,
  femaleMode = false,
  showQi = false,
}) {
  const source = femaleMode ? femaleMeridians : meridians;
  return (
    <group>
      {source.map((meridian, mi) =>
        meridian.points.map((point, pointIdx) => {
          const pts = meridian.bilateral
            ? [
                { ...point, position: resolvePos(point, bodyLandmarks, 1) },
                { ...point, position: resolvePos(point, bodyLandmarks, -1) },
              ]
            : [{ ...point, position: resolvePos(point, bodyLandmarks, 1) }];

          return pts.map((p, i) => (
            <MeridianPoint
              key={`${point.id}-${i}`}
              point={p}
              color={meridian.color}
              scale={scale}
              meridian={meridian}
              index={pointIdx}
              count={meridian.points.length}
              // Offset each meridian's wave so they don't all pulse in unison.
              flowPhase={mi * 0.37}
              showQi={showQi}
              onShowConnection={onShowConnection}
            />
          ));
        }),
      )}
    </group>
  );
}
