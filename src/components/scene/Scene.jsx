import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import SceneLights from "./SceneLights";
import OrganNode from "../organ/OrganNode";
import SpinalCord from "../spine/SpinalCord";
import LungVolume from "./effects/LungVolume";
import AnatomyModel from "../anatomy/AnatomyModel";
import BodyCirculation from "./effects/BodyCirculation";
import NerveRoots from "./effects/NerveRoots";
import NerveSystem from "../spine/NerveSystem";
import SpinalFibers from "../spine/SpinalFibers";
import CameraController from "./CameraController";
import BrainModel from "../brain/BrainModel";
import HeartModel from "../organs/HeartModel";
import LungsModel from "../organs/LungsModel";
import LiverModel from "../organs/LiverModel";
import KidneysModel from "../organs/KidneysModel";
import StomachModel from "../organs/StomachModel";
import IntestineModel from "../organs/IntestineModel";
import CellularView from "../brain/CellularView";
import NeuralActivity from "../brain/NeuralActivity";
import SceneOrbs from "./effects/SceneOrbs";
import MeridianLayer from "../organs/MeridianLayer";
import MeridianPaths from "../organs/MeridianPaths";
import { organs } from "../../data/organs";
import { IS_MOBILE } from "../../utils/device";

const ONYX_ORGAN_IDS = [
  "heart",
  "cerebellum",
  "thyroid",
  "liver",
  "stomach",
  "right_kidney",
  "left_kidney",
  "spleen",
  "bladder",
  "pancreas",
  "vocal_cords",
  "skin",
];

const CELL_ZOOM_IDS = new Set(["pituitary"]);

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];
const ORBIT_TARGET = [0, 0.85, 0];

// Aesthetic shrink applied to the entire female scene group so mesh, nodes, meridians,
// spine — everything — scales proportionally together. Sits on top of HEIGHT_SCALE 0.88
// (the real anatomical ratio) in female-config.js.
export const FEMALE_SCALE = 0.9224;

// Vertical lift added to offsetY when female mode is on — compensates for the fact
// that scaling from origin pulls the mesh downward. Tune to re-center visually.
export const FEMALE_Y_LIFT = 0.08;

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
  organFocusDistance,
  viewPanelOpen,
  bgMode,
  bgModeName,
  legendCategory,
  showMeridians,
  autoRotate,
  orbsEnabled,
  style,
}) {
  const [hoveredOrganId, setHoveredOrganId] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [previewedOrgan, setPreviewedOrgan] = useState(null);
  const activeCategory =
    hoveredCategory ??
    selectedOrgan?.category ??
    previewedOrgan?.category ??
    legendCategory ??
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

  const organWindowPositions = useMemo(() => {
    const positions = ONYX_ORGAN_IDS.map((id) => {
      const organ = organs.find((o) => o.id === id);
      if (!organ?.position) return [0, -100, 0];
      return [
        organ.position[0] * globalScale + offsetX,
        organ.position[1] * globalScale + offsetY,
        organ.position[2] * globalScale,
      ];
    });
    return positions;
  }, [globalScale, offsetX, offsetY]);
  const controlsRef = useRef();
  const handleSpineExtracted = useCallback((pts) => setSpinePoints(pts), []);
  const handleLandmarksExtracted = useCallback(
    (lm) => setBodyLandmarks(lm),
    [],
  );
  const handleCategoryHover = useCallback((cat) => setHoveredCategory(cat), []);
  const handlePreview = useCallback((organ) => setPreviewedOrgan(organ), []);
  const handleClearPreview = useCallback(() => setPreviewedOrgan(null), []);

  // Clear any lingering preview label when entering brain/cell zoom
  useEffect(() => {
    if (brainZoom || cellZoom) setPreviewedOrgan(null);
  }, [brainZoom, cellZoom]);

  const circOpacity = CIRC_OPACITY[viewMode] ?? 0.0;

  return (
    <Canvas
      camera={{ position: [0, 0.82, IS_MOBILE ? 1.9 : 2.1], fov: 48 }}
      style={{ width: "100%", height: "100%", ...style }}
      gl={{
        alpha: true,
        powerPreference: "high-performance",
        antialias: window.devicePixelRatio < 2,
      }}
      dpr={[1, window.innerWidth <= 768 ? 1 : 2]}
      performance={{ min: 0.4 }}
      onPointerMissed={() => handleClearPreview()}
    >
      <SceneLights darkMode={darkMode} meshMode={meshMode} />
      <BreathingDriver breathingRef={breathingRef} />
      <group
        scale={globalScale * (femaleMode ? FEMALE_SCALE : 1)}
        position={[offsetX, offsetY + (femaleMode ? FEMALE_Y_LIFT : 0), 0]}
      >
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
          organWindowPositions={organWindowPositions}
        />

        <HeartModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          heartbeatRef={heartbeatRef}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
        />

        <LungsModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          breathingRef={breathingRef}
          heartbeatRef={heartbeatRef}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
        />

        <KidneysModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
          onKidneyClick={() => {
            const kidney = organs.find((o) => o.id === "right_kidney");
            if (kidney) onSelect(kidney);
          }}
        />

        <LiverModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
        />

        <StomachModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
        />

        <IntestineModel
          meshMode={meshMode}
          viewMode={viewMode}
          hoveredOrganId={hoveredOrganId}
          femaleMode={femaleMode}
          selectedOrganId={selectedOrgan?.id}
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
              bioFunction: node.bioFunction,
              hardFunction: node.hardFunction,
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
              legendCategory={legendCategory}
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
              legendCategory={legendCategory}
              showMeridians={showMeridians}
            />
          ),
        )}
        {showMeridians && (
          <MeridianLayer scale={globalScale} bodyLandmarks={bodyLandmarks} />
        )}
        {showMeridians && <MeridianPaths bodyLandmarks={bodyLandmarks} />}
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
        organFocusDistance={organFocusDistance}
        viewPanelOpen={viewPanelOpen}
        femaleMode={femaleMode}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={0.7}
        maxDistance={6}
        target={ORBIT_TARGET}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
      {orbsEnabled && bgMode > 0 && bgMode <= 4 && (
        <SceneOrbs theme={bgModeName} />
      )}
    </Canvas>
  );
}

export default Scene;
