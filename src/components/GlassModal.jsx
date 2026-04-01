function GlassModal({ organ, onClose }) {
  if (!organ) return null;

  return (
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

        {/* Low-Temp Logic: dual-column functional definitions */}
        <div className="modal-body">
          <div className="modal-column">
            <h3>Biological</h3>
            <p>{organ.bio_function}</p>
          </div>

          <div className="modal-divider" aria-hidden="true" />

          <div className="modal-column">
            <h3>Hardware</h3>
            <p>{organ.hard_function}</p>
          </div>
        </div>

        {/* High-Temp Synthesis: the philosophical connection */}
        <div className="modal-synthesis">
          <p>{organ.synthesis}</p>
        </div>

        {/* Bus Lane: spinal innervation → hardware channel analogy */}
        {organ.spinalConnection && (
          <div className="modal-bus-lane">
            <h3>Bus Lane</h3>
            <p>{organ.spinalConnection}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlassModal;
