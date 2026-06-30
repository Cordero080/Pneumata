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

const KNOB_H = 8; // px — must match .vslider__knob height in CSS

function VSlider({ label, value, onChange }) {
  const trackRef = useRef();
  const dragging = useRef(false);

  const updateFromPointer = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const inset = KNOB_H / 2;
    onChange(
      Math.max(
        0,
        Math.min(
          1,
          1 - (e.clientY - rect.top - inset) / (rect.height - inset * 2),
        ),
      ),
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
          style={{
            top: `calc(${KNOB_H / 2}px + (100% - ${KNOB_H}px) * ${1 - value})`,
          }}
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
  closeOnOrgan,
  autoRotate,
  onAutoRotateToggle,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (closeOnOrgan) setOpen(false);
  }, [closeOnOrgan]);

  const panelOpen = open && !closeOnOrgan;
  const triggerRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 44, right: 0 });

  useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom,
      right: window.innerWidth - rect.right,
    });
  }, [panelOpen]);

  return (
    <div
      className={`vcontrols-wrapper${panelOpen ? " vcontrols-wrapper--open" : ""}`}
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
        <div>
          <div
            className={`vcontrols-panel${panelOpen ? " vcontrols-panel--open" : ""}${darkMode ? " vcontrols-panel--dark" : ""}`}
            style={
              window.innerWidth >= 769
                ? // ── DESKTOP: flush with nav bottom (44px header) ──
                  { top: 44, right: panelPos.right }
                : // ── MOBILE: flush with nav bottom, pinned to right edge ──
                  { top: panelPos.top, right: 4 }
            }
          >
            <VSlider
              label="X"
              value={xToSlider(offsetX)}
              onChange={(v) => onOffsetXChange(sliderToX(v))}
            />
            <VSlider label="PAN" value={panY} onChange={onPanChange} />
            <VSlider label="ZOOM" value={zoom} onChange={onZoomChange} />
            <button
              className={`vcontrols-rotate-btn${autoRotate ? " vcontrols-rotate-btn--on" : ""}`}
              onClick={onAutoRotateToggle}
              title={autoRotate ? "Stop auto-rotation" : "Start auto-rotation"}
            >
              <span className="vcontrols-rotate-btn__icon">⟳</span>
              <span className="vcontrols-rotate-btn__label">
                {autoRotate ? "SPIN" : "FREE"}
              </span>
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default VerticalControls;
