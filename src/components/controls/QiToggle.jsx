import "./QiToggle.scss";

export default function QiToggle({ enabled, onToggle, style }) {
  return (
    <button
      className={`qi-toggle${enabled ? " qi-toggle--on" : ""}`}
      onClick={onToggle}
      title={enabled ? "Hide qi flow" : "Show qi flow"}
      style={style}
    >
      <span className="qi-toggle__dot" />
      <span className="qi-toggle__label">Qi</span>
    </button>
  );
}
