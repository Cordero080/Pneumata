import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BRAIN_TARGET = new THREE.Vector3(0, 1.655, 0);
const LERP = 0.055;
const SETTLED = 0.0008;

// Slider value 0 (knob top) = viewing head, 1 (knob bottom) = viewing legs
const PAN_Y_TOP = 1.65;
const PAN_Y_BOTTOM = 0.1;

// Slider value 0 (knob top) = close, 1 (knob bottom) = far
const ZOOM_NEAR = 0.9;
const ZOOM_FAR = 4.0;

function CameraController({ brainZoom, controlsRef, panY = 0.5, zoom = 0.33 }) {
  const { camera } = useThree();
  const animating = useRef(false);
  const panYRef = useRef(panY);
  const zoomRef = useRef(zoom);
  const zoomDirty = useRef(false);

  // Keep refs current without triggering re-renders
  panYRef.current = panY;
  zoomRef.current = zoom;

  // Mark zoom dirty whenever the slider changes so we lerp to it once
  const prevZoom = useRef(zoom);
  if (prevZoom.current !== zoom) {
    zoomDirty.current = true;
    prevZoom.current = zoom;
  }

  useEffect(() => {
    animating.current = true;
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.minDistance = brainZoom ? 0.12 : ZOOM_NEAR;
      ctrl.maxDistance = brainZoom ? 0.6 : ZOOM_FAR;
    }
  }, [brainZoom, controlsRef]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    if (brainZoom) {
      ctrl.target.lerp(BRAIN_TARGET, LERP);
      ctrl.update();
      if (!animating.current) return;
      if (ctrl.target.distanceTo(BRAIN_TARGET) < SETTLED) {
        ctrl.target.copy(BRAIN_TARGET);
        ctrl.update();
        animating.current = false;
      }
      return;
    }

    // Pan — always apply so slider owns vertical position
    const targetY = PAN_Y_TOP - panYRef.current * (PAN_Y_TOP - PAN_Y_BOTTOM);
    ctrl.target.y += (targetY - ctrl.target.y) * LERP;

    // Zoom — only apply while dirty; scroll wheel works freely otherwise
    if (zoomDirty.current) {
      const targetDist = ZOOM_NEAR + zoomRef.current * (ZOOM_FAR - ZOOM_NEAR);
      const currentDist = camera.position.distanceTo(ctrl.target);
      if (Math.abs(currentDist - targetDist) < 0.015) {
        zoomDirty.current = false;
      } else {
        const dir = camera.position.clone().sub(ctrl.target).normalize();
        const newDist = currentDist + (targetDist - currentDist) * LERP;
        camera.position.copy(ctrl.target).addScaledVector(dir, newDist);
      }
    }

    ctrl.update();
  });

  return null;
}

export default CameraController;
