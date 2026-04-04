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
}) {
  return (
    <div className="view-controller">
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
  );
}

export default ViewModeController;
