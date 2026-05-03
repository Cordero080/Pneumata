import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HEART_CENTER_X = 0.01;
const HEART_CENTER_Y = 1.32;
const HEART_CENTER_Z = 0.06;
const TARGET_HEIGHT = 0.13;

function HeartModel({ meshMode, viewMode, hoveredOrganId }) {
  const gltf = useGLTF("/rose-heart.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const matsRef = useRef([]);

  useEffect(() => {
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0.25);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const s = TARGET_HEIGHT / size.y;
    scene.scale.setScalar(s);
    scene.position.set(
      HEART_CENTER_X - center.x * s,
      HEART_CENTER_Y - center.y * s,
      HEART_CENTER_Z - center.z * s,
    );

    const mats = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        const m = child.material;
        m.transparent = true;
        m.opacity = 0;
        m.depthWrite = false;
        m.needsUpdate = true;
        child.renderOrder = 4;
        if (!mats.includes(m)) mats.push(m);
      }
    });
    matsRef.current = mats;
  }, [scene]);

  useFrame(() => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered = hoveredOrganId === "heart";
    const powerMode = viewMode === "power";

    let targetOpacity;
    if (hovered) {
      targetOpacity = 0.95;
    } else if (meshMode === 2 || meshMode === 4 || meshMode === 5) {
      targetOpacity = powerMode ? 0.88 : 0.65;
    } else if (ghostMode) {
      targetOpacity = powerMode ? 0.82 : 0.45;
    } else if (meshMode === 1) {
      targetOpacity = 0.55;
    } else {
      targetOpacity = 0.0;
    }

    for (const m of mats) {
      m.opacity += (targetOpacity - m.opacity) * 0.06;
    }
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/rose-heart.glb");

export default HeartModel;
