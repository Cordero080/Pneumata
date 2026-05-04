import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BRAIN_CENTER_Y = 1.672; // tweak to move brain mesh up/down in male mode
const FEMALE_BRAIN_CENTER_Y = 1.615; // tweak to move brain mesh up/down in female mode
const BRAIN_Z_OFFSET = -0.015;
const TARGET_HEIGHT = 0.165; // tweak to resize brain mesh
const FEMALE_TARGET_HEIGHT = TARGET_HEIGHT * 0.94; // 2% smaller for female

function BrainModel({
  meshMode,
  brainZoom,
  cellZoom,
  darkMode,
  femaleMode,
  onBrainClick,
}) {
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

    const s = (femaleMode ? FEMALE_TARGET_HEIGHT : TARGET_HEIGHT) / size.y;
    scene.scale.setScalar(s);
    const centerY = femaleMode ? FEMALE_BRAIN_CENTER_Y : BRAIN_CENTER_Y;
    scene.position.set(
      -center.x * s,
      centerY - center.y * s,
      -center.z * s + BRAIN_Z_OFFSET,
    );

    // After positioning, recompute box in final world-space coords.
    // These are the real bounds for placing neural paths, tips, etc.
    scene.updateMatrixWorld(true);
    const worldBox = new THREE.Box3().setFromObject(scene);
    const worldMin = worldBox.min;
    const worldMax = worldBox.max;
    console.log(
      `[BrainModel] world bounds (${femaleMode ? "female" : "male"}):\n` +
        `  x: ${worldMin.x.toFixed(4)} → ${worldMax.x.toFixed(4)}\n` +
        `  y: ${worldMin.y.toFixed(4)} → ${worldMax.y.toFixed(4)}\n` +
        `  z: ${worldMin.z.toFixed(4)} → ${worldMax.z.toFixed(4)}`,
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
  }, [scene, femaleMode]);

  useFrame(() => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const ghostMode = meshMode === 0 || meshMode === 3;

    const targetOpacity = cellZoom
      ? 0.28
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
