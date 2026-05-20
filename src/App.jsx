import { useState, useRef, useCallback, useEffect } from "react";
import "./App.scss";
import Scene from "./components/scene/Scene";
import LandingOverlay from "./components/landing/LandingOverlay";
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
    ? { panY: 0.48, zoom: 0.22, globalScale: 0.906, offsetX: 0, offsetY: 0.1 }
    : { panY: 0.48, zoom: 0.22, globalScale: 0.948, offsetX: 0, offsetY: 0.11 }
  : { panY: 0.5, zoom: 0.33, globalScale: 0.927, offsetX: 0, offsetY: 0.11 };

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [organFocusY, setOrganFocusY] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showMeridians, setShowMeridians] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bgMode, setBgMode] = useState(0);
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  const BG_MODES = [
    "default",
    "nebula",
    "space",
    "sunset",
    "matrix",
    "wave",
    "grid",
    "pulse",
  ];
  const BG_ICONS = [
    "⬡\uFE0E",
    "✵\uFE0E",
    "✦\uFE0E",
    "◐\uFE0E",
    "⊞\uFE0E",
    "≋\uFE0E",
    "⊟\uFE0E",
    "◎\uFE0E",
  ];
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
  const [showTopNav, setShowTopNav] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [legendCategory, setLegendCategory] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [showLanding, setShowLanding] = useState(true);
  const handleReset = () => {
    setBrainZoom(false);
    setCellZoom(false);
    setPanY(DEFAULTS.panY);
    setZoom(DEFAULTS.zoom);
    setGlobalScale(DEFAULTS.globalScale);
    setOffsetX(DEFAULTS.offsetX);
    setOffsetY(DEFAULTS.offsetY);
    setResetKey((k) => k + 1);
  };
  const aboutRef = useRef(null);
  const bgPickerRef = useRef(null);

  useEffect(() => {
    if (!bgPanelOpen) return;
    const handler = (e) => {
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target))
        setBgPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bgPanelOpen]);

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
    // When entering dark mode, silver/aluminum light-mode skin (modes > 2 light-only) don't apply
    // Reset to solid obsidian (2) only if currently on a mode with no dark-mode branch (none currently)
    // — no reset needed, all modes have dark branches now
  }, [darkMode]);

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
      className={`app app--${bodyModel}${darkMode ? " app--dark" : ""}${bodyModel === "female" ? " app--female" : ""}${bgMode > 0 ? ` app--bg-${BG_MODES[bgMode]}` : ""}`}
    >
      <header className="app-header">
        <div className="header-strip">
          <div className="header-accent header-accent--top">
            <button
              className={`header-nav-trigger${showTopNav ? " header-nav-trigger--open" : ""}`}
              onClick={() => setShowTopNav((v) => !v)}
            >
              {showTopNav ? "✕" : "⊞︎"}
            </button>
          </div>
          <div className="header-panel">
            <h1>Pneumata</h1>
            <p>Analogical Anatomy</p>
            <div className="header-panel__actions">
              <button
                ref={aboutRef}
                className="about-btn"
                onClick={() => setShowAbout(true)}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                Info
              </button>
              {!showAnimation && (
                <VerticalControls
                  panY={panY}
                  onPanChange={setPanY}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  offsetX={offsetX}
                  onOffsetXChange={setOffsetX}
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>
          <div className="header-accent header-accent--bottom" />
        </div>
      </header>

      {/* Utility controls — dropdown from header-accent trigger */}
      <div className="top-left-strip">
        <div
          className={`top-nav-drawer${showTopNav ? " top-nav-drawer--open" : ""}${bgPanelOpen ? " top-nav-drawer--picker-open" : ""}`}
        >
          <button
            className={`mesh-toggle-btn mesh-toggle-btn--${meshMode}`}
            onClick={() =>
              setMeshMode((m) => {
                if (darkMode) {
                  return { 2: 0, 0: 1, 1: 3, 3: 4, 4: 6, 6: 2 }[m] ?? 2;
                }
                return m === 4 ? 6 : m === 6 ? 0 : (m + 1) % 6;
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
                      : "⬛\uFE0E"}
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
          <button
            className={`bg-toggle-btn${bgMode > 0 ? " bg-toggle-btn--active" : ""}`}
            onClick={() => setBgMode((m) => (m + 1) % BG_MODES.length)}
            title={`Background: ${BG_MODES[bgMode]}`}
          >
            {BG_ICONS[bgMode]}
          </button>
          <button
            className={`meridian-toggle-btn${showMeridians ? " meridian-toggle-btn--active" : ""}`}
            onClick={() => setShowMeridians((v) => !v)}
            title="Meridian points"
          >
            ☯︎
          </button>
        </div>
      </div>

      {showAnimation ? (
        <AnimatedScene darkMode={darkMode} meshMode={meshMode} />
      ) : (
        <Scene
          globalScale={globalScale}
          offsetX={offsetX}
          offsetY={offsetY + -0.02}
          style={showLanding ? { pointerEvents: "none" } : undefined}
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
          onFocus={(organ) => {
            // Camera zoom only — no modal
            if (
              organ &&
              !organ.brainPosition &&
              organ.type !== "line" &&
              organ.position
            ) {
              setOrganFocusY(organ.position[1] * globalScale + offsetY);
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
          bgMode={bgMode}
          bgModeName={BG_MODES[bgMode]}
          legendCategory={legendCategory}
          showMeridians={showMeridians}
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

      {!showAnimation && <CategoryLegend onCategoryHover={setLegendCategory} />}

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

      <div className="dark-capsule">
        <button
          className={`dark-capsule__opt${!darkMode ? " dark-capsule__opt--active" : ""}`}
          onClick={() => setDarkMode(false)}
        >
          ☾
        </button>
        <button
          className={`dark-capsule__opt${darkMode ? " dark-capsule__opt--active" : ""}`}
          onClick={() => setDarkMode(true)}
        >
          ✦
        </button>
      </div>

      <p className="app-copyright">© 2026 Pablo Cordero</p>

      {showLanding && <LandingOverlay onEnter={() => setShowLanding(false)} />}
    </div>
  );
}

export default App;
