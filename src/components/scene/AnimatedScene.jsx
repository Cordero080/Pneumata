import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneLights from "./SceneLights";
import AnimatedModel from "./AnimatedModel";

const ORBIT_TARGET = [0, 0.85, 0];

function AnimatedScene({ darkMode, meshMode, onSecondLoop }) {
  return (
    <Canvas
      camera={{ position: [0, 0.82, 2.1], fov: 48 }}
      style={{ width: "100%", height: "100%" }}
      gl={{
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <SceneLights darkMode={darkMode} meshMode={meshMode} />
      <AnimatedModel
        darkMode={darkMode}
        meshMode={meshMode}
        onSecondLoop={onSecondLoop}
      />
      <OrbitControls
        enableZoom
        enablePan
        minDistance={0.9}
        maxDistance={7}
        target={ORBIT_TARGET}
      />
    </Canvas>
  );
}

export default AnimatedScene;
