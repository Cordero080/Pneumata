import { useState, useCallback } from "react";
import "./GlassModal.scss";
import JargonText from "./JargonText";
import JargonPanels from "./JargonPanels";
import { IS_MOBILE } from "../../utils/device";

// Field-pair lookup: in Layman mode, prefer the *Simple field if it exists,
// otherwise fall back to the technical text. This lets us roll out layman
// copy organ-by-organ without breaking anything.
function pickField(organ, key, mode) {
  if (mode === "layman") return organ[`${key}Simple`] ?? organ[key];
  return organ[key];
}

function GlassModal({ organ, onClose }) {
  const [mode, setMode] = useState("layman");
  const [panels, setPanels] = useState([]);

  const handleJargonClick = useCallback((term, event) => {
    const rect = event.target.getBoundingClientRect();
    // Anchor panel slightly below and to the right of the clicked term,
    // clamped to the viewport so it doesn't open off-screen.
    const x = Math.min(window.innerWidth - 280, rect.left);
    const y = Math.min(window.innerHeight - 200, rect.bottom + 6);

    setPanels((prev) => {
      const existing = prev.find((p) => p.term === term);
      if (existing) {
        // Same term already open — bump to front via z increment
        const maxZ = Math.max(...prev.map((p) => p.z));
        return prev.map((p) =>
          p.id === existing.id ? { ...p, z: maxZ + 1 } : p,
        );
      }
      // New panel — stack each new one slightly offset for visibility
      const offset = prev.length * 18;
      return [
        ...prev,
        {
          id: `${term}-${Date.now()}`,
          term,
          x: x + offset,
          y: y + offset,
          z: prev.length,
        },
      ];
    });
  }, []);

  if (!organ) return null;

  const jargonClick = mode === "technical" ? handleJargonClick : undefined;
  const jargonDisabled = mode === "layman";

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Organ detail panel"
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          {/* Title: Organ → Hardware */}
          <h2 className="modal-title">
            <span className="modal-organ">{organ.organ}</span>
            <span className="modal-arrow">→</span>
            <span className="modal-hardware">{organ.hardware}</span>
          </h2>

          {/* Layman / Technical toggle */}
          <div className="modal-mode-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "layman"}
              className={`modal-mode-toggle__btn${mode === "layman" ? " is-active" : ""}`}
              onClick={() => setMode("layman")}
            >
              Plain
            </button>
            <button
              role="tab"
              aria-selected={mode === "technical"}
              className={`modal-mode-toggle__btn${mode === "technical" ? " is-active" : ""}`}
              onClick={() => setMode("technical")}
            >
              Technical
            </button>
          </div>

          {/* Dual-column functional definitions */}
          <div className="modal-body">
            <div className="modal-column">
              <h3>Biological</h3>
              <p>
                <JargonText
                  text={pickField(organ, "bioFunction", mode)}
                  onJargonClick={jargonClick}
                  disabled={jargonDisabled}
                />
              </p>
            </div>

            <div className="modal-divider" aria-hidden="true" />

            <div className="modal-column">
              <h3>Hardware</h3>
              <p>
                <JargonText
                  text={pickField(organ, "hardFunction", mode)}
                  onJargonClick={jargonClick}
                  disabled={jargonDisabled}
                />
              </p>
            </div>
          </div>

          {/* The philosophical connection */}
          <div className="modal-synthesis">
            <p>
              <JargonText
                text={pickField(organ, "synthesis", mode)}
                onJargonClick={jargonClick}
                disabled={jargonDisabled}
              />
            </p>
          </div>

          {/* Bus Lane: spinal innervation → hardware channel analogy */}
          {organ.spinalConnection && (
            <div className="modal-bus-lane">
              <h3>Bus Lane</h3>
              <p>
                <JargonText
                  text={pickField(organ, "spinalConnection", mode)}
                  onJargonClick={jargonClick}
                  disabled={jargonDisabled}
                />
              </p>
            </div>
          )}

          {mode === "technical" && !IS_MOBILE && (
            <p className="modal-jargon-hint">
              Click any highlighted term for a plain-English definition.
            </p>
          )}
        </div>
      </div>

      {/* Desktop floating jargon panels (mobile uses inline expand inside text) */}
      {!IS_MOBILE && <JargonPanels panels={panels} setPanels={setPanels} />}
    </>
  );
}

export default GlassModal;
