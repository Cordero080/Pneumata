import { useState, useRef, useCallback, useEffect } from "react";
import "./App.scss";
import Scene from "./components/scene/Scene";
import AnimatedScene from "./components/scene/AnimatedScene";
import GlassModal from "./components/modal/GlassModal";
import AboutModal from "./components/about/AboutModal";
import CategoryLegend from "./components/legend/CategoryLegend";
import ViewModeController from "./components/view-controller/ViewModeController";
import VerticalControls from "./components/controls/VerticalControls";

// Defaults differ by device and display context
const IS_MOBILE = window.innerWidth <= 768;
// Standalone (PWA / Add to Home Screen) has no browser chrome, so the canvas
// is taller — use slightly smaller scale and less Y offset to compensate.
const IS_STANDALONE =
  window.navigator.standalone === true ||
  window.matchMedia("(display-mode: standalone)").matches;
const DEFAULTS = IS_MOBILE
  ? IS_STANDALONE
    ? { panY: 0.48, zoom: 0.22, globalScale: 0.906, offsetX: 0, offsetY: 0.17 }
    : { panY: 0.48, zoom: 0.22, globalScale: 0.948, offsetX: 0, offsetY: 0.18 }
  : { panY: 0.5, zoom: 0.33, globalScale: 0.927, offsetX: 0, offsetY: 0.12 };

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [organFocusY, setOrganFocusY] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [meshMode, setMeshMode] = useState(2); // 0=ghost, 1=semi-transparent silver, 2=solid silver
  const [bodyModel, setBodyModel] = useState("male");
  const modelPath =
    bodyModel === "male" ? "/male-body.glb" : "/female-body.glb";
  const [brainZoom, setBrainZoom] = useState(false);
  const [cellZoom, setCellZoom] = useState(false);
  const [panY, setPanY] = useState(DEFAULTS.panY);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const [globalScale, setGlobalScale] = useState(DEFAULTS.globalScale);
  const [offsetX, setOffsetX] = useState(DEFAULTS.offsetX);
  const [offsetY, setOffsetY] = useState(DEFAULTS.offsetY);
  const [showAnimation, setShowAnimation] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
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
      if (e.key === "Escape") {
        if (cellZoom) setCellZoom(false);
        else if (brainZoom) setBrainZoom(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [brainZoom, cellZoom]);

  useEffect(() => {
    document.body.classList.toggle("body--female", bodyModel === "female");
    // Reset transform values to defaults so female scale/offset doesn't bleed into male view
    setPanY(DEFAULTS.panY);
    setZoom(DEFAULTS.zoom);
    setGlobalScale(DEFAULTS.globalScale);
    setOffsetX(DEFAULTS.offsetX);
    setOffsetY(DEFAULTS.offsetY);
    setResetKey((k) => k + 1);
    return () => document.body.classList.remove("body--female");
  }, [bodyModel]);

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
    <div
      className={`app app--${bodyModel}${darkMode ? " app--dark" : ""}${bodyModel === "female" ? " app--female" : ""}`}
    >
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
        <button
          className={`body-toggle-btn${bodyModel === "female" ? " body-toggle-btn--active" : ""}`}
          onClick={() => {
            setBodyModel((m) => (m === "male" ? "female" : "male"));
            handleReset();
          }}
        >
          {bodyModel === "male" ? "♂\uFE0E" : "♀\uFE0E"}
        </button>
        <button
          className={`anim-toggle-btn${showAnimation ? " anim-toggle-btn--active" : ""}`}
          onClick={() => setShowAnimation((v) => !v)}
        >
          {showAnimation ? "✕" : "▶"}
        </button>
      </div>

      {/* About + Adjust — top-right stack */}
      <div className="top-right-stack">
        <button
          ref={aboutRef}
          className="about-btn"
          onClick={() => setShowAbout(true)}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          About
        </button>
        {!showAnimation && (
          <VerticalControls
            panY={panY}
            onPanChange={setPanY}
            zoom={zoom}
            onZoomChange={setZoom}
            offsetX={offsetX}
            onOffsetXChange={setOffsetX}
          />
        )}
      </div>

      {showAnimation ? (
        <AnimatedScene darkMode={darkMode} meshMode={meshMode} />
      ) : (
        <Scene
          globalScale={globalScale}
          offsetX={offsetX}
          offsetY={
            offsetY +
            (viewPanelOpen ? (bodyModel === "female" ? 0.09 : 0.06) : -0.02)
          }
          onSelect={(organ) => {
            setSelectedOrgan(organ);
            if (
              organ &&
              !organ.brainPosition &&
              organ.type !== "line" &&
              organ.position
            ) {
              setOrganFocusY(organ.position[1] * globalScale + offsetY);
            } else {
              setOrganFocusY(null);
            }
          }}
          selectedOrgan={selectedOrgan}
          viewMode={viewMode}
          showNerves={showNerves}
          darkMode={darkMode}
          meshMode={meshMode}
          brainZoom={brainZoom}
          setBrainZoom={setBrainZoom}
          cellZoom={cellZoom}
          setCellZoom={setCellZoom}
          panY={panY}
          zoom={zoom}
          resetKey={resetKey}
          modelPath={modelPath}
          femaleMode={bodyModel === "female"}
          organFocusY={organFocusY}
          viewPanelOpen={viewPanelOpen}
        />
      )}

      {(brainZoom || cellZoom) && (
        <button
          className="brain-back-btn"
          onClick={() => {
            if (cellZoom) setCellZoom(false);
            else setBrainZoom(false);
            handleReset();
          }}
        >
          ← Back
        </button>
      )}

      <GlassModal
        organ={selectedOrgan}
        onClose={() => {
          setSelectedOrgan(null);
          setOrganFocusY(null);
        }}
      />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {!showAnimation && <CategoryLegend />}

      {!showAnimation && (
        <ViewModeController
          viewMode={viewMode}
          setViewMode={setViewMode}
          showNerves={showNerves}
          setShowNerves={setShowNerves}
          open={viewPanelOpen}
          onToggle={setViewPanelOpen}
        />
      )}

      <p className="app-copyright">© 2026 Pablo Cordero</p>
    </div>
  );
}

export default App;
