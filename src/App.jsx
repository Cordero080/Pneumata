import { useState, useRef, useCallback, useEffect } from "react";
import Scene from "./components/scene/Scene";
import GlassModal from "./components/GlassModal";
import AboutModal from "./components/AboutModal";
import CategoryLegend from "./components/CategoryLegend";
import ViewModeController from "./components/ViewModeController";
import VerticalControls from "./components/VerticalControls";

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [meshMode, setMeshMode] = useState(2); // 0=ghost, 1=semi-transparent silver, 2=solid silver
  const [brainZoom, setBrainZoom] = useState(false);
  // panY: 0 = knob top (head), 1 = knob bottom (legs). Default ≈ body center.
  // zoom:  0 = knob top (close),  1 = knob bottom (far). Default ≈ starting distance.
  const [panY, setPanY] = useState(0.5);
  const [zoom, setZoom] = useState(0.33);
  const [globalScale, setGlobalScale] = useState(0.9);
  const [offsetX, setOffsetX] = useState(0.0);
  const [offsetY, setOffsetY] = useState(0.1);
  const [resetKey, setResetKey] = useState(0);
  const handleReset = () => {
    setPanY(0.5);
    setZoom(0.33);
    setGlobalScale(0.9);
    setOffsetX(0.0);
    setOffsetY(0.1);
    setResetKey((k) => k + 1);
  };
  const aboutRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && brainZoom) setBrainZoom(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [brainZoom]);

  const handleTilt = useCallback((e) => {
    const btn = aboutRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    btn.style.transform = `perspective(400px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale(1.05)`;
  }, []);

  const resetTilt = useCallback(() => {
    const btn = aboutRef.current;
    if (btn) btn.style.transform = "";
  }, []);

  return (
    <div className={`app${darkMode ? " app--dark" : ""}`}>
      <header className="app-header">
        <div className="header-strip">
          <div className="header-accent header-accent--top">
            <button
              className={`mode-toggle-btn${darkMode ? " mode-toggle-btn--active" : ""}`}
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "✦" : "☾"}
            </button>
          </div>
          <div className="header-panel">
            <h1>Pneumata</h1>
            <p>Analogical Anatomy</p>
          </div>
          <div className="header-accent header-accent--bottom" />
        </div>
      </header>

      <div className="top-right-strip">
        <button
          ref={aboutRef}
          className="about-btn"
          onClick={() => setShowAbout(true)}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          About
        </button>
        <button
          className={`mesh-toggle-btn mesh-toggle-btn--${meshMode}`}
          onClick={() =>
            setMeshMode((m) => {
              if (darkMode) {
                return { 2: 0, 0: 1, 1: 3, 3: 4, 4: 5, 5: 2 }[m] ?? 0;
              }
              return (m + 1) % 4;
            })
          }
        >
          {meshMode === 0
            ? "◻"
            : meshMode === 1
              ? "◈"
              : meshMode === 2
                ? "◼"
                : meshMode === 3
                  ? "◇"
                  : meshMode === 4
                    ? "◎"
                    : "⬤"}
        </button>
        <button className="reset-btn" onClick={handleReset}>
          ↺
        </button>
      </div>

      <Scene
        globalScale={globalScale}
        offsetX={offsetX}
        offsetY={offsetY}
        onSelect={setSelectedOrgan}
        selectedOrgan={selectedOrgan}
        viewMode={viewMode}
        showNerves={showNerves}
        darkMode={darkMode}
        meshMode={meshMode}
        brainZoom={brainZoom}
        setBrainZoom={setBrainZoom}
        panY={panY}
        zoom={zoom}
        resetKey={resetKey}
      />

      <VerticalControls
        panY={panY}
        onPanChange={setPanY}
        zoom={zoom}
        onZoomChange={setZoom}
        scale={globalScale}
        onScaleChange={setGlobalScale}
        offsetX={offsetX}
        onOffsetXChange={setOffsetX}
      />
      {brainZoom && (
        <button className="brain-back-btn" onClick={() => setBrainZoom(false)}>
          ← Back
        </button>
      )}

      <GlassModal
        organ={selectedOrgan}
        onClose={() => setSelectedOrgan(null)}
      />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <CategoryLegend />

      <ViewModeController
        viewMode={viewMode}
        setViewMode={setViewMode}
        showNerves={showNerves}
        setShowNerves={setShowNerves}
      />

      <p className="app-copyright">© 2026 Pablo Cordero</p>
    </div>
  );
}

export default App;
