import { CATEGORIES as _BASE, CATEGORY_COLORS } from "../../data/categories";
import "./CategoryLegend.scss";

// Merge colors into the shared CATEGORIES array for rendering
const CATEGORIES = _BASE.map((c) => ({ ...c, color: CATEGORY_COLORS[c.key] }));

function CategoryLegend({ onCategoryHover, darkMode = false }) {
  return (
    <div
      className={`category-legend${darkMode ? " category-legend--dark" : ""}`}
    >
      {CATEGORIES.map(({ key, color, label, desc }) => (
        <div
          key={key}
          className="legend-row"
          onMouseEnter={() => onCategoryHover?.(key)}
          onMouseLeave={() => onCategoryHover?.(null)}
        >
          {/* Chamfered tag slides out on hover */}
          <div className="legend-tag">
            <span className="legend-label">{label}</span>
            <span className="legend-desc">{desc}</span>
          </div>

          {/* Colored dot */}
          <div
            className="legend-dot"
            style={{
              background: `linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, ${color} 40%, rgba(0,0,0,0.15) 100%)`,
              boxShadow: `0 0 4px ${color}99, 0 0 8px ${color}44`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default CategoryLegend;
