import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { glossary } from "../../data/glossary";

// Desktop-only floating definition panels. Each panel is independently draggable,
// can be focused to the front by clicking, and closed with its own X button.
// Multiple panels for different terms can be open at once; re-clicking the same
// term focuses the existing panel rather than opening a duplicate.

function Panel({ panel, onFocus, onMove, onClose }) {
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const entry = glossary[panel.term];
  if (!entry) return null;

  return (
    <div
      className="jargon-panel"
      style={{
        left: panel.x,
        top: panel.y,
        zIndex: 1000 + panel.z,
      }}
      onPointerDown={() => onFocus(panel.id)}
    >
      <div
        className="jargon-panel__bar"
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          dragOffset.current = {
            x: e.clientX - panel.x,
            y: e.clientY - panel.y,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          onMove(
            panel.id,
            e.clientX - dragOffset.current.x,
            e.clientY - dragOffset.current.y,
          );
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <span className="jargon-panel__title">{entry.name}</span>
        <button
          className="jargon-panel__close"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onClose(panel.id)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="jargon-panel__body">
        <p className="jargon-panel__short">{entry.short}</p>
        {entry.example && (
          <p className="jargon-panel__example">{entry.example}</p>
        )}
      </div>
    </div>
  );
}

function JargonPanels({ panels, setPanels }) {
  const focusedZ = useRef(0);

  const handleFocus = (id) => {
    focusedZ.current += 1;
    const top = focusedZ.current;
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, z: top } : p)));
  };

  const handleMove = (id, x, y) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  const handleClose = (id) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  };

  if (!panels.length) return null;
  return createPortal(
    <>
      {panels.map((p) => (
        <Panel
          key={p.id}
          panel={p}
          onFocus={handleFocus}
          onMove={handleMove}
          onClose={handleClose}
        />
      ))}
    </>,
    document.body,
  );
}

export default JargonPanels;
