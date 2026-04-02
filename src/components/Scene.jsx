import { useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OrganNode from "./OrganNode";
import SpinalCord from "./SpinalCord";
import LungVolume from "./LungVolume";
import AnatomyModel from "./AnatomyModel";
import BodyCirculation from "./BodyCirculation";
import { organs } from "../data/organs";

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];

const CIRC_OPACITY = { logic: 0.0, power: 1.0, breathing: 0.0, unified: 0.65 };

// In power mode: power-category nodes are fully visible, others fade out.
// In logic mode: power-category nodes fade out, all others are full.
// In breathing mode: only lung nodes visible, everything else fades out.
// In unified: everything at 0.7.
function getNodeOpacity(organ, viewMode) {
  if (viewMode === "power") return organ.category === "power" ? 1.0 : 0.06;
  if (viewMode === "logic") return organ.category === "power" ? 0.06 : 1.0;
  if (viewMode === "breathing")
    return organ.id === "left_lung" || organ.id === "right_lung" ? 1.0 : 0.06;
  return 0.7;
}

// Drives breathingRef inside Canvas context — 0.25Hz normalized 0→1
function BreathingDriver({ breathingRef }) {
  useFrame((state) => {
    breathingRef.current =
      (Math.sin(state.clock.getElapsedTime() * Math.PI * 0.5) + 1) / 2;
  });
  return null;
}

function Scene({ onSelect, viewMode }) {
  const [hoveredOrganId, setHoveredOrganId] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [spinePoints, setSpinePoints] = useState(null);
  const heartbeatRef = useRef(0);
  const breathingRef = useRef(0);
  const handleSpineExtracted = useCallback((pts) => setSpinePoints(pts), []);
  const handleCategoryHover = useCallback((cat) => setHoveredCategory(cat), []);

  const circOpacity = CIRC_OPACITY[viewMode] ?? 0.0;

  return (
    <Canvas
      camera={{ position: [0, 0.875, 2.5], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true }}
    >
      <BreathingDriver breathingRef={breathingRef} />
      <ambientLight intensity={0.15} />
      <pointLight position={[2, 2.5, 2]} intensity={2} color="#00f5ff" />
      <pointLight position={[-3, 1.5, -2]} intensity={1} color="#bf00ff" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />

      <AnatomyModel
        viewMode={viewMode}
        onSpineExtracted={handleSpineExtracted}
        heartbeatRef={heartbeatRef}
        breathingRef={breathingRef}
      />

      {/* Lung volumes */}
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

      {/* Circulatory layer */}
      <BodyCirculation opacity={circOpacity} heartbeatRef={heartbeatRef} />

      {/* Organ nodes */}
      {organs.map((organ) =>
        organ.type === "line" ? (
          <SpinalCord
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            nodeOpacity={getNodeOpacity(organ, viewMode)}
            dynamicPoints={spinePoints}
            hoveredCategory={hoveredCategory}
            onCategoryHover={handleCategoryHover}
          />
        ) : (
          <OrganNode
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            onHover={setHoveredOrganId}
            nodeOpacity={getNodeOpacity(organ, viewMode)}
            pulseRef={organ.id === "heart" ? heartbeatRef : undefined}
            breathingRef={
              organ.id === "left_lung" || organ.id === "right_lung"
                ? breathingRef
                : undefined
            }
            viewMode={viewMode}
            hoveredCategory={hoveredCategory}
            onCategoryHover={handleCategoryHover}
          />
        ),
      )}

      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        minDistance={1.2}
        maxDistance={7}
        target={[0, 0.9, 0]}
      />
    </Canvas>
  );
}

export default Scene;
