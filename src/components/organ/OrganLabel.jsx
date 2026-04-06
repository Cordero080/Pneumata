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
          animation: "scanReveal 0.18s ease-out both",
        }}
      >
        {/* Connecting line with tick terminator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isLeft ? "row-reverse" : "row",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "1px",
              background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}00, ${color}cc)`,
            }}
          />
          <div
            style={{ width: "1px", height: "10px", background: `${color}cc` }}
          />
        </div>

        {/* Text block */}
        <div
          style={{
            padding: isLeft ? "0 0 0 8px" : "0 8px 0 0",
            textAlign: isLeft ? "right" : "left",
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', system-ui, sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: color,
              textShadow: `0 1px 4px #000, 0 2px 8px #000a, 0 0 12px ${color}99`,
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
              letterSpacing: "0.18em",
              color: `${color}88`,
              textShadow: "0 1px 3px #000, 0 2px 6px #000a",
              lineHeight: 1.4,
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            {organ.category}
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
