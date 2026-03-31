import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#050505"),
  transparent: true,
  transmission: 0.9,
  opacity: 0.4,
  roughness: 0.2,
  depthWrite: false,
});

// Normalize to 1.75 units tall so organ coordinates from organs.js
// (authored at ~1.75m scale) map directly onto the figure.
const TARGET_HEIGHT = 1.75;

function AnatomyModel() {
  const { scene } = useGLTF("/male-body.glb");

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;

    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = glassMaterial;
        child.renderOrder = 0;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

useGLTF.preload("/male-body.glb");

export default AnatomyModel;
