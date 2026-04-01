import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TARGET_HEIGHT = 1.75;

function AnatomyModel({ viewMode }) {
  const { scene } = useGLTF("/male-body.glb");
  const materialRef = useRef(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;

    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);

    // Harvest first available map from GLB to use as emissive mask.
    // AO map settles glow into crevices/valleys; roughness map works similarly.
    let emissiveMap = null;
    scene.traverse((child) => {
      if (child.isMesh && !emissiveMap) {
        const m = child.material;
        emissiveMap = m?.aoMap ?? m?.roughnessMap ?? null;
      }
    });

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#050505"),
      transparent: true,
      transmission: 0.9,
      opacity: 0.4,
      roughness: 0.2,
      depthWrite: false,
      emissive: new THREE.Color("#880000"),
      emissiveIntensity: 0,
    });

    if (emissiveMap) mat.emissiveMap = emissiveMap;

    materialRef.current = mat;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 0;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle underlayer — complements the aorta surge without competing
    let base = 0;
    if (viewMode === "power") base = 0.55;
    else if (viewMode === "unified") base = 0.25;

    const pulse = base > 0 ? Math.sin(t * 1.2) * 0.15 * base : 0;
    const target = base + pulse;

    materialRef.current.emissiveIntensity +=
      (target - materialRef.current.emissiveIntensity) * 0.05;
  });

  return <primitive object={scene} />;
}

useGLTF.preload("/male-body.glb");

export default AnatomyModel;
