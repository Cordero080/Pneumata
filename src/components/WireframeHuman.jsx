// Procedural wireframe human silhouette built from Three.js primitives.
// Replace this component with WireframeModel.jsx (useGLTF) when a real .glb is sourced.
// See docs/stretch-goals.md for instructions.

const WIRE = {
  color: "#00c8ff",
  wireframe: true,
  transparent: true,
  opacity: 0.13,
};

function WireframeHuman() {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 3.55, 0]}>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.28, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Torso — upper chest */}
      <mesh position={[0, 2.4, 0]}>
        <capsuleGeometry args={[0.38, 0.55, 4, 10]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Torso — lower abdomen */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.33, 0.7, 4, 10]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.3, 0.2, 4, 10]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[-0.52, 2.72, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
      <mesh position={[0.52, 2.72, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Upper arms */}
      <mesh position={[-0.68, 2.18, 0]} rotation={[0, 0, 0.22]}>
        <capsuleGeometry args={[0.09, 0.65, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
      <mesh position={[0.68, 2.18, 0]} rotation={[0, 0, -0.22]}>
        <capsuleGeometry args={[0.09, 0.65, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Forearms */}
      <mesh position={[-0.82, 1.5, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.07, 0.6, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
      <mesh position={[0.82, 1.5, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.07, 0.6, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Upper legs */}
      <mesh position={[-0.22, 0.15, 0]}>
        <capsuleGeometry args={[0.13, 0.75, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
      <mesh position={[0.22, 0.15, 0]}>
        <capsuleGeometry args={[0.13, 0.75, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>

      {/* Lower legs */}
      <mesh position={[-0.22, -0.72, 0]}>
        <capsuleGeometry args={[0.09, 0.72, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
      <mesh position={[0.22, -0.72, 0]}>
        <capsuleGeometry args={[0.09, 0.72, 4, 8]} />
        <meshBasicMaterial {...WIRE} />
      </mesh>
    </group>
  );
}

export default WireframeHuman;
