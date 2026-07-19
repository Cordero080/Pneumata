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

function MeridianPoint({ point, color, scale, meridian, onShowConnection }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [connectionActive, setConnectionActive] = useState(false);
  const targetIntensity = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = hovered ? 3.5 : 0.8;
    targetIntensity.current += (target - targetIntensity.current) * 0.12;
    meshRef.current.material.emissiveIntensity = targetIntensity.current;
    // source points are 2× geometry size, so half the hover scale keeps the hovered size consistent
    const s = hovered ? (point.isSource ? 2.0 : 4.0) : 1.0;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (s - meshRef.current.scale.x) * 0.15,
    );
  });

  return (
    <group position={point.position}>
      <mesh
        ref={meshRef}
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
        renderOrder={6}
      >
        <octahedronGeometry
          args={[point.isSource ? 0.016 * scale : 0.008 * scale, 0]}
        />
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

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
}) {
  const source = femaleMode ? femaleMeridians : meridians;
  return (
    <group>
      {source.map((meridian) =>
        meridian.points.map((point) => {
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
              onShowConnection={onShowConnection}
            />
          ));
        }),
      )}
    </group>
  );
}
