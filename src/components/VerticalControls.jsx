import { useRef } from "react";

// Scale: slider 0 (top) = small, 1 (bottom) = large → globalScale 0.5..1.5
export const SCALE_MIN = 0.5;
export const SCALE_MAX = 1.5;
export function scaleToSlider(s) {
  return (s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
}
export function sliderToScale(v) {
  return SCALE_MIN + v * (SCALE_MAX - SCALE_MIN);
}

// X offset: slider 0 (top) = left, 1 (bottom) = right → offsetX -0.3..0.3
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
    const raw = (e.clientY - rect.top) / rect.height;
    onChange(Math.max(0, Math.min(1, raw)));
  };

  return (
    <div className="vslider">
      <span className="vslider__label">{label}</span>
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
      >
        <div className="vslider__fill" style={{ height: `${value * 100}%` }} />
        <div className="vslider__knob" style={{ top: `${value * 100}%` }} />
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
  return (
    <div className="vertical-controls">
      <VSlider
        label="SIZE"
        value={scaleToSlider(scale)}
        onChange={(v) => onScaleChange(sliderToScale(v))}
      />
      <VSlider
        label="X"
        value={xToSlider(offsetX)}
        onChange={(v) => onOffsetXChange(sliderToX(v))}
      />
      <VSlider label="PAN" value={panY} onChange={onPanChange} />
      <VSlider label="ZOOM" value={zoom} onChange={onZoomChange} />
    </div>
  );
}

export default VerticalControls;
