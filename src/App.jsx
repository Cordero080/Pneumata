import { useState, useRef, useCallback, useEffect } from "react";
import Scene from "./components/scene/Scene";
import GlassModal from "./components/GlassModal";
import AboutModal from "./components/AboutModal";
import CategoryLegend from "./components/CategoryLegend";
import ViewModeController from "./components/ViewModeController";
import VerticalControls from "./components/VerticalControls";

// Defaults differ by device — mobile needs smaller scale to clear the bottom bar
const IS_MOBILE = window.innerWidth <= 768;
const DEFAULTS = IS_MOBILE
  ? { panY: 0.45, zoom: 0.38, globalScale: 0.72, offsetX: 0, offsetY: 0.08 }
  : { panY: 0.5, zoom: 0.33, globalScale: 0.9, offsetX: 0, offsetY: 0.1 };

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [meshMode, setMeshMode] = useState(2); // 0=ghost, 1=semi-transparent silver, 2=solid silver
  const [brainZoom, setBrainZoom] = useState(false);
  const [panY, setPanY] = useState(DEFAULTS.panY);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const [globalScale, setGlobalScale] = useState(DEFAULTS.globalScale);
  const [offsetX, setOffsetX] = useState(DEFAULTS.offsetX);
  const [offsetY, setOffsetY] = useState(DEFAULTS.offsetY);
  const [resetKey, setResetKey] = useState(0);
  const handleReset = () => {
    setPanY(DEFAULTS.panY);
    setZoom(DEFAULTS.zoom);
    setGlobalScale(DEFAULTS.globalScale);
    setOffsetX(DEFAULTS.offsetX);
    setOffsetY(DEFAULTS.offsetY);
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

      {/* Utility controls — top-left, used frequently */}
      <div className="top-left-strip">
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
            ? "◻\uFE0E"
            : meshMode === 1
              ? "◈\uFE0E"
              : meshMode === 2
                ? "◼\uFE0E"
                : meshMode === 3
                  ? "◇\uFE0E"
                  : meshMode === 4
                    ? "◎\uFE0E"
                    : "⬤\uFE0E"}
        </button>
        <button className="reset-btn" onClick={handleReset}>
          ↺
        </button>
      </div>

      {/* About — top-right, used infrequently */}
      <button
        ref={aboutRef}
        className="about-btn"
        onClick={() => setShowAbout(true)}
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
      >
        About
      </button>

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
