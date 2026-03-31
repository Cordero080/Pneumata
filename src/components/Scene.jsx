import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OrganNode from "./OrganNode";
import SpinalCord from "./SpinalCord";
import LungVolume from "./LungVolume";
import AnatomyModel from "./AnatomyModel";
import { organs } from "../data/organs";

// Lung node positions for the volume geometry (must match organs.js)
const LEFT_LUNG_POS = [-0.12, 1.22, 0.05];
const RIGHT_LUNG_POS = [0.12, 1.22, 0.05];

function Scene({ onSelect }) {
  // Track which organ is hovered so lung volumes can react
  const [hoveredOrganId, setHoveredOrganId] = useState(null);

  return (
    <Canvas
      camera={{ position: [0, 0.875, 3.5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[2, 2.5, 2]} intensity={2} color="#00f5ff" />
      <pointLight position={[-3, 1.5, -2]} intensity={1} color="#bf00ff" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />

      {/* Glass anatomy chassis */}
      <AnatomyModel />

      {/* Lung volumes — fade in and breathe when their node is hovered */}
      <LungVolume
        position={LEFT_LUNG_POS}
        visible={hoveredOrganId === "left_lung"}
      />
      <LungVolume
        position={RIGHT_LUNG_POS}
        visible={hoveredOrganId === "right_lung"}
      />

      {/* Organ nodes and spine line */}
      {organs.map((organ) =>
        organ.type === "line" ? (
          <SpinalCord key={organ.id} organ={organ} onSelect={onSelect} />
        ) : (
          <OrganNode
            key={organ.id}
            organ={organ}
            onSelect={onSelect}
            onHover={setHoveredOrganId}
          />
        ),
      )}

      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={1.5}
        maxDistance={7}
        target={[0, 0.9, 0]}
      />
    </Canvas>
  );
}

export default Scene;
