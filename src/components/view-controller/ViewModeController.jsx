import { useRef, useEffect, useState } from "react";
import "./ViewModeController.scss";

const MODES = [
  { key: "logic", label: "Logic", color: "#ffd700" },
  { key: "power", label: "Power", color: "#ff3131" },
  { key: "breathing", label: "Breathing", color: "#ffeea0" },
  { key: "unified", label: "Unified", color: "#aaccff" },
];

function ViewModeController({
  viewMode,
  setViewMode,
  showNerves,
  setShowNerves,
  open,
  onToggle,
}) {
  const panelRef = useRef();
  const [panelW, setPanelW] = useState(null);
  const [tabWidth, setTabWidth] = useState(null);

  useEffect(() => {
    if (open && panelRef.current) {
      const w = panelRef.current.scrollWidth;
      const h = panelRef.current.offsetHeight;
      setPanelW(w);
      setTabWidth(h);
    } else {
      const t = setTimeout(() => {
        setPanelW(null);
        setTabWidth(null);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <>
      <div
        className={`view-controller${open ? " view-controller--open" : ""}`}
        style={panelW ? { width: panelW } : undefined}
      >
        <div className="view-controller-panel" ref={panelRef}>
          {MODES.map(({ key, label, color }) => {
            const active = viewMode === key;
            return (
              <button
                key={key}
                className={`view-btn${active ? " view-btn--active" : ""}`}
                style={
                  active
                    ? {
                        borderBottom: `2px solid ${color}`,
                        boxShadow: `0 2px 8px ${color}66, inset 0 -4px 12px ${color}15`,
                      }
                    : {}
                }
                onClick={() => setViewMode(key)}
              >
                {label}
              </button>
            );
          })}
          <button
            className={`view-btn view-btn--net${showNerves ? " view-btn--active" : ""}`}
            style={
              showNerves
                ? {
                    borderBottom: `2px solid #a0c8ff`,
                    boxShadow: `0 2px 8px #a0c8ff66, inset 0 -4px 12px #a0c8ff15`,
                  }
                : {}
            }
            onClick={() => setShowNerves((v) => !v)}
          >
            Net
          </button>
        </div>
      </div>
      <button
        className={`view-controller-tab${open ? " view-controller-tab--open" : ""}`}
        onClick={() => onToggle((o) => !o)}
        aria-label="Toggle view modes"
        style={tabWidth != null ? { width: `${tabWidth}px` } : undefined}
      >
        <span className="view-controller-tab__arrow">∧</span>
      </button>
    </>
  );
}

export default ViewModeController;
