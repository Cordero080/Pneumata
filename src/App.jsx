import { useState } from "react";
import Scene from "./components/Scene";
import GlassModal from "./components/GlassModal";
import CategoryLegend from "./components/CategoryLegend";
import ViewModeController from "./components/ViewModeController";

function App() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [viewMode, setViewMode] = useState("logic");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pneumata</h1>
        <p>Analogical Anatomy</p>
      </header>

      <Scene onSelect={setSelectedOrgan} viewMode={viewMode} />

      <GlassModal
        organ={selectedOrgan}
        onClose={() => setSelectedOrgan(null)}
      />

      <CategoryLegend />

      <ViewModeController viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default App;
