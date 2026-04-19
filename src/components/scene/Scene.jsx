import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneLights from "./SceneLights";
import OrganNode from "../organ/OrganNode";
import SpinalCord from "../spine/SpinalCord";
import LungVolume from "../LungVolume";
import AnatomyModel from "../AnatomyModel";
import BodyCirculation from "../BodyCirculation";
import NerveRoots from "../NerveRoots";
import NerveSystem from "../spine/NerveSystem";
import CameraController from "../CameraController";
import { organs } from "../../data/organs";

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
  selectedOrgan,
  viewMode,
  showNerves,
  darkMode,
  meshMode,
  brainZoom,
  setBrainZoom,
  panY,
  zoom,
  resetKey,
  modelPath,
  femaleMode,
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
                if (o.brainPosition) setBrainZoom(true);
              }}
              onHover={setHoveredOrganId}
              nodeOpacity={getNodeOpacity(organ, viewMode)}
              pulseRef={organ.id === "heart" ? heartbeatRef : undefined}
              breathingRef={
                organ.id === "left_lung" || organ.id === "right_lung"
                  ? breathingRef
                  : undefined
              }
              viewMode={viewMode}
              hoveredCategory={activeCategory}
              onCategoryHover={handleCategoryHover}
              brainZoom={brainZoom}
              darkMode={darkMode}
              previewedOrganId={previewedOrgan?.id}
              onPreview={handlePreview}
              onClearPreview={handleClearPreview}
            />
          ),
        )}
      </group>
      <CameraController
        brainZoom={brainZoom}
        controlsRef={controlsRef}
        panY={panY}
        zoom={zoom}
        resetKey={resetKey}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={1.2}
        minDistance={0.9}
        maxDistance={7}
        target={ORBIT_TARGET}
      />
    </Canvas>
  );
}

export default Scene;
