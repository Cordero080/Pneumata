import { useState } from "react";
import Scene from "./components/Scene";
import GlassModal from "./components/GlassModal";
import AboutModal from "./components/AboutModal";
import CategoryLegend from "./components/CategoryLegend";
import ViewModeController from "./components/ViewModeController";

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [viewMode, setViewMode] = useState("logic");
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pneumata</h1>
        <p>Analogical Anatomy</p>
      </header>

      <button className="about-btn" onClick={() => setShowAbout(true)}>
        About
      </button>

      <Scene onSelect={setSelectedOrgan} viewMode={viewMode} />

      <GlassModal
        organ={selectedOrgan}
        onClose={() => setSelectedOrgan(null)}
      />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <CategoryLegend />

      <ViewModeController viewMode={viewMode} setViewMode={setViewMode} />

      <p className="app-copyright">© 2026 Pablo Cordero</p>
    </div>
  );
}

export default App;
