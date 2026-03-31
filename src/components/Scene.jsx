import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OrganNode from "./OrganNode";
import SpinalCord from "./SpinalCord";
import LungVolume from "./LungVolume";
import AnatomyModel from "./AnatomyModel";
import AortaLine from "./AortaLine";
import { organs } from "../data/organs";

const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];

// Opacity values per viewMode
const NODE_OPACITY = { logic: 1.0, power: 0.08, unified: 0.7 };
const CIRC_OPACITY = { logic: 0.0, power: 1.0, unified: 0.65 };

function Scene({ onSelect, viewMode }) {
  const [hoveredOrganId, setHoveredOrganId] = useState(null);

  const nodeOpacity = NODE_OPACITY[viewMode] ?? 1.0;
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

      <AnatomyModel />

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
      <AortaLine opacity={circOpacity} />

      {/* Organ nodes */}
      {organs.map((organ) =>
        organ.type === "line" ? (
          <SpinalCord
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            nodeOpacity={nodeOpacity}
          />
        ) : (
          <OrganNode
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            onHover={setHoveredOrganId}
            nodeOpacity={nodeOpacity}
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
