import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// === MALE LIVER — tweak these ===
const LIVER_CENTER_X = -0.03; // left (-) / right (+)
const LIVER_CENTER_Y = 1.18; // up (+) / down (-)
const LIVER_CENTER_Z = 0.03; // forward (+) / back into body (-)
const TARGET_HEIGHT = 0.12; // size — increase to enlarge
// ================================

// === FEMALE LIVER — tweak these ===
const LIVER_CENTER_X_FEMALE = -0.02;
const LIVER_CENTER_Y_FEMALE = 1.14;
const LIVER_CENTER_Z_FEMALE = 0.04;
const TARGET_HEIGHT_FEMALE = 0.12;
// ===================================

function LiverModel({
  meshMode,
  viewMode,
  hoveredOrganId,
  femaleMode,
  selectedOrganId,
}) {
  const gltf = useGLTF("/liver.glb");
  const baseScaleRef = useRef(1);
  const liverCenterRef = useRef(new THREE.Vector3());

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.scale.set(1, 1, 1);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    baseScaleRef.current = s;
    liverCenterRef.current.copy(center);
    cloned.scale.setScalar(s);
    cloned.position.set(
      LIVER_CENTER_X - center.x * s,
      LIVER_CENTER_Y - center.y * s,
      LIVER_CENTER_Z - center.z * s,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene]);

  useEffect(() => {
    const th = femaleMode ? TARGET_HEIGHT_FEMALE : TARGET_HEIGHT;
    const rawSize = baseScaleRef.current > 0 ? baseScaleRef.current : 1;
    const s = (th / TARGET_HEIGHT) * rawSize;
    scene.scale.setScalar(s);
    const c = liverCenterRef.current;
    const cx = femaleMode ? LIVER_CENTER_X_FEMALE : LIVER_CENTER_X;
    const cy = femaleMode ? LIVER_CENTER_Y_FEMALE : LIVER_CENTER_Y;
    const cz = femaleMode ? LIVER_CENTER_Z_FEMALE : LIVER_CENTER_Z;
    scene.position.set(cx - c.x * s, cy - c.y * s, cz - c.z * s);
  }, [femaleMode, scene]);

  const matsRef = useRef([]);

  useEffect(() => {
    const mats = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const m = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#7a2a10"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        emissive: new THREE.Color("#5a1808"),
        emissiveIntensity: 0,
        roughness: 0.65,
        metalness: 0.1,
      });
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

    const otherSelected = selectedOrganId && selectedOrganId !== "liver";
    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered = hoveredOrganId === "liver";
    const digestiveMode = viewMode === "unified";

    let targetOpacity;
    if (otherSelected) {
      targetOpacity = 0;
    } else if (hovered) {
      targetOpacity = 0.75;
    } else if (meshMode === 4) {
      targetOpacity = digestiveMode ? 0.35 : 0;
    } else if (meshMode === 2 || meshMode === 5) {
      targetOpacity = digestiveMode ? 0.45 : 0.28;
    } else if (ghostMode) {
      targetOpacity = digestiveMode ? 0.4 : 0.22;
    } else if (meshMode === 1) {
      targetOpacity = 0.18;
    } else {
      targetOpacity = 0.12;
    }

    const opLerp = 1 - Math.exp(-delta * 3.7);
    const emLerp = 1 - Math.exp(-delta * 5.0);
    for (const m of mats) {
      const opDiff = targetOpacity - m.opacity;
      if (Math.abs(opDiff) > 0.001) m.opacity += opDiff * opLerp;
      const targetEmissive = hovered ? 0.4 : 0.0;
      const emDiff = targetEmissive - m.emissiveIntensity;
      if (Math.abs(emDiff) > 0.001) m.emissiveIntensity += emDiff * emLerp;
    }

    scene.visible = mats[0].opacity > 0.01;
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/liver.glb");

export default LiverModel;
