import { Html } from "@react-three/drei";

function OrganLabel({ organ, color }) {
  const isLeft = organ.position[0] <= 0;

  return (
    <Html
      center
      style={{ pointerEvents: "none", userSelect: "none", overflow: "visible" }}
    >
      <div
        style={{
          position: "absolute",
          whiteSpace: "nowrap",
          left: isLeft ? "auto" : "10px",
          right: isLeft ? "10px" : "auto",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: isLeft ? "row-reverse" : "row",
          alignItems: "center",
          gap: "0",
          animation: "scanReveal 0.22s ease-out both",
        }}
      >
        {/* Connector line + tick */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isLeft ? "row-reverse" : "row",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "52px",
              height: "1px",
              background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}00, ${color}dd)`,
            }}
          />
          <div
            style={{ width: "1px", height: "10px", background: `${color}dd` }}
          />
        </div>

        {/* Label panel */}
        <div
          style={{
            background: "rgba(6, 10, 18, 0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${color}44`,
            padding: "6px 10px",
            clipPath:
              "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            textAlign: isLeft ? "right" : "left",
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', system-ui, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: color,
              textShadow: `0 0 10px ${color}99`,
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            {organ.organ}
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', system-ui, sans-serif",
              fontSize: "7px",
              fontWeight: 400,
              letterSpacing: "0.12em",
              color: "rgba(200, 215, 235, 0.75)",
              lineHeight: 1.4,
              textTransform: "uppercase",
              marginTop: "3px",
            }}
          >
            {organ.hardware}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanReveal {
          from { opacity: 0; clip-path: inset(0 100% 0 0); }
          to   { opacity: 1; clip-path: inset(0 0% 0 0); }
        }
      `}</style>
    </Html>
  );
}

export default OrganLabel;
