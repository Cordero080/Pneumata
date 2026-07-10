import "./OrbToggle.scss";

// Toggles the ambient background-particle field (SceneOrbs) on/off. Only
// rendered while a themed background is active — see ORB_DEFAULT_BY_BG in
// App.jsx. `key={bgMode}` on the mount site remounts this on every
// background switch, retriggering the slide-in animation so the toggle
// visibly "arrives" each time the user picks a new theme.
function OrbToggle({ enabled, onToggle, style }) {
  return (
    <button
      className={`orb-toggle${enabled ? " orb-toggle--on" : ""}`}
      onClick={onToggle}
      aria-pressed={enabled}
      title={enabled ? "Hide ambient orbs" : "Show ambient orbs"}
      style={style}
    >
      <span className="orb-toggle__dot" />
      <span className="orb-toggle__label">Orbs</span>
    </button>
  );
}

export default OrbToggle;
