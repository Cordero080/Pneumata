import { useState, useRef, useCallback, useEffect } from "react";
import Scene from "./components/scene/Scene";
import GlassModal from "./components/GlassModal";
import AboutModal from "./components/AboutModal";
import CategoryLegend from "./components/CategoryLegend";
import ViewModeController from "./components/ViewModeController";

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showNerves, setShowNerves] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [meshMode, setMeshMode] = useState(2); // 0=ghost, 1=semi-transparent silver, 2=solid silver
  const [brainZoom, setBrainZoom] = useState(false);
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
              // dark: solid(2)→ghost(0)→semi(1)→white(3)→semi-silver(4)→solid-silver(5)→solid(2)
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

      <Scene
        onSelect={setSelectedOrgan}
        viewMode={viewMode}
        showNerves={showNerves}
        darkMode={darkMode}
        meshMode={meshMode}
        brainZoom={brainZoom}
        setBrainZoom={setBrainZoom}
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
