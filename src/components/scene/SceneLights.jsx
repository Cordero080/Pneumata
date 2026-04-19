import { Environment } from "@react-three/drei";

// Warm studio — light mode default and dark mode silver states (4, 5)
function StudioLights() {
  return (
    <>
      <ambientLight intensity={1.6} />
      <pointLight position={[2, 2.5, 2]} intensity={1.2} color="#f0ece8" />
      <pointLight position={[-3, 1.5, -2]} intensity={0.8} color="#e8eef4" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#f4f0ec" />
      <pointLight position={[0, 1.5, -2.5]} intensity={1.0} color="#dce8f4" />
      <pointLight position={[-1.5, 1.0, -2]} intensity={0.6} color="#e4eef8" />
      <pointLight position={[1.5, 1.0, -2]} intensity={0.6} color="#e4eef8" />
    </>
  );
}

// Neon — dark mode obsidian states (0, 1, 2)
function NeonLights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[2, 2.5, 2]} intensity={2} color="#00f5ff" />
      <pointLight position={[-3, 1.5, -2]} intensity={1} color="#bf00ff" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />
    </>
  );
}

// White ghost — mode 3 in both dark and light
function WhiteGhostLights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <pointLight position={[2, 2.5, 2]} intensity={1.4} color="#f8f4f0" />
      <pointLight position={[-3, 1.5, -2]} intensity={1.0} color="#f0f4f8" />
      <pointLight position={[0, 1, 3]} intensity={0.8} color="#f4f0f8" />
      <pointLight position={[0, 1.0, -3.5]} intensity={3.5} color="#a0c4ff" />
      <pointLight position={[0, 1.5, -2.5]} intensity={1.2} color="#e8f0ff" />
    </>
  );
}

// Nebula — female mode
function NebulaLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#ffe0f0" />
      {/* Frontal key — soft white fill so the mesh reads clearly */}
      <pointLight position={[0, 1.3, 4]} intensity={4.5} color="#fff0f8" />
      <pointLight position={[0, 0.8, 3.5]} intensity={2.5} color="#ffe8f4" />
      {/* Color accent lights */}
      <pointLight position={[2.5, 2.5, 1.5]} intensity={2.0} color="#ff2090" />
      <pointLight position={[-2.5, 1.5, 1]} intensity={1.8} color="#9010ff" />
      <pointLight position={[0, 1.5, -2.5]} intensity={1.5} color="#ff10cc" />
      <pointLight position={[-1.5, 0.5, 1]} intensity={1.0} color="#4020ff" />
      <pointLight position={[1.5, 0.8, 1]} intensity={1.2} color="#ff40a0" />
    </>
  );
}

// Ghost x-ray neon — light mode meshMode 0
function GhostNeonLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2.5, 2]} intensity={2} color="#00f5ff" />
      <pointLight position={[-3, 1.5, -2]} intensity={1} color="#bf00ff" />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#aaccff" />
    </>
  );
}

// Subtle spine accent lights — dark mode only, trace the vertebral column
function SpineAccentLights() {
  return (
    <>
      <pointLight
        position={[-0.16, 1.65, -0.05]}
        intensity={0.18}
        color="#c0d0ff"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[0.16, 1.45, -0.05]}
        intensity={0.18}
        color="#b8ccf0"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[-0.14, 1.25, -0.05]}
        intensity={0.2}
        color="#c0d0ff"
        distance={1.5}
        decay={2}
      />
      <pointLight
        position={[0.14, 1.05, -0.04]}
        intensity={0.2}
        color="#b0c4ee"
        distance={1.5}
        decay={2}
      />
      <pointLight
        position={[-0.12, 0.85, -0.03]}
        intensity={0.18}
        color="#a8bce0"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[0.12, 0.55, -0.03]}
        intensity={0.18}
        color="#a0b8e8"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[-0.18, 0.1, -0.02]}
        intensity={0.18}
        color="#9cb0dc"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[0.18, -0.3, -0.02]}
        intensity={0.18}
        color="#98acda"
        distance={1.4}
        decay={2}
      />
      <pointLight
        position={[-0.15, -0.75, -0.02]}
        intensity={0.16}
        color="#94a8d8"
        distance={1.3}
        decay={2}
      />
      <pointLight
        position={[0.15, -1.2, -0.02]}
        intensity={0.16}
        color="#90a4d4"
        distance={1.3}
        decay={2}
      />
    </>
  );
}

function SceneLights({ darkMode, meshMode, femaleMode }) {
  if (femaleMode) {
    return (
      <>
        <fog attach="fog" args={["#08021a", 6, 12]} />
        <Environment preset="sunset" background={false} />
        <NebulaLights />
      </>
    );
  }

  const showEnv =
    (!darkMode && meshMode !== 0) ||
    (darkMode && (meshMode === 4 || meshMode === 5));

  const showFog =
    darkMode &&
    meshMode !== 0 &&
    meshMode !== 3 &&
    meshMode !== 4 &&
    meshMode !== 5;

  return (
    <>
      {showFog && <fog attach="fog" args={["#010208", 4.5, 9]} />}
      {showEnv && <Environment preset="city" background={false} />}

      {darkMode && (meshMode === 4 || meshMode === 5) ? (
        <StudioLights />
      ) : darkMode && meshMode !== 3 ? (
        <NeonLights />
      ) : meshMode === 3 ? (
        <WhiteGhostLights />
      ) : meshMode === 0 ? (
        <GhostNeonLights />
      ) : (
        <StudioLights />
      )}

      {darkMode && <SpineAccentLights />}
    </>
  );
}

export default SceneLights;
