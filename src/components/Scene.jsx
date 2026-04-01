import { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OrganNode from "./OrganNode";
import SpinalCord from "./SpinalCord";
import LungVolume from "./LungVolume";
import AnatomyModel from "./AnatomyModel";
import BodyCirculation from "./BodyCirculation";
import { organs } from "../data/organs";

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];

const CIRC_OPACITY = { logic: 0.0, power: 1.0, unified: 0.65 };

// In power mode: power-category nodes are fully visible, others fade out.
// In logic mode: power-category nodes fade out, all others are full.
// In unified: everything at 0.7.
function getNodeOpacity(organ, viewMode) {
  if (viewMode === "power") return organ.category === "power" ? 1.0 : 0.06;
  if (viewMode === "logic") return organ.category === "power" ? 0.06 : 1.0;
  return 0.7;
}

function Scene({ onSelect, viewMode }) {
  const [hoveredOrganId, setHoveredOrganId] = useState(null);
  const heartbeatRef = useRef(0);

  const circOpacity = CIRC_OPACITY[viewMode] ?? 0.0;

  return (
    <Canvas
      camera={{ position: [0, 0.875, 2.5], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[2, 2.5, 2]} intensity={2} color="#00f5ff" />
      <pointLight position={[-3, 1.5, -2]} intensity={1} color="#bf00ff" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />

      <AnatomyModel viewMode={viewMode} />

      {/* Lung volumes */}
      <LungVolume
        position={LEFT_LUNG_POS}
        visible={hoveredOrganId === "left_lung"}
      />
      <LungVolume
        position={RIGHT_LUNG_POS}
        visible={hoveredOrganId === "right_lung"}
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
          />
        ) : (
          <OrganNode
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            onHover={setHoveredOrganId}
            nodeOpacity={getNodeOpacity(organ, viewMode)}
            pulseRef={organ.id === "heart" ? heartbeatRef : undefined}
          />
        ),
      )}

      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={1.2}
        maxDistance={7}
        target={[0, 0.9, 0]}
      />
    </Canvas>
  );
}

export default Scene;
