import { useState } from "react";
import "./AboutModal.scss";
import { CATEGORY_COLORS } from "../../data/categories";

const CATEGORIES = [
  {
    key: "logic",
    label: "Logic",
    desc: "Brain, cerebellum, spinal cord — CPU, firmware, and data bus.",
  },
  {
    key: "power",
    label: "Power",
    desc: "Heart, thyroid, adrenals — PSU, system clock, and overclock mechanism.",
  },
  {
    key: "thermal",
    label: "Thermal",
    desc: "Lungs, diaphragm — heat sink and fan controller.",
  },
  {
    key: "digestive",
    label: "Digestive",
    desc: "Stomach, liver, intestines — parser, firewall, and I/O pipeline.",
  },
  {
    key: "sensory",
    label: "Sensory",
    desc: "Eyes, ears, skin, vocal cords — camera, microphone, sensor array, and speaker.",
  },
  {
    key: "renal",
    label: "Renal",
    desc: "Kidneys, bladder — virtual memory and output buffer.",
  },
  {
    key: "immune",
    label: "Immune",
    desc: "Spleen, lymph nodes, bone marrow — SIEM, perimeter nodes, and definition engine.",
  },
  {
    key: "spirit",
    label: "Consciousness",
    desc: "Pneuma — the emergent field where information density becomes self-aware.",
  },
].map((c) => ({ ...c, color: CATEGORY_COLORS[c.key] }));

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
  {
    icon: "♂\uFE0E / ♀\uFE0E",
    action: "Body toggle",
    desc: "Switches between male and female anatomical models. Each has independently tuned proportions, brain positioning, and color theme.",
  },
  {
    icon: "☾ / ✦",
    action: "Dark mode",
    desc: "Toggles between light and dark rendering. Dark mode shifts the palette to neon-on-void and unlocks additional mesh variants.",
  },
  {
    icon: "▶ / ✕",
    action: "Animation",
    desc: "Plays the circulatory animation — energy nodes leaving the heart and tracing the full circuit through the body.",
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
            className={`about-tab${tab === "architecture" ? " about-tab--active" : ""}`}
            onClick={() => setTab("architecture")}
          >
            Architecture
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

        {tab === "architecture" && (
          <>
            <p className="about-lead">
              The body isn't one machine — it's three overlapping layers running
              through the same chassis. Once you see them separated, the
              architecture becomes clear.
            </p>

            <div className="about-tiers">
              <div className="about-tier">
                <span className="about-tier-label" style={{ color: "#c0c8d8" }}>
                  1 · Hardware Layer
                </span>
                <span className="about-tier-desc">
                  Organs, brain, spine, muscles — the physical components. Each
                  maps to a piece of computing hardware: brain as CPU, heart as
                  PSU, lungs as heat sinks, kidneys as swap memory.
                </span>
              </div>
              <div className="about-tier">
                <span className="about-tier-label" style={{ color: "#8bffea" }}>
                  2 · Data Layer
                </span>
                <span className="about-tier-desc">
                  The nervous system. Discrete, point-to-point signals —
                  instructions from brain to organs, sensations back from body
                  to brain. This is the data bus. Fast, targeted, binary.
                </span>
              </div>
              <div className="about-tier">
                <span className="about-tier-label" style={{ color: "#ff9944" }}>
                  3 · Power Layer
                </span>
                <span className="about-tier-desc">
                  The meridian network. A continuous electrical grid carrying
                  the heart's baseline current (Qi, in TCM) to every organ.
                  Without this voltage potential, the data layer has nothing to
                  switch on with. Slower, distributed, foundational.
                </span>
              </div>
            </div>

            <div className="about-thesis">
              The heart pumps voltage into the meridian grid. The grid keeps the
              brain and nerves at operational potential. Life is the power rail
              staying up.
            </div>

            <div className="about-divider" />

            <h3 className="about-subhead">Biophysical footing</h3>
            <p className="about-body">
              Two areas of emerging research support treating the meridian
              network as a real bioelectric system, not just a metaphor:
            </p>
            <div className="about-biophysics">
              <div className="about-biophysics-item">
                <span className="about-biophysics-name">
                  Perineural DC signaling
                </span>
                <span className="about-biophysics-desc">
                  The sheaths around nerve cells may carry a slower, direct-
                  current signal that operates separately from the standard
                  chemical synapses — a secondary bioelectric layer often cited
                  as a scientific correlate for the meridian system.
                </span>
              </div>
              <div className="about-biophysics-item">
                <span className="about-biophysics-name">
                  Piezoelectricity in bone and collagen
                </span>
                <span className="about-biophysics-desc">
                  Connective tissue generates electrical charge under mechanical
                  stress. Meridian pathways align with these high-conductance
                  channels through the body's fascial network.
                </span>
              </div>
            </div>

            <p className="about-footer">
              Toggle the meridian layer in the scene to see the power grid
              rendered separately from the nervous system.
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
