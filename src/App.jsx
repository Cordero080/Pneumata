import { useState, useRef, useCallback } from "react";
import Scene from "./components/Scene";
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
  const aboutRef = useRef(null);

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

      <Scene
        onSelect={setSelectedOrgan}
        viewMode={viewMode}
        showNerves={showNerves}
        darkMode={darkMode}
      />

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
