import { useRef } from "react";

const TRACK_H = 130;

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
        style={{ height: TRACK_H }}
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
        {/* Filled portion above knob */}
        <div
          className="vslider__fill"
          style={{ height: `${value * TRACK_H}px` }}
        />
        {/* Knob */}
        <div
          className="vslider__knob"
          style={{ top: `${value * TRACK_H}px` }}
        />
      </div>
    </div>
  );
}

function VerticalControls({ panY, onPanChange, zoom, onZoomChange }) {
  return (
    <div className="vertical-controls">
      <VSlider label="PAN" value={panY} onChange={onPanChange} />
      <div className="vertical-controls__sep" />
      <VSlider label="ZOOM" value={zoom} onChange={onZoomChange} />
    </div>
  );
}

export default VerticalControls;
