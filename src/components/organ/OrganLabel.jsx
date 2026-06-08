import { Html } from "@react-three/drei";

const IS_MOBILE = window.innerWidth <= 768;

function OrganLabel({ organ, color, onSelect, labelReady, screenX = 0 }) {
  const isLeft = organ.position[0] <= 0;
  const isVertical = Math.abs(screenX) > 0.65;

  const panel = {
    background: "rgba(12, 20, 40, 0.52)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: `0 4px 24px rgba(0,0,0,0.22), 0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.15)`,
    border: "1px solid rgba(255, 255, 255, 0.22)",
    borderRadius: "4px",
  };

  const subtitleColor = "rgba(200, 218, 245, 0.80)";

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
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "4px",
            }}
          />
          {/* Layer 2 — middle */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${isLeft ? -2.5 : 2.5}px, 0.5px)`,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "4px",
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
                    border: `1px solid ${color}cc`,
                    boxShadow: `0 0 18px ${color}55, 0 0 6px ${color}88, inset 0 1px 0 rgba(255,255,255,0.1)`,
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
                  : "clamp(13px, 1.1vw, 17px)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "rgba(255, 255, 255, 0.97)",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
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
                  : "clamp(10px, 0.8vw, 12px)",
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
