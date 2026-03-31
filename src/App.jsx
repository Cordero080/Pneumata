import { useState } from "react";
import Scene from "./components/Scene";
import GlassModal from "./components/GlassModal";
import CategoryLegend from "./components/CategoryLegend";

function App() {
  // selectedOrgan is null when no modal is open, or an organ object when one is clicked
  const [selectedOrgan, setSelectedOrgan] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pneumata</h1>
        <p>Analogical Anatomy</p>
      </header>

      {/* The full-screen 3D canvas */}
      <Scene onSelect={setSelectedOrgan} />

      {/* Modal — only renders when an organ is selected */}
      <GlassModal
        organ={selectedOrgan}
        onClose={() => setSelectedOrgan(null)}
      />

      <CategoryLegend />

      <p className="scene-hint">Drag to orbit · Click a node to explore</p>
    </div>
  );
}

export default App;
