import { CATEGORIES as _BASE, CATEGORY_COLORS } from "../../data/categories";
import "./CategoryLegend.scss";

// Merge colors into the shared CATEGORIES array for rendering
const CATEGORIES = _BASE.map((c) => ({ ...c, color: CATEGORY_COLORS[c.key] }));

function CategoryLegend({ onCategoryHover }) {
  return (
    <div className="category-legend">
      {CATEGORIES.map(({ key, color, label, desc }) => (
        <div
          key={key}
          className="legend-row"
          onMouseEnter={() => onCategoryHover?.(key)}
          onMouseLeave={() => onCategoryHover?.(null)}
        >
          {/* Chamfered tag slides out on hover */}
          <div className="legend-tag">
            <span
              className="legend-label"
              style={{
                color: "#ffffff",
                textShadow: `0 0 10px ${color}, 0 0 20px ${color}88`,
              }}
            >
              {label}
            </span>
            <span className="legend-desc">{desc}</span>
          </div>

          {/* Colored dot */}
          <div
            className="legend-dot"
            style={{
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), ${color} 55%, rgba(0,0,0,0.3))`,
              boxShadow: `0 2px 4px rgba(0,0,0,0.3), 0 0 8px ${color}80`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default CategoryLegend;
