import { Html } from "@react-three/drei";
import { darkenForLight } from "../../data/categories";

function OrganLabel({ organ, color, darkMode }) {
  const isLeft = organ.position[0] <= 0;
  // Light mode: darken neons so they read on silvery panel
  // Dark mode: use raw neon — it pops on the dark surface
  const nameColor = darkMode ? color : darkenForLight(color);

  const panel = darkMode
    ? {
        background: "rgba(8, 12, 22, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: `0 0 12px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
        border: `1px solid ${color}55`,
      }
    : {
        background: "rgba(218, 225, 233, 0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
        border: `1px solid ${darkenForLight(color)}`,
      };

  const subtitleColor = darkMode
    ? "rgba(160, 185, 220, 0.65)"
    : "rgba(45, 60, 78, 0.72)";

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
            ...panel,
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
              color: nameColor,
              textShadow: `0 0 10px ${color}66`,
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
