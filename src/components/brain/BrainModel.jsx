import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BRAIN_MESH } from "../../data/sizing";

// Size/position constants live in src/data/sizing.js (BRAIN_MESH) —
// tweak there to move/resize the brain mesh.
const BRAIN_CENTER_Y = BRAIN_MESH.centerY;
const FEMALE_BRAIN_CENTER_Y = BRAIN_MESH.femaleCenterY;
const BRAIN_Z_OFFSET = BRAIN_MESH.zOffset;
const TARGET_HEIGHT = BRAIN_MESH.targetHeight;
const FEMALE_TARGET_HEIGHT = BRAIN_MESH.femaleTargetHeight;

function BrainModel({
  meshMode,
  brainZoom,
  cellZoom,
  darkMode,
  femaleMode,
  onBrainClick,
}) {
  const gltf = useGLTF("/models/nervous/platinum-brain.glb");
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.scale.set(1, 1, 1);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = (femaleMode ? FEMALE_TARGET_HEIGHT : TARGET_HEIGHT) / size.y;
    cloned.scale.setScalar(s);
    const centerY = femaleMode ? FEMALE_BRAIN_CENTER_Y : BRAIN_CENTER_Y;
    cloned.position.set(
      -center.x * s,
      centerY - center.y * s,
      -center.z * s + BRAIN_Z_OFFSET,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene, femaleMode]);
  // Collect original materials so we can drive their opacity each frame
  const matsRef = useRef([]);

  useEffect(() => {
    scene.updateMatrixWorld(true);

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
    scene.visible = true;
  }, [scene, femaleMode]);

  useFrame((_state, delta) => {
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

    const lerp = 1 - Math.exp(-delta * 3.7);
    for (const m of mats) {
      m.opacity += (targetOpacity - m.opacity) * lerp;
      if (m.emissiveIntensity !== undefined) {
        m.emissiveIntensity += (targetEmissive - m.emissiveIntensity) * lerp;
      }
    }
  });

  return (
    <group onClick={onBrainClick}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/nervous/platinum-brain.glb");

export default BrainModel;
