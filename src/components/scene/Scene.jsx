import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import * as maleConfig from "../anatomy/male/male-config";
import * as femaleConfig from "../anatomy/female/female-config";
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

// Camera-to-target distance thresholds at which the brain's neural sparks fade
// in — so approaching the head isn't barren before full brain zoom. Driven by
// the ACTUAL camera distance (not the zoom slider), so pinch-zoom, scroll, and
// the slider all trigger it. Hysteresis (enter closer than exit) prevents
// flicker at the boundary. Default full-body distance is ≈2.1.
const NEURAL_PREVIEW_ENTER = 1.7; // zoomed in ~20% → sparks appear
const NEURAL_PREVIEW_EXIT = 1.9; // must pull back past this to hide them

// Watches the live camera distance to the orbit target and flips a boolean when
// it crosses the preview thresholds. A component (not a prop check) because the
// distance changes every frame via any input — pinch, scroll, or slider.
function ZoomWatcher({ controlsRef, onChange }) {
  const { camera } = useThree();
  const active = useRef(false);
  const fallback = useRef(new THREE.Vector3(...ORBIT_TARGET));
  useFrame(() => {
    const target = controlsRef.current?.target ?? fallback.current;
    const d = camera.position.distanceTo(target);
    const next = active.current
      ? d < NEURAL_PREVIEW_EXIT
      : d < NEURAL_PREVIEW_ENTER;
    if (next !== active.current) {
      active.current = next;
      onChange(next);
    }
  });
  return null;
}

// Brain nodes whose click ONLY opens their modal — never triggers brain/cell
// zoom or a camera move. The pituitary was both a brain node and a cell-zoom
// target, so its click lurched the camera (Back button, wrong Y) instead of
// reliably showing its modal.
const MODAL_ONLY_IDS = new Set(["pituitary"]);

// Organ nodes that, when clicked while already in brain-zoom, drill further
// into the cellular view. Was ["pituitary"], but that made a pituitary click
// fire setCellZoom on the SAME click that opens its modal — the two fought,
// and the camera lurched into the cellular "throat" view (Back button) instead
// of showing the modal. Emptied so a pituitary click just opens its modal like
// every other node. The cellular view is still reachable by clicking the
// neuron cell meshes directly (CellularView → onCellZoom).
const CELL_ZOOM_IDS = new Set();

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];
const ORBIT_TARGET = [0, 0.85, 0];

// The whole-figure scale + vertical lift now live per-sex in the config files
// (male-config.js / female-config.js → FIGURE_SCALE / FIGURE_Y_LIFT), so each
// figure's overall size is edited alongside its other settings. This applies it
// to the parent group that holds the mesh, nodes, organs, and meridians, so
// they all scale together and stay locked in place.

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
  showQi,
  autoRotate,
  orbsEnabled,
  style,
}) {
  // Per-sex figure config — supplies FIGURE_SCALE / FIGURE_Y_LIFT for the whole
  // assembly's overall size (edit those in male-config.js / female-config.js).
  const figureConfig = femaleMode ? femaleConfig : maleConfig;
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
  // True once the camera is zoomed in close enough to show the brain's neural
  // sparks (driven by ZoomWatcher off the live camera distance — pinch/scroll/slider).
  const [neuralPreview, setNeuralPreview] = useState(false);

  // Adaptive resolution. Desktop starts crisp (up to 2×); mobile is capped at
  // 1.5× — NOT 2×. A phone reporting devicePixelRatio 3 rendering at 2× draws
  // 4× the pixels of the old fixed dpr=1, which tanked the framerate; 1.5× is
  // ~2.25× (still sharper than the old 1×, but affordable). PerformanceMonitor
  // then drops toward 1 if the framerate still can't hold, and `flipflops`
  // makes it SETTLE at a floor after a few adjustments instead of oscillating
  // between two values (which reads as periodic jank).
  const deviceDpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const MAX_DPR = Math.min(deviceDpr, IS_MOBILE ? 1.5 : 2);
  const MIN_DPR = 1;
  const [dpr, setDpr] = useState(MAX_DPR);

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
      dpr={dpr}
      performance={{ min: 0.4 }}
      onPointerMissed={() => handleClearPreview()}
    >
      {/* Drop resolution if fps sags, raise it back when there's headroom, but
          settle instead of oscillate: after a few flips, `flipflops` locks it
          via onFallback to the low bound so the user isn't shown periodic
          resolution swings (which read as recurring jank). */}
      <PerformanceMonitor
        factor={1}
        flipflops={3}
        onFallback={() => setDpr(MIN_DPR)}
        onDecline={() => setDpr((d) => Math.max(MIN_DPR, d - 0.5))}
        onIncline={() => setDpr((d) => Math.min(MAX_DPR, d + 0.5))}
      />
      <ZoomWatcher controlsRef={controlsRef} onChange={setNeuralPreview} />
      <SceneLights darkMode={darkMode} meshMode={meshMode} />
      <BreathingDriver breathingRef={breathingRef} />
      <group
        scale={globalScale * figureConfig.FIGURE_SCALE}
        position={[offsetX, offsetY + figureConfig.FIGURE_Y_LIFT, 0]}
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

        {/* Neural sparks (the "synapses") mount a bit before full brain zoom —
            once the camera has zoomed in past NEURAL_PREVIEW_ZOOM (≈20% closer
            than the default), so approaching the head doesn't look barren. They
            stay off in the default full-body view (perf). */}
        {(brainZoom || cellZoom || neuralPreview) && (
          <NeuralActivity
            brainZoom={brainZoom}
            cellZoom={cellZoom}
            femaleMode={femaleMode}
          />
        )}

        {/* Cellular neurons are the heavy layer (5 GLBs) and only meaningful at
            the brain close-up, so they stay deferred to actual brain/cell zoom.
            GLBs are preloaded, so the ~1s camera move masks the mount. */}
        {(brainZoom || cellZoom) && (
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
        )}

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
              showQi={showQi && showMeridians}
            />
          ) : (
            <OrganNode
              key={organ.id}
              organ={organ}
              femaleMode={femaleMode}
              onSelect={(o) => {
                onSelect(o);
                // MODAL_ONLY_IDS (pituitary) always just open their modal — no
                // brain/cell zoom, no camera move, no Back button — from any
                // perspective. Its dual role (brain node + cell-zoom target)
                // made clicks lurch the camera instead of showing the modal.
                if (o.brainPosition && !MODAL_ONLY_IDS.has(o.id)) {
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
          <MeridianLayer
            scale={globalScale}
            bodyLandmarks={bodyLandmarks}
            femaleMode={femaleMode}
            showQi={showQi}
          />
        )}
        {showMeridians && (
          <MeridianPaths
            bodyLandmarks={bodyLandmarks}
            femaleMode={femaleMode}
            showQi={showQi}
          />
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
        organFocusDistance={organFocusDistance}
        viewPanelOpen={viewPanelOpen}
        femaleMode={femaleMode}
      />
      <OrbitControls
        ref={controlsRef}
        // Freeze user manipulation (rotate/zoom/pan) while a modal is open so
        // the body doesn't move under the reader; re-enabled on close. Only the
        // input flags are gated — programmatic camera moves (CameraController's
        // ctrl.update) and autoRotate are unaffected, so organ-focus still works.
        enableRotate={!selectedOrgan}
        enableZoom={!selectedOrgan}
        enablePan={!selectedOrgan}
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
