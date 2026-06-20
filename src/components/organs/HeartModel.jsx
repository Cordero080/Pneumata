import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HEART_CENTER_X = 0.01;
const HEART_CENTER_Y = 1.32;
const HEART_CENTER_Z = 0.03;
const TARGET_HEIGHT = 0.15; // heart size — increase to enlarge

// === FEMALE HEART — tweak these ===
const HEART_CENTER_X_FEMALE = 0.01; // left (-) / right (+)
const HEART_CENTER_Y_FEMALE = 1.28; // up (+) / down (-)
const HEART_CENTER_Z_FEMALE = 0.02; // forward (+) / back into body (-)
const TARGET_HEIGHT_FEMALE = 0.13; // size — increase to enlarge
// ===================================

const BLOOD_RED = new THREE.Color("#aa3018");

function HeartModel({
  meshMode,
  viewMode,
  hoveredOrganId,
  heartbeatRef,
  femaleMode,
  selectedOrganId,
}) {
  const gltf = useGLTF("/models/organs/rose-heart.glb");
  const heartCenterRef = useRef(new THREE.Vector3());
  const heartScaleRef = useRef(1);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.scale.set(1, 1, 1);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0.25);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    heartScaleRef.current = s;
    heartCenterRef.current.copy(center);
    cloned.scale.setScalar(s);
    cloned.position.set(
      HEART_CENTER_X - center.x * s,
      HEART_CENTER_Y - center.y * s,
      HEART_CENTER_Z - center.z * s,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene]);

  useEffect(() => {
    const th = femaleMode ? TARGET_HEIGHT_FEMALE : TARGET_HEIGHT;
    const c = heartCenterRef.current;
    const rawSize = heartScaleRef.current > 0 ? heartScaleRef.current : 1;
    const s = (th / TARGET_HEIGHT) * rawSize;
    scene.scale.setScalar(s);
    const cx = femaleMode ? HEART_CENTER_X_FEMALE : HEART_CENTER_X;
    const cy = femaleMode ? HEART_CENTER_Y_FEMALE : HEART_CENTER_Y;
    const cz = femaleMode ? HEART_CENTER_Z_FEMALE : HEART_CENTER_Z;
    scene.position.set(cx - c.x * s, cy - c.y * s, cz - c.z * s);
  }, [femaleMode, scene]);

  const matsRef = useRef([]);
  const glowMatRef = useRef(null);
  const [glowScene, setGlowScene] = useState(null);
  const beatRef = useRef({ last: 0, flash: 0 });

  useEffect(() => {
    const mats = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        const prev = child.material;
        const m = new THREE.MeshStandardMaterial({
          color: prev.color ?? new THREE.Color("#c04040"),
          map: prev.map ?? null,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          emissive: new THREE.Color("#cc0011"),
          emissiveIntensity: 0,
          roughness: 0.55,
          metalness: 0.25,
        });
        child.material = m;
        child.renderOrder = 4;
        if (!mats.includes(m)) mats.push(m);
      }
    });
    matsRef.current = mats;

    // Additive blood-red glow layer — fires on each heartbeat
    const gm = new THREE.MeshBasicMaterial({
      color: BLOOD_RED,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    glowMatRef.current = gm;

    const glowClone = scene.clone(true);
    glowClone.visible = true;
    glowClone.traverse((child) => {
      if (child.isMesh) {
        child.material = gm;
        child.renderOrder = 5;
      }
    });
    setGlowScene(glowClone);

    scene.visible = true;

    return () => {
      matsRef.current.forEach((m) => m.dispose());
      if (glowMatRef.current) glowMatRef.current.dispose();
    };
  }, [scene]);

  useFrame((_state, delta) => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const otherSelected = selectedOrganId && selectedOrganId !== "heart";
    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered = hoveredOrganId === "heart";
    const powerMode = viewMode === "power";

    let baseOpacity;
    if (otherSelected) {
      baseOpacity = 0;
    } else if (hovered) {
      baseOpacity = 0.95;
    } else if (meshMode === 4) {
      baseOpacity = powerMode ? 0.88 : 0;
    } else if (meshMode === 2 || meshMode === 5) {
      baseOpacity = powerMode ? 0.88 : 0.52;
    } else if (ghostMode) {
      baseOpacity = powerMode ? 0.82 : 0.6;
    } else if (meshMode === 1) {
      baseOpacity = 0.88;
    } else {
      baseOpacity = 0.0;
    }

    const b = beatRef.current;
    if (heartbeatRef && heartbeatRef.current !== b.last) {
      b.last = heartbeatRef.current;
      b.flash = 1.0;
    }
    b.flash *= Math.exp(-delta * 4.4); // delta-time decay — matches 0.93/frame at 60fps

    const opLerp = 1 - Math.exp(-delta * 3.7); // delta-time lerp — matches 0.06/frame at 60fps
    const emLerp = 1 - Math.exp(-delta * 6.2); // delta-time lerp — matches 0.10/frame at 60fps
    for (const m of mats) {
      const opDiff = baseOpacity - m.opacity;
      if (Math.abs(opDiff) > 0.001) m.opacity += opDiff * opLerp;
      const baseEmissive = powerMode && !otherSelected ? 0.8 : 0.0;
      const emDiff = baseEmissive - m.emissiveIntensity;
      if (Math.abs(emDiff) > 0.001) m.emissiveIntensity += emDiff * emLerp;
    }

    const visible = mats[0].opacity > 0.01;
    scene.visible = visible;

    if (glowMatRef.current) {
      const glowTarget = visible ? b.flash * (powerMode ? 1.0 : 0.75) : 0;
      const gDiff = glowTarget - glowMatRef.current.opacity;
      if (Math.abs(gDiff) > 0.001)
        glowMatRef.current.opacity += gDiff * (1 - Math.exp(-delta * 9.2));
      if (glowScene) {
        glowScene.visible = glowMatRef.current.opacity > 0.001;
        glowScene.scale.copy(scene.scale);
        glowScene.position.copy(scene.position);
      }
    }
  });

  return (
    <>
      <primitive object={scene} />
      {glowScene && <primitive object={glowScene} />}
    </>
  );
}

useGLTF.preload("/models/organs/rose-heart.glb");

export default HeartModel;
