import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LUNGS_CENTER_X = 0.0; // tweak to shift left (-) or right (+)
const LUNGS_CENTER_Y = 1.33; // tweak to move lungs up (+) or down (-)
const LUNGS_CENTER_Z = 0.02; // tweak to move forward (+) or back (-)
const TARGET_HEIGHT = 0.29; // tweak to resize — controls overall lung size

function LungsModel({
  meshMode,
  viewMode,
  hoveredOrganId,
  breathingRef,
  heartbeatRef,
}) {
  const gltf = useGLTF("/lungs-red-hybrid.glb");
  const baseScaleRef = useRef(1);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.scale.set(1, 1, 1);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(-0.15, 0, 0); // tweak X to tilt back (-) or forward (+)
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    baseScaleRef.current = s;
    cloned.scale.setScalar(s);
    cloned.position.set(
      LUNGS_CENTER_X - center.x * s,
      LUNGS_CENTER_Y - center.y * s,
      LUNGS_CENTER_Z - center.z * s,
    );
    cloned.visible = false;
    return cloned;
  }, [gltf.scene]);

  // Four material buckets — left (bio) vs right (hardware), each split bronchi/tissue
  const bronchiMats = useRef([]); // left lung — red vascular
  const tissueMats = useRef([]); // left lung — iridescent bio
  const hwBronchiMats = useRef([]); // right lung — copper circuit traces
  const hwTissueMats = useRef([]); // right lung — anodized aluminum
  const beatFlash = useRef(0);
  const lastBeat = useRef(0);

  useEffect(() => {
    const bronchi = [],
      tissue = [],
      hwBronchi = [],
      hwTissue = [];
    scene.updateMatrixWorld(true);
    const meshBox = new THREE.Box3();
    const meshCenter = new THREE.Vector3();
    scene.traverse((child) => {
      if (!child.isMesh) return;
      meshBox.setFromObject(child);
      meshBox.getCenter(meshCenter);
      const isRight = meshCenter.x > 0; // viewer's right, positive x in scene
      const prev = child.material;
      const c = prev.color ?? new THREE.Color(1, 1, 1);
      const isBronchi = c.r > 0.45 && c.g < 0.35;

      if (isRight) {
        // Hardware lung — anodized aluminum tissue, copper bronchi
        if (isBronchi) {
          const m = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#7a3a18"),
            map: prev.map ?? null,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            emissive: new THREE.Color("#ff6600"),
            emissiveIntensity: 0,
            roughness: 0.3,
            metalness: 0.8,
          });
          child.material = m;
          child.renderOrder = 4;
          if (!hwBronchi.includes(m)) hwBronchi.push(m);
        } else {
          const m = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#8a9aaa"),
            map: prev.map ?? null,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            emissive: new THREE.Color("#00ffaa"),
            emissiveIntensity: 0,
            roughness: 0.18,
            metalness: 0.75,
          });
          child.material = m;
          child.renderOrder = 4;
          if (!hwTissue.includes(m)) hwTissue.push(m);
        }
      } else {
        // Bio lung — iridescent tissue, red vascular bronchi
        if (isBronchi) {
          const m = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#cc1100"),
            map: prev.map ?? null,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            emissive: new THREE.Color("#ff0000"),
            emissiveIntensity: 0,
            roughness: 0.45,
            metalness: 0.15,
          });
          child.material = m;
          child.renderOrder = 4;
          if (!bronchi.includes(m)) bronchi.push(m);
        } else {
          const m = new THREE.MeshStandardMaterial({
            color: prev.color ?? new THREE.Color("#c8d8e0"),
            map: prev.map ?? null,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            emissive: new THREE.Color("#00ccff"),
            emissiveIntensity: 0,
            roughness: 0.08,
            metalness: 0.0,
          });
          child.material = m;
          child.renderOrder = 4;
          if (!tissue.includes(m)) tissue.push(m);
        }
      }
    });
    bronchiMats.current = bronchi;
    tissueMats.current = tissue;
    hwBronchiMats.current = hwBronchi;
    hwTissueMats.current = hwTissue;
    scene.visible = true;
  }, [scene]);

  useFrame((state) => {
    const bronchi = bronchiMats.current;
    const tissue = tissueMats.current;
    const hwBronchi = hwBronchiMats.current;
    const hwTissue = hwTissueMats.current;
    if (
      !bronchi.length &&
      !tissue.length &&
      !hwBronchi.length &&
      !hwTissue.length
    )
      return;

    const t = state.clock.getElapsedTime();
    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered =
      hoveredOrganId === "left_lung" || hoveredOrganId === "right_lung";
    const breathingMode = viewMode === "breathing";
    const powerMode = viewMode === "power";
    const unifiedMode = viewMode === "unified";
    const breath = breathingRef ? breathingRef.current : 0;

    // Heartbeat flash on bronchi
    if (heartbeatRef && heartbeatRef.current !== lastBeat.current) {
      lastBeat.current = heartbeatRef.current;
      beatFlash.current = 1.0;
    }
    beatFlash.current *= 0.88;

    let tissueOpacity, bronchiOpacity;
    if (hovered) {
      tissueOpacity = 0.62;
      bronchiOpacity = 0.75;
    } else if (breathingMode) {
      tissueOpacity = 0.38;
      bronchiOpacity = 0.32;
    } else if (powerMode) {
      tissueOpacity = 0.12;
      bronchiOpacity = 0.48;
    } else if (unifiedMode) {
      tissueOpacity = 0.22;
      bronchiOpacity = 0.32;
    } else if (meshMode === 2 || meshMode === 4) {
      tissueOpacity = 0.18;
      bronchiOpacity = 0.22;
    } else if (ghostMode) {
      tissueOpacity = 0.22;
      bronchiOpacity = 0.26;
    } else if (meshMode === 1) {
      tissueOpacity = 0.1;
      bronchiOpacity = 0.14;
    } else {
      tissueOpacity = 0.0;
      bronchiOpacity = 0.0;
    }

    // Tissue iridescent color shift:
    // exhale (breath=0) → deep violet hue 0.78
    // full inhale (breath=1) → luminous cyan hue 0.50
    // + slow independent drift for iridescence
    const breathHue = 0.78 - breath * 0.28;
    const drift = Math.sin(t * 0.4) * 0.04 + Math.sin(t * 0.13) * 0.03;
    const hue = breathHue + drift;
    const sat = breathingMode ? 0.9 : unifiedMode ? 0.7 : 0.6;
    const light = breathingMode ? 0.45 + breath * 0.2 : 0.35;
    const tissueEmissive = breathingMode
      ? 0.12 + breath * 0.28
      : unifiedMode
        ? 0.06
        : ghostMode
          ? 0.03
          : 0.0;

    for (const m of tissue) {
      m.opacity += (tissueOpacity - m.opacity) * 0.06;
      m.emissive.setHSL(hue, sat, light);
      m.emissiveIntensity += (tissueEmissive - m.emissiveIntensity) * 0.06;
    }

    // Bronchi — iridescent arterial pulse: crimson at rest, warm orange-red on heartbeat
    const bronchiEmissive =
      powerMode || unifiedMode
        ? 0.3 + beatFlash.current * 1.2
        : breathingMode
          ? 0.1 + beatFlash.current * 0.8
          : beatFlash.current * 0.8;
    // Hue drifts: dark crimson (0.0) → warm arterial orange-red (0.05) on beat flash
    // Slow breath drift adds a subtle violet-magenta undertone at exhale
    const bronchiHue = 0.02 + beatFlash.current * 0.03 + (1 - breath) * 0.015;

    for (const m of bronchi) {
      m.opacity += (bronchiOpacity - m.opacity) * 0.06;
      m.emissive.setHSL(bronchiHue, 1.0, 0.5);
      m.emissiveIntensity += (bronchiEmissive - m.emissiveIntensity) * 0.12;
    }

    // Hardware lung — anodized aluminum tissue with PCB-trace emissive glow
    // Hue cycles: teal (0.48) at exhale → gold-green (0.20) at inhale, slow data-flow drift
    const hwDrift = Math.sin(t * 0.6) * 0.06 + Math.sin(t * 0.17) * 0.04;
    const hwHue = 0.48 - breath * 0.28 + hwDrift;
    const hwSat = breathingMode ? 0.95 : 0.8;
    const hwLight = breathingMode ? 0.42 + breath * 0.18 : 0.38;
    const hwTissueEmissive = breathingMode
      ? 0.1 + breath * 0.22
      : unifiedMode
        ? 0.06
        : ghostMode
          ? 0.03
          : 0.0;

    for (const m of hwTissue) {
      m.opacity += (tissueOpacity - m.opacity) * 0.06;
      m.emissive.setHSL(hwHue, hwSat, hwLight);
      m.emissiveIntensity += (hwTissueEmissive - m.emissiveIntensity) * 0.06;
    }

    // Hardware bronchi — copper traces, flash gold on heartbeat
    const hwBronchiEmissive =
      powerMode || unifiedMode
        ? 0.25 + beatFlash.current * 1.0
        : breathingMode
          ? 0.08 + beatFlash.current * 0.7
          : beatFlash.current * 0.7;
    // Copper (0.07) → bright gold (0.12) on beat flash
    const hwBronchiHue = 0.07 + beatFlash.current * 0.05;

    for (const m of hwBronchi) {
      m.opacity += (bronchiOpacity - m.opacity) * 0.06;
      m.emissive.setHSL(hwBronchiHue, 1.0, 0.5);
      m.emissiveIntensity += (hwBronchiEmissive - m.emissiveIntensity) * 0.12;
    }

    // Breathing scale — expand/contract with breath
    const breathMult = breathingMode ? 1 + breath * 0.06 : 1;
    const targetScale = baseScaleRef.current * breathMult;
    scene.scale.setScalar(scene.scale.x + (targetScale - scene.scale.x) * 0.04);
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/lungs-red-hybrid.glb");

export default LungsModel;
