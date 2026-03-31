const MODES = [
  { key: "logic", label: "Logic", color: "#ffd700" },
  { key: "power", label: "Power", color: "#ff3131" },
  { key: "unified", label: "Unified", color: "#aaccff" },
];

function ViewModeController({ viewMode, setViewMode }) {
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
                    color,
                    background: `${color}18`,
                    boxShadow: `0 0 14px ${color}44`,
                    borderColor: `${color}55`,
                  }
                : {}
            }
            onClick={() => setViewMode(key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeController;
