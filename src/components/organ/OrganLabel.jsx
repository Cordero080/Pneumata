import { Html } from "@react-three/drei";

const IS_MOBILE = window.innerWidth <= 768;

function OrganLabel({ organ, color, onSelect, labelReady, screenX = 0 }) {
  const isLeft = organ.position[0] <= 0;
  const isVertical = Math.abs(screenX) > 0.65;

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
          {/* Layer 3 — deepest, furthest offset */}
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
              padding: IS_MOBILE ? "6px 10px" : "8px 16px",
              maxWidth: IS_MOBILE ? "130px" : "260px",
              textAlign: isLeft ? "right" : "left",
              cursor: onSelect ? "pointer" : "default",
              pointerEvents: onSelect ? "all" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: IS_MOBILE
                  ? "clamp(10px, 3vw, 13px)"
                  : "clamp(14px, 1.2vw, 19px)",
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
            <div
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontSize: IS_MOBILE
                  ? "clamp(7px, 2.2vw, 9px)"
                  : "clamp(10px, 0.85vw, 13px)",
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
