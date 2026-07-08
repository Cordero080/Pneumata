import { Html } from "@react-three/drei";
import { ORGAN_TCM, TCM_ELEMENTS } from "../../data/tcmMapping";

const IS_MOBILE = window.innerWidth <= 768;

function OrganLabel({
  organ,
  color,
  onSelect,
  onQiChannel,
  onClose,
  labelReady,
  screenX = 0,
  showMeridians = false,
}) {
  const isLeft = organ.position[0] <= 0;
  const isVertical = Math.abs(screenX) > 0.65;

  // TCM/meridian info is a separate analogical layer from the hardware view
  // modes (Logic/Power/Breathing/Unified) — kept out of the default label so
  // the two systems don't blur together. Only surfaces once the user has
  // voluntarily turned on Meridian mode via the ☯ toggle.
  const tcm = showMeridians ? ORGAN_TCM[organ.id] : null;
  const element = tcm ? TCM_ELEMENTS[tcm.element] : null;

  const panel = {
    background: "rgba(220, 232, 248, 0.30)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    boxShadow: `0 8px 32px rgba(0,0,0,0.22), 0 0 20px ${color}20, inset 0 1.5px 0 rgba(255,255,255,0.70), inset 0 -1px 0 rgba(180,200,230,0.15)`,
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "6px",
  };

  const subtitleColor = "rgba(18, 38, 72, 0.70)";

  return (
    <Html
      center
      portal={{ current: document.body }}
      zIndexRange={[9999, 9999]}
      style={{ pointerEvents: "none", userSelect: "none", overflow: "visible" }}
    >
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? {
                left: "50%",
                bottom: "10px",
                transform: labelReady
                  ? "translateX(-50%) scale(1.06)"
                  : "translateX(-50%)",
              }
            : {
                left: isLeft ? "auto" : "10px",
                right: isLeft ? "10px" : "auto",
                top: "50%",
                transform: labelReady
                  ? "translateY(-50%) perspective(300px) rotateX(-8deg) scale(1.06)"
                  : "translateY(-50%)",
              }),
          display: "flex",
          flexDirection: isVertical
            ? "column-reverse"
            : isLeft
              ? "row-reverse"
              : "row",
          alignItems: "center",
          animation: labelReady
            ? "labelReadyPulse 1s ease-in-out infinite"
            : "scanReveal 0.22s ease-out both",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Connector line + tick */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isVertical
              ? "column"
              : isLeft
                ? "row-reverse"
                : "row",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={
              isVertical
                ? {
                    width: "1px",
                    height: "40px",
                    background: `linear-gradient(to bottom, ${color}00, ${color}dd)`,
                  }
                : {
                    width: "52px",
                    height: "1px",
                    background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}00, ${color}dd)`,
                  }
            }
          />
          <div
            style={
              isVertical
                ? { width: "10px", height: "1px", background: `${color}dd` }
                : { width: "1px", height: "10px", background: `${color}dd` }
            }
          />
        </div>

        {/* Label panel — stacked layers for plexi thickness */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Layer 3 — deepest */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${isLeft ? -5 : 5}px, 1px)`,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "6px",
            }}
          />
          {/* Layer 2 — middle */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${isLeft ? -2.5 : 2.5}px, 0.5px)`,
              background: "rgba(255,255,255,0.09)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: "6px",
            }}
          />
          {/* Layer 1 — front */}
          <div
            onClick={
              onSelect
                ? (e) => {
                    e.stopPropagation();
                    onSelect(organ);
                  }
                : undefined
            }
            style={{
              ...panel,
              ...(labelReady
                ? {
                    border: `1px solid ${color}aa`,
                    boxShadow: `0 0 18px ${color}44, inset 0 1.5px 0 rgba(255,255,255,0.70)`,
                  }
                : {}),
              position: "relative",
              zIndex: 1,
              padding: IS_MOBILE ? "7px 12px" : "10px 18px",
              paddingTop: IS_MOBILE ? "22px" : "26px",
              maxWidth: IS_MOBILE ? "160px" : "300px",
              textAlign: isLeft ? "right" : "left",
              cursor: onSelect ? "pointer" : "default",
              pointerEvents: "all",
            }}
          >
            {/* Close button */}
            {onClose && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "8px",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "rgba(8, 20, 48, 0.45)",
                  lineHeight: 1,
                  borderRadius: "3px",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(8,20,48,0.85)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(8,20,48,0.45)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ×
              </div>
            )}

            {/* Organ name */}
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: IS_MOBILE
                  ? "clamp(12px, 3.5vw, 15px)"
                  : "clamp(16px, 1.5vw, 22px)",
                fontWeight: 800,
                letterSpacing: "0.16em",
                color: "rgba(8, 20, 48, 0.95)",
                textShadow: "0 1px 0 rgba(255,255,255,0.6)",
                lineHeight: 1.2,
                textTransform: "uppercase",
              }}
            >
              {organ.organ}
            </div>

            {/* Hardware analog */}
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: IS_MOBILE
                  ? "clamp(8px, 2.5vw, 11px)"
                  : "clamp(11px, 1vw, 14px)",
                fontWeight: 500,
                letterSpacing: "0.12em",
                color: subtitleColor,
                lineHeight: 1.4,
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              {organ.hardware}
            </div>

            {/* TCM element + meridian row */}
            {element && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "7px",
                  justifyContent: isLeft ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: element.color,
                    boxShadow: `0 0 6px ${element.color}99`,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Orbitron', system-ui, sans-serif",
                    fontSize: IS_MOBILE
                      ? "clamp(7px, 2vw, 9px)"
                      : "clamp(9px, 0.8vw, 11px)",
                    fontWeight: 600,
                    letterSpacing: "0.10em",
                    color: element.color,
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {element.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron', system-ui, sans-serif",
                    fontSize: IS_MOBILE
                      ? "clamp(7px, 2vw, 9px)"
                      : "clamp(9px, 0.8vw, 11px)",
                    fontWeight: 400,
                    letterSpacing: "0.08em",
                    color: subtitleColor,
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  · {tcm.meridianName}
                </div>
              </div>
            )}

            {/* Qi Channel button — shown when the organ has a linked meridian */}
            {tcm?.meridianId && (
              <div
                onClick={
                  onQiChannel
                    ? (e) => {
                        e.stopPropagation();
                        onQiChannel(tcm.meridianId);
                      }
                    : undefined
                }
                style={{
                  marginTop: "8px",
                  fontFamily: "'Orbitron', system-ui, sans-serif",
                  fontSize: IS_MOBILE
                    ? "clamp(7px, 2vw, 9px)"
                    : "clamp(9px, 0.8vw, 11px)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: element?.color ?? color,
                  textTransform: "uppercase",
                  cursor: onQiChannel ? "pointer" : "default",
                  pointerEvents: onQiChannel ? "all" : "none",
                  opacity: onQiChannel ? 1 : 0.5,
                  borderTop: "1px solid rgba(255,255,255,0.25)",
                  paddingTop: "6px",
                }}
              >
                Qi Channel →
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanReveal {
          from { opacity: 0; clip-path: inset(0 100% 0 0); }
          to   { opacity: 1; clip-path: inset(0 0% 0 0); }
        }
        @keyframes labelReadyPulse {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50%       { opacity: 0.75; filter: brightness(1.4); }
        }
      `}</style>
    </Html>
  );
}

export default OrganLabel;
