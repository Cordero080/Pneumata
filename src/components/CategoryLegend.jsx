import { useState } from "react";

const CATEGORIES = [
  {
    key: "spirit",
    color: "#ffffff",
    label: "Spirit",
    desc: "Emergence & Consciousness",
  },
  {
    key: "logic",
    color: "#ffd700",
    label: "Logic",
    desc: "Cognition & Control",
  },
  {
    key: "power",
    color: "#ff3131",
    label: "Power",
    desc: "Energy & Regulation",
  },
  {
    key: "thermal",
    color: "#00f2ff",
    label: "Thermal",
    desc: "Exchange & Cooling",
  },
  {
    key: "digestive",
    color: "#39ff14",
    label: "Digestive",
    desc: "Processing & Filtering",
  },
  {
    key: "sensory",
    color: "#ff8c00",
    label: "Sensory",
    desc: "I/O & Signal Transduction",
  },
  {
    key: "renal",
    color: "#b06bff",
    label: "Renal",
    desc: "Filtration & Memory Mgmt",
  },
  {
    key: "immune",
    color: "#00e5cc",
    label: "Immune",
    desc: "Defense & Threat Response",
  },
];

function CategoryLegend() {
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div className="category-legend">
      {CATEGORIES.map(({ key, color, label, desc }) => {
        const active = hoveredKey === key;
        return (
          <div
            key={key}
            className="legend-row"
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {/* Text fades in to the LEFT of the dot */}
            <div
              className="legend-text"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateX(0)" : "translateX(6px)",
              }}
            >
              <span className="legend-label" style={{ color }}>
                {label}
              </span>
              <span className="legend-desc">{desc}</span>
            </div>

            {/* Colored dot */}
            <div
              className="legend-dot"
              style={{
                background: color,
                boxShadow: active
                  ? `0 0 10px ${color}, 0 0 20px ${color}55`
                  : `0 0 6px ${color}80`,
                transform: active ? "scale(1.5)" : "scale(1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default CategoryLegend;
