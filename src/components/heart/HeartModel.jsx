import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HEART_CENTER_X = 0.01;
const HEART_CENTER_Y = 1.32;
const HEART_CENTER_Z = 0.06;
const TARGET_HEIGHT = 0.13;

function HeartModel({ meshMode, viewMode, hoveredOrganId, heartbeatRef }) {
  const gltf = useGLTF("/rose-heart.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const matsRef = useRef([]);
  const beatRef = useRef({ last: 0, flash: 0 });

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
        const prev = child.material;
        const m = new THREE.MeshStandardMaterial({
          color: prev.color ?? new THREE.Color("#c04040"),
          map: prev.map ?? null,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          emissive: new THREE.Color("#ff2200"),
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
  }, [scene]);

  useFrame(() => {
    const mats = matsRef.current;
    if (!mats.length) return;

    const ghostMode = meshMode === 0 || meshMode === 3;
    const hovered = hoveredOrganId === "heart";
    const powerMode = viewMode === "power";

    let baseOpacity;
    if (hovered) {
      baseOpacity = 0.95;
    } else if (meshMode === 2 || meshMode === 4 || meshMode === 5) {
      baseOpacity = powerMode ? 0.88 : 0.35;
    } else if (ghostMode) {
      baseOpacity = powerMode ? 0.82 : 0.45;
    } else if (meshMode === 1) {
      baseOpacity = 0.25;
    } else {
      baseOpacity = 0.0;
    }

    const b = beatRef.current;
    if (heartbeatRef && heartbeatRef.current !== b.last) {
      b.last = heartbeatRef.current;
      b.flash = 1.0;
    }
    b.flash *= 0.88;

    for (const m of mats) {
      m.opacity += (baseOpacity - m.opacity) * 0.06;
      if (m.emissive !== undefined) {
        m.emissive.set("#cc0011");
      }
      if (m.emissiveIntensity !== undefined) {
        const target = (powerMode ? 0.8 : 0.0) + b.flash * 8.0;
        m.emissiveIntensity += (target - m.emissiveIntensity) * 0.2;
        m.needsUpdate = true;
      }
    }
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/rose-heart.glb");

export default HeartModel;
