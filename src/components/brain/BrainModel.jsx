import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BRAIN_CENTER_Y = 1.665;
const BRAIN_Z_OFFSET = -0.015;
const TARGET_HEIGHT = 0.165;

function BrainModel({ meshMode, brainZoom, cellZoom, darkMode, onBrainClick }) {
  const gltf = useGLTF("/platinum-brain.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  // Collect original materials so we can drive their opacity each frame
  const matsRef = useRef([]);

  useEffect(() => {
    // Reset any baked transforms before measuring
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const s = TARGET_HEIGHT / size.y;
    scene.scale.setScalar(s);
    scene.position.set(
      -center.x * s,
      BRAIN_CENTER_Y - center.y * s,
      -center.z * s + BRAIN_Z_OFFSET,
    );

    // Preserve original GLB materials — just enable transparency on each
    const mats = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        const m = child.material;
        m.transparent = true;
        m.opacity = 0;
        m.depthWrite = false;
        m.needsUpdate = true;
        child.renderOrder = 4; // above body shell (0–3), below organ nodes (5–6)
        if (!mats.includes(m)) mats.push(m);
      }
    });
    matsRef.current = mats;
  }, [scene]);

  useFrame(() => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const ghostMode = meshMode === 0 || meshMode === 3;

    const targetOpacity = cellZoom
      ? 0.15
      : ghostMode
        ? brainZoom
          ? 0.88
          : 0.28
        : 0.0;
    const targetEmissive =
      darkMode && ghostMode ? (brainZoom ? 0.38 : 0.1) : 0.0;

    for (const m of mats) {
      m.opacity += (targetOpacity - m.opacity) * 0.06;
      if (m.emissiveIntensity !== undefined) {
        m.emissiveIntensity += (targetEmissive - m.emissiveIntensity) * 0.06;
      }
    }
  });

  return (
    <group onClick={onBrainClick}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/platinum-brain.glb");

export default BrainModel;
