import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneLights from "./SceneLights";
import OrganNode from "../organ/OrganNode";
import SpinalCord from "../spine/SpinalCord";
import LungVolume from "../LungVolume";
import AnatomyModel from "../anatomy/AnatomyModel";
import BodyCirculation from "../BodyCirculation";
import NerveRoots from "../NerveRoots";
import NerveSystem from "../spine/NerveSystem";
import SpinalFibers from "../spine/SpinalFibers";
import CameraController from "../CameraController";
import BrainModel from "../brain/BrainModel";
import HeartModel from "../heart/HeartModel";
import CellularView from "../brain/CellularView";
import NeuralActivity from "../brain/NeuralActivity";
import SceneOrbs from "./SceneOrbs";
import { organs } from "../../data/organs";

const CELL_ZOOM_IDS = new Set(["pituitary"]);

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];
const ORBIT_TARGET = [0, 0.85, 0];

export const FEMALE_SCALE = 0.88;

const CIRC_OPACITY = { logic: 0.0, power: 1.0, breathing: 0.0, unified: 0.65 };

function getNodeOpacity(organ, viewMode) {
  if (viewMode === "power") return organ.category === "power" ? 1.0 : 0.06;
  if (viewMode === "logic") return organ.category === "power" ? 0.35 : 1.0;
  if (viewMode === "breathing")
    return organ.id === "left_lung" || organ.id === "right_lung" ? 1.0 : 0.06;
  return 0.7;
}

function BreathingDriver({ breathingRef }) {
  useFrame((state) => {
    breathingRef.current =
      (Math.sin(state.clock.getElapsedTime() * Math.PI * 0.5) + 1) / 2;
  });
  return null;
}

