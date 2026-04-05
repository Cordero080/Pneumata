import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FULL_CAM_POS = new THREE.Vector3(0, 0.82, 2.1);
const FULL_TARGET = new THREE.Vector3(0, 0.85, 0);
const BRAIN_CAM_POS = new THREE.Vector3(0, 1.655, 0.38);
const BRAIN_TARGET = new THREE.Vector3(0, 1.655, 0);
const LERP = 0.055;
const SETTLED = 0.0008;

function CameraController({ brainZoom, controlsRef }) {
  const { camera } = useThree();
  const animating = useRef(false);

  useEffect(() => {
    animating.current = true;
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.minDistance = brainZoom ? 0.12 : 0.9;
      ctrl.maxDistance = brainZoom ? 0.6 : 7;
    }
  }, [brainZoom, controlsRef]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl || !animating.current) return;

    const targetOrbit = brainZoom ? BRAIN_TARGET : FULL_TARGET;
    ctrl.target.lerp(targetOrbit, LERP);
    ctrl.update();

    if (ctrl.target.distanceTo(targetOrbit) < SETTLED) {
      ctrl.target.copy(targetOrbit);
      ctrl.update();
      animating.current = false;
    }
  });

  return null;
}

export default CameraController;
