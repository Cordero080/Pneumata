import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./VerticalControls.scss";

export const X_MIN = -0.3;
export const X_MAX = 0.3;
export function xToSlider(x) {
  return (x - X_MIN) / (X_MAX - X_MIN);
}
export function sliderToX(v) {
  return X_MIN + v * (X_MAX - X_MIN);
}

function VSlider({ label, value, onChange }) {
  const trackRef = useRef();
  const dragging = useRef(false);

  const updateFromPointer = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    // top = 1 (max), bottom = 0 (min)
    onChange(
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    );
  };

  return (
    <div className="vslider">
      <div
        ref={trackRef}
        className="vslider__track"
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) updateFromPointer(e);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div className="vslider__fill" style={{ height: `${value * 100}%` }} />
        <div
          className="vslider__knob"
          style={{ top: `${(1 - value) * 100}%` }}
        />
      </div>
      <span className="vslider__label">{label}</span>
    </div>
  );
}

function VerticalControls({
  panY,
  onPanChange,
  zoom,
  onZoomChange,
  offsetX,
  onOffsetXChange,
  darkMode,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 44, right: 0 });

  useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  return (
    <div
      className={`vcontrols-wrapper${open ? " vcontrols-wrapper--open" : ""}`}
    >
      <button
        ref={triggerRef}
        className="vcontrols-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle controls"
      >
        ⊞
      </button>
      {createPortal(
        <div className={darkMode ? "app--dark" : ""}>
          <div
            className={`vcontrols-panel${open ? " vcontrols-panel--open" : ""}`}
            style={
              window.innerWidth >= 769
                ? { top: panelPos.top + 90, right: panelPos.right + 50 }
                : undefined
            }
          >
            <VSlider
              label="X"
              value={xToSlider(offsetX)}
              onChange={(v) => onOffsetXChange(sliderToX(v))}
            />
            <VSlider label="PAN" value={panY} onChange={onPanChange} />
            <VSlider label="ZOOM" value={zoom} onChange={onZoomChange} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default VerticalControls;