function Scene({
  globalScale,
  offsetX,
  offsetY,
  onSelect,
  onFocus,
  selectedOrgan,
  viewMode,
  showNerves,
  darkMode,
  meshMode,
  brainZoom,
  setBrainZoom,
  cellZoom,
  setCellZoom,
  panY,
  zoom,
  resetKey,
  modelPath,
  femaleMode,
  organFocusY,
  viewPanelOpen,
  bgMode,
  bgModeName,
}) {
  const [hoveredOrganId, setHoveredOrganId] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [previewedOrgan, setPreviewedOrgan] = useState(null);
  const activeCategory =
    hoveredCategory ??
    selectedOrgan?.category ??
    previewedOrgan?.category ??
    null;
  const [spinePoints, setSpinePoints] = useState(null);
  const [bodyLandmarks, setBodyLandmarks] = useState(null);
  const [cellTarget, setCellTarget] = useState(null);

  useEffect(() => {
    setSpinePoints(null);
    setBodyLandmarks(null);
  }, [modelPath]);

  const heartbeatRef = useRef(0);
  const breathingRef = useRef(0);
  const controlsRef = useRef();
  const handleSpineExtracted = useCallback((pts) => setSpinePoints(pts), []);
  const handleLandmarksExtracted = useCallback(
    (lm) => setBodyLandmarks(lm),
    [],
  );
  const handleCategoryHover = useCallback((cat) => setHoveredCategory(cat), []);
  const handlePreview = useCallback((organ) => setPreviewedOrgan(organ), []);
  const handleClearPreview = useCallback(() => setPreviewedOrgan(null), []);

  const circOpacity = CIRC_OPACITY[viewMode] ?? 0.0;

  return (
    <Canvas
      camera={{ position: [0, 0.82, 2.1], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
      gl={{
        alpha: true,
        powerPreference: "high-performance",
        antialias: window.devicePixelRatio < 2,
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      onPointerMissed={() => handleClearPreview()}
    >
      <SceneLights
        darkMode={darkMode}
        meshMode={meshMode}
        femaleMode={femaleMode}
      />
      <BreathingDriver breathingRef={breathingRef} />
      <group scale={globalScale} position={[offsetX, offsetY, 0]}>
        <AnatomyModel
          key={modelPath}
          modelPath={modelPath}
          viewMode={viewMode}
          onSpineExtracted={handleSpineExtracted}
          onLandmarksExtracted={handleLandmarksExtracted}
          heartbeatRef={heartbeatRef}
          breathingRef={breathingRef}
          darkMode={darkMode}
          meshMode={meshMode}
          femaleMode={femaleMode}
        />

        <HeartModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          heartbeatRef={heartbeatRef}
        />

        <BrainModel
          meshMode={meshMode}
          brainZoom={brainZoom}
          cellZoom={cellZoom}
          darkMode={darkMode}
          femaleMode={femaleMode}
          onBrainClick={() => setBrainZoom(true)}
        />

        <NeuralActivity
          brainZoom={brainZoom}
          cellZoom={cellZoom}
          femaleMode={femaleMode}
        />
        <CellularView
          brainZoom={brainZoom}
          cellZoom={cellZoom}
          darkMode={darkMode}
          meshMode={meshMode}
          femaleMode={femaleMode}
          onCellZoom={() => setCellZoom(true)}
          onCellSelect={(node) =>
            onSelect({
              id: node.id,
              organ: node.organ ?? node.label,
              hardware: node.hardware,
              bio_function: node.bio_function,
              hard_function: node.hard_function,
              synthesis: node.synthesis,
            })
          }
        />

        <LungVolume
          position={LEFT_LUNG_POS}
          visible={hoveredOrganId === "left_lung"}
          breathingRef={breathingRef}
          viewMode={viewMode}
        />
        <LungVolume
          position={RIGHT_LUNG_POS}
          visible={hoveredOrganId === "right_lung"}
          breathingRef={breathingRef}
          viewMode={viewMode}
        />

        <BodyCirculation opacity={circOpacity} heartbeatRef={heartbeatRef} />

        <NerveRoots
          spinePoints={spinePoints}
          hoveredCategory={activeCategory}
          viewMode={viewMode}
          showNerves={showNerves}
        />

        <SpinalFibers spinePoints={spinePoints} viewMode={viewMode} />

        <NerveSystem
          spinePoints={spinePoints}
          bodyLandmarks={bodyLandmarks}
          viewMode={viewMode}
          hoveredCategory={activeCategory}
          showNerves={showNerves}
        />

        {organs.map((organ) =>
          organ.type === "line" ? (
            <SpinalCord
              key={organ.id}
              organ={organ}
              darkMode={darkMode}
              meshMode={meshMode}
              onSelect={onSelect}
              nodeOpacity={getNodeOpacity(organ, viewMode)}
              dynamicPoints={spinePoints}
              hoveredCategory={activeCategory}
              onCategoryHover={handleCategoryHover}
            />
          ) : (
            <OrganNode
              key={organ.id}
              organ={organ}
              femaleMode={femaleMode}
              onSelect={(o) => {
                onSelect(o);
                if (o.brainPosition) {
                  if (brainZoom && CELL_ZOOM_IDS.has(o.id)) setCellZoom(true);
                  else setBrainZoom(true);
                }
              }}
              onHover={setHoveredOrganId}
              nodeOpacity={getNodeOpacity(organ, viewMode)}
              pulseRef={organ.id === "heart" ? heartbeatRef : undefined}
              breathingRef={
                organ.id === "left_lung" ||
                organ.id === "right_lung" ||
                organ.id === "consciousness"
                  ? breathingRef
                  : undefined
              }
              viewMode={viewMode}
              hoveredCategory={activeCategory}
              onCategoryHover={handleCategoryHover}
              brainZoom={brainZoom}
              cellZoom={cellZoom}
              darkMode={darkMode}
              selectedOrganId={selectedOrgan?.id}
              previewedOrganId={previewedOrgan?.id}
              onFocus={onFocus}
              onPreview={handlePreview}
              onClearPreview={handleClearPreview}
            />
          ),
        )}
      </group>
      <CameraController
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        cellTarget={cellTarget}
        controlsRef={controlsRef}
        panY={panY}
        zoom={zoom}
        resetKey={resetKey}
        organFocusY={organFocusY}
        viewPanelOpen={viewPanelOpen}
        femaleMode={femaleMode}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={0.9}
        maxDistance={7}
        target={ORBIT_TARGET}
      />
      {bgMode > 0 && <SceneOrbs theme={bgModeName} />}
    </Canvas>
  );
}

export default Scene;
