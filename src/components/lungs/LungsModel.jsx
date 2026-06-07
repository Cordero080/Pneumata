import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LUNGS_CENTER_X = 0.0;
const LUNGS_CENTER_Y = 1.34;
const LUNGS_CENTER_Z = -0.01;
const TARGET_HEIGHT = 0.31; // lung size — increase to enlarge

// === FEMALE LUNGS — tweak these ===
const LUNGS_CENTER_X_FEMALE = 0.0; // left (-) / right (+)
const LUNGS_CENTER_Y_FEMALE = 1.28; // up (+) / down (-)
const LUNGS_CENTER_Z_FEMALE = -0.02; // forward (+) / back into body (-)
const TARGET_HEIGHT_FEMALE = 0.28; // size — increase to enlarge
// ===================================

function LungsModel({
  meshMode,
  viewMode,
  hoveredOrganId,
  breathingRef,
  heartbeatRef,
  femaleMode,
}) {
  const gltf = useGLTF("/new-lungs.glb");
  const baseScaleRef = useRef(1);
  const effectiveScaleRef = useRef(1);
  const lungsCenterRef = useRef(new THREE.Vector3());

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
    lungsCenterRef.current.copy(center);
    cloned.scale.setScalar(s);
    cloned.position.set(
      LUNGS_CENTER_X - center.x * s,
      LUNGS_CENTER_Y - center.y * s,
      LUNGS_CENTER_Z - center.z * s,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene]);

  useEffect(() => {
    const th = femaleMode ? TARGET_HEIGHT_FEMALE : TARGET_HEIGHT;
    const rawSize = baseScaleRef.current > 0 ? baseScaleRef.current : 1;
    const s = (th / TARGET_HEIGHT) * rawSize;
    effectiveScaleRef.current = s;
    scene.scale.setScalar(s);
    const c = lungsCenterRef.current;
    const cx = femaleMode ? LUNGS_CENTER_X_FEMALE : LUNGS_CENTER_X;
    const cy = femaleMode ? LUNGS_CENTER_Y_FEMALE : LUNGS_CENTER_Y;
    const cz = femaleMode ? LUNGS_CENTER_Z_FEMALE : LUNGS_CENTER_Z;
    scene.position.set(cx - c.x * s, cy - c.y * s, cz - c.z * s);
  }, [femaleMode, scene]);

  const tissueMats = useRef([]);
  const glowMatsRef = useRef([]);
  const [glowScene, setGlowScene] = useState(null);
  const beatFlash = useRef(0);
  const lastBeat = useRef(0);

  useEffect(() => {
    const tissue = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const m = child.material.clone();
      m.transparent = true;
      m.opacity = 0;
      m.depthWrite = false;
      child.material = m;
      child.renderOrder = 4;
      tissue.push(m);
    });
    tissueMats.current = tissue;

    // Separate glow layer — pure cyan emissive, no base color
    const glowClone = scene.clone(true);
    glowClone.visible = true;
    const glowMats = [];
    glowClone.traverse((child) => {
      if (!child.isMesh) return;
      const gm = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0, 0.8, 1),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      child.material = gm;
      child.renderOrder = 5;
      glowMats.push(gm);
    });
    glowMatsRef.current = glowMats;
    setGlowScene(glowClone);

    scene.visible = true;

    return () => {
      tissueMats.current.forEach((m) => m.dispose());
      glowMatsRef.current.forEach((m) => m.dispose());
    };
  }, [scene]);

  useFrame((state) => {
    const tissue = tissueMats.current;
    if (!tissue.length) return;

    const t = state.clock.getElapsedTime();
    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered =
      hoveredOrganId === "left_lung" || hoveredOrganId === "right_lung";
    const breathingMode = viewMode === "breathing";
    const powerMode = viewMode === "power";
    const unifiedMode = viewMode === "unified";
    const breath = breathingRef ? breathingRef.current : 0;

    if (heartbeatRef && heartbeatRef.current !== lastBeat.current) {
      lastBeat.current = heartbeatRef.current;
      beatFlash.current = 1.0;
    }
    beatFlash.current *= 0.88;

    let targetOpacity;
    if (hovered) {
      targetOpacity = 0.92;
    } else if (breathingMode) {
      targetOpacity = 0.55;
    } else if (powerMode) {
      targetOpacity = 0.38;
    } else if (unifiedMode) {
      targetOpacity = 0.32;
    } else if (meshMode === 2 || meshMode === 4 || meshMode === 5) {
      targetOpacity = 0.45;
    } else if (ghostMode) {
      targetOpacity = 0.35;
    } else if (meshMode === 1) {
      targetOpacity = 0.28;
    } else {
      targetOpacity = 0.2;
    }

    for (const m of tissue) {
      m.opacity += (targetOpacity - m.opacity) * 0.06;
    }

    // Glow layer — cyan only on inhale, fades out on exhale
    const glowTarget = breathingMode ? breath * 0.28 : 0;

    for (const gm of glowMatsRef.current) {
      gm.opacity += (glowTarget - gm.opacity) * 0.06;
    }

    const breathMult = breathingMode ? 1 + breath * 0.06 : 1;
    const targetScale = effectiveScaleRef.current * breathMult;
    scene.scale.setScalar(scene.scale.x + (targetScale - scene.scale.x) * 0.04);
    if (glowScene) glowScene.scale.copy(scene.scale);
    if (glowScene) glowScene.position.copy(scene.position);
  });

  return (
    <>
      <primitive object={scene} />
      {glowScene && <primitive object={glowScene} />}
    </>
  );
}

useGLTF.preload("/new-lungs.glb");

export default LungsModel;
