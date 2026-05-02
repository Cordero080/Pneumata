import { useRef, useState } from "react";

export const SCALE_MIN = 0.5;
export const SCALE_MAX = 1.5;
export function scaleToSlider(s) {
  return (s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
}
export function sliderToScale(v) {
  return SCALE_MIN + v * (SCALE_MAX - SCALE_MIN);
}

export const X_MIN = -0.3;
export const X_MAX = 0.3;
export function xToSlider(x) {
  return (x - X_MIN) / (X_MAX - X_MIN);
}
export function sliderToX(v) {
  return X_MIN + v * (X_MAX - X_MIN);
}

function HSlider({ label, value, onChange }) {
  const trackRef = useRef();
  const dragging = useRef(false);

  const updateFromPointer = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    onChange(Math.max(0, Math.min(1, raw)));
  };

  return (
    <div className="hslider">
      <span className="hslider__label">{label}</span>
      <div
        ref={trackRef}
        className="hslider__track"
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
      >
        <div className="hslider__fill" style={{ width: `${value * 100}%` }} />
        <div className="hslider__knob" style={{ left: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function VerticalControls({
  panY,
  onPanChange,
  zoom,
  onZoomChange,
  scale,
  onScaleChange,
  offsetX,
  onOffsetXChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`vcontrols-wrapper${open ? " vcontrols-wrapper--open" : ""}`}
    >
      <button
        className="vcontrols-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle controls"
      >
        ⊞
      </button>
      <div className="vcontrols-panel">
        <HSlider
          label="SIZE"
          value={scaleToSlider(scale)}
          onChange={(v) => onScaleChange(sliderToScale(v))}
        />
        <HSlider
          label="X"
          value={xToSlider(offsetX)}
          onChange={(v) => onOffsetXChange(sliderToX(v))}
        />
        <HSlider label="PAN" value={panY} onChange={onPanChange} />
        <HSlider label="ZOOM" value={zoom} onChange={onZoomChange} />
      </div>
    </div>
  );
}

export default VerticalControls;
