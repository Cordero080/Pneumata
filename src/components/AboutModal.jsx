import { useState } from "react";

const CATEGORIES = [
  {
    color: "#ffd700",
    label: "Logic",
    desc: "Brain, cerebellum, spinal cord — the CPU, firmware, and data bus.",
  },
  {
    color: "#ff3131",
    label: "Power",
    desc: "Heart, lungs, diaphragm — the PSU, cooling system, and power rail.",
  },
  {
    color: "#00f2ff",
    label: "Thermal",
    desc: "Kidneys, skin, lymph — the heat sink, liquid loop, and exhaust.",
  },
  {
    color: "#39ff14",
    label: "Digestive",
    desc: "Stomach, liver, intestines — storage, compiler, and I/O buffer.",
  },
  {
    color: "#ffffff",
    label: "Spirit",
    desc: "Pneuma — the emergent field where information density becomes self-aware.",
  },
];

const NAV_ITEMS = [
  {
    icon: "◎",
    action: "Tap / click a node",
    desc: "On mobile: first tap reveals the label and highlights that system's spinal bus lanes. Tap the label or the node again to open the detail panel. On desktop: a single click opens the panel directly.",
  },
  {
    icon: "⬡",
    action: "Tap / click a vertebral disc",
    desc: "Each disc is a bus arbitration layer. Opens a panel showing the spinal level, what it innervates, and its hardware analog.",
  },
  {
    icon: "◈",
    action: "Hover a node or disc (desktop)",
    desc: "Highlights the nerve roots and spinal bus lanes for that organ system. The backbone lights up with the category color.",
  },
  {
    icon: "◻",
    action: "View modes — Logic / Power / Breathing / Unified",
    desc: "Logic isolates the neural network. Power activates the circulatory grid. Breathing isolates the lungs with a live respiration animation. Unified shows all systems simultaneously.",
  },
  {
    icon: "⬤",
    action: "NET toggle",
    desc: "Overlays the full peripheral nervous system — spinal nerve roots mapped to each organ and white matter tracts between brain regions.",
  },
  {
    icon: "◼\uFE0E",
    action: "Mesh toggle",
    desc: "Cycles the body model through rendering styles: solid, semi-transparent, wireframe, and more. Dark mode unlocks additional variants.",
  },
];

function AboutModal({ onClose }) {
  const [tab, setTab] = useState("philosophy");

  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="about-eyebrow">Analogical Anatomy</div>
        <h2 className="about-title">Pneumata</h2>

        {/* Tab bar */}
        <div className="about-tabs">
          <button
            className={`about-tab${tab === "philosophy" ? " about-tab--active" : ""}`}
            onClick={() => setTab("philosophy")}
          >
            Philosophy
          </button>
          <button
            className={`about-tab${tab === "navigate" ? " about-tab--active" : ""}`}
            onClick={() => setTab("navigate")}
          >
            How to Navigate
          </button>
        </div>

        {tab === "philosophy" && (
          <>
            <p className="about-lead">
              The human body is a machine. Not metaphorically — architecturally.
              Every organ is a subsystem. Every fluid is a bus. Every heartbeat
              is a clock cycle distributing power to the network.
            </p>

            <p className="about-body">
              Pneumata maps the biological to the computational: the brain as
              CPU, the heart as PSU, the lungs as cooling, the gut as storage.
              The goal is not to reduce life to hardware — it is to reveal that
              hardware was always modeled on life.
            </p>

            <p className="about-body">
              The circulatory system is the power rail. Watch the energy nodes
              leave the heart and trace the full circuit — cranium, arms, torso,
              legs — before returning. Every organ along that path draws from
              the same source.
            </p>

            <div className="about-divider" />

            <div className="about-modes">
              <div className="about-mode">
                <span className="about-mode-label" style={{ color: "#ffd700" }}>
                  Logic
                </span>
                <span className="about-mode-desc">
                  The neural network. Processing, memory, signal.
                </span>
              </div>
              <div className="about-mode">
                <span className="about-mode-label" style={{ color: "#ff3131" }}>
                  Power
                </span>
                <span className="about-mode-desc">
                  The circulatory grid. Energy distribution from the heart
                  outward.
                </span>
              </div>
              <div className="about-mode">
                <span className="about-mode-label" style={{ color: "#aaccff" }}>
                  Unified
                </span>
                <span className="about-mode-desc">
                  All systems at once. The full machine, alive.
                </span>
              </div>
            </div>

            <div className="about-divider" />

            <div className="about-categories">
              {CATEGORIES.map(({ color, label, desc }) => (
                <div key={label} className="about-cat-row">
                  <span
                    className="about-cat-dot"
                    style={{
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                    }}
                  />
                  <div>
                    <span className="about-cat-label" style={{ color }}>
                      {label}
                    </span>
                    <span className="about-cat-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="about-footer">
              Tap or click any node to explore the analogy. The white node at
              the apex is Pneuma — the point where the system becomes aware of
              itself.
            </p>
          </>
        )}

        {tab === "navigate" && (
          <div className="about-nav-list">
            {NAV_ITEMS.map(({ icon, action, desc }) => (
              <div key={action} className="about-nav-item">
                <span className="about-nav-icon">{icon}</span>
                <div>
                  <div className="about-nav-action">{action}</div>
                  <div className="about-nav-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutModal;
