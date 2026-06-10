import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// === MALE STOMACH — tweak these ===
const STOMACH_CENTER_X = 0.01; // left (-) / right (+)
const STOMACH_CENTER_Y = 1.17; // up (+) / down (-)
const STOMACH_CENTER_Z = 0.04; // forward (+) / back into body (-)
const TARGET_HEIGHT = 0.22; // size — increase to enlarge
// ==================================

// === FEMALE STOMACH — tweak these ===
const STOMACH_CENTER_X_FEMALE = -0.001;
const STOMACH_CENTER_Y_FEMALE = 1.138;
const STOMACH_CENTER_Z_FEMALE = 0.04;
const TARGET_HEIGHT_FEMALE = 0.25;
// =====================================

function StomachModel({
  meshMode,
  viewMode,
  hoveredOrganId,
  femaleMode,
  selectedOrganId,
}) {
  const gltf = useGLTF("/stomach.glb");
  const baseScaleRef = useRef(1);
  const centerRef = useRef(new THREE.Vector3());

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.scale.set(1, 1, 1);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(-0.15, 0, -0.2);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    baseScaleRef.current = s;
    centerRef.current.copy(center);
    cloned.scale.setScalar(s);
    cloned.position.set(
      STOMACH_CENTER_X - center.x * s,
      STOMACH_CENTER_Y - center.y * s,
      STOMACH_CENTER_Z - center.z * s,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene]);

  useEffect(() => {
    const th = femaleMode ? TARGET_HEIGHT_FEMALE : TARGET_HEIGHT;
    const rawSize = baseScaleRef.current > 0 ? baseScaleRef.current : 1;
    const s = (th / TARGET_HEIGHT) * rawSize;
    scene.scale.setScalar(s);
    const c = centerRef.current;
    const cx = femaleMode ? STOMACH_CENTER_X_FEMALE : STOMACH_CENTER_X;
    const cy = femaleMode ? STOMACH_CENTER_Y_FEMALE : STOMACH_CENTER_Y;
    const cz = femaleMode ? STOMACH_CENTER_Z_FEMALE : STOMACH_CENTER_Z;
    scene.position.set(cx - c.x * s, cy - c.y * s, cz - c.z * s);
  }, [femaleMode, scene]);

  const matsRef = useRef([]);

  useEffect(() => {
    const mats = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const m = child.material.clone();
      m.transparent = true;
      m.opacity = 0;
      m.depthWrite = false;
      m.needsUpdate = true;
      child.material = m;
      child.renderOrder = 4;
      mats.push(m);
    });
    matsRef.current = mats;
    scene.visible = true;
    return () => mats.forEach((m) => m.dispose());
  }, [scene]);

  useFrame((_state, delta) => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const otherSelected = selectedOrganId && selectedOrganId !== "stomach";
    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered = hoveredOrganId === "stomach";
    const digestiveMode = viewMode === "unified";

    let targetOpacity;
    if (otherSelected) {
      targetOpacity = 0;
    } else if (hovered) {
      targetOpacity = 0.88;
    } else if (meshMode === 4) {
      targetOpacity = digestiveMode ? 0.38 : 0;
    } else if (meshMode === 2 || meshMode === 5) {
      targetOpacity = digestiveMode ? 0.55 : 0.38;
    } else if (ghostMode) {
      targetOpacity = digestiveMode ? 0.5 : 0.32;
    } else if (meshMode === 1) {
      targetOpacity = 0.26;
    } else {
      targetOpacity = 0.2;
    }

    const opLerp = 1 - Math.exp(-delta * 3.7);
    for (const m of mats) {
      const diff = targetOpacity - m.opacity;
      if (Math.abs(diff) > 0.001) m.opacity += diff * opLerp;
    }

    scene.visible = mats[0].opacity > 0.01;
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/stomach.glb");

export default StomachModel;
