import { useState, useEffect, useRef } from "react";
import { CATEGORIES as _BASE, CATEGORY_COLORS } from "../../data/categories";
import "./CategoryLegend.scss";

// Merge colors into the shared CATEGORIES array for rendering
const CATEGORIES = _BASE.map((c) => ({ ...c, color: CATEGORY_COLORS[c.key] }));

function CategoryLegend({ onCategoryHover, darkMode = false }) {
  // Which category's tag is pinned open (clicked) to show the full detail.
  const [expandedKey, setExpandedKey] = useState(null);
  const rootRef = useRef(null);

  // Click anywhere outside the legend closes the expanded tag.
  useEffect(() => {
    if (!expandedKey) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setExpandedKey(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [expandedKey]);

  return (
    <div
      ref={rootRef}
      className={`category-legend${darkMode ? " category-legend--dark" : ""}`}
    >
      {CATEGORIES.map(
        ({ key, color, label, desc, about, hardware, examples }) => {
          const expanded = expandedKey === key;
          return (
            <div
              key={key}
              className={`legend-row${expanded ? " legend-row--expanded" : ""}`}
              onMouseEnter={() => onCategoryHover?.(key)}
              onMouseLeave={() => onCategoryHover?.(null)}
              onClick={() => setExpandedKey(expanded ? null : key)}
            >
              {/* Chamfered tag slides out on hover; click pins it open + detail */}
              <div className="legend-tag">
                <div className="legend-tag__head">
                  <div className="legend-tag__titles">
                    <span className="legend-label">{label}</span>
                    <span className="legend-desc">{desc}</span>
                  </div>
                  {/* Click affordance — +/− toggles */}
                  <span className="legend-toggle">{expanded ? "–" : "+"}</span>
                </div>

                {expanded && (
                  <div className="legend-detail">
                    <div className="legend-about">{about}</div>
                    {hardware && <div className="legend-hw">↳ {hardware}</div>}
                    {examples?.length > 0 && (
                      <div className="legend-ex">{examples.join(" · ")}</div>
                    )}
                  </div>
                )}
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
          );
        },
      )}
    </div>
  );
}

export default CategoryLegend;
