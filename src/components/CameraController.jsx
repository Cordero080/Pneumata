import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const LERP = 0.055;
const SETTLED = 0.0008;

const BRAIN_TARGET = new THREE.Vector3(0, 1.55, 0);
const CELL_TARGET = new THREE.Vector3(0, 1.61, 0);

// Slider value 0 (knob top) = viewing head, 1 (knob bottom) = viewing legs
const PAN_Y_TOP = 1.65;
const PAN_Y_BOTTOM = 0.1;

// Slider value 0 (knob top) = close, 1 (knob bottom) = far
const ZOOM_NEAR = 0.9;
const ZOOM_FAR = 4.0;

const INITIAL_CAM = { x: 0, y: 0.82, z: 2.1 };

const TORSO_FOCUS_DIST = 1.45;

function CameraController({
  brainZoom,
  cellZoom,
  cellTarget,
  controlsRef,
  panY = 0.5,
  zoom = 0.33,
  resetKey = 0,
  organFocusY = null,
  viewPanelOpen = false,
}) {
  const { camera } = useThree();
  const animating = useRef(false);
  const panYRef = useRef(panY);
  const zoomRef = useRef(zoom);
  const zoomDirty = useRef(false);
  const cellTargetVec = useRef(new THREE.Vector3());

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
    if (!ctrl) return;
    ctrl.minDistance = cellZoom ? 0.1 : brainZoom ? 0.12 : ZOOM_NEAR;
    ctrl.maxDistance = cellZoom ? 0.8 : brainZoom ? 0.6 : ZOOM_FAR;
    if (cellZoom) {
      camera.position.set(0, 1.61, 0.5);
      ctrl.target.set(0, 1.61, 0);
      ctrl.update();
    } else if (brainZoom) {
      // Snap to frontal position — directly in front of brain at eye level
      camera.position.set(0, 1.62, 0.55);
      ctrl.target.set(0, 1.55, 0);
      ctrl.update();
    }
  }, [brainZoom, cellZoom, controlsRef, camera]);

  // On reset: directly snap camera back to initial position + target.
  // This works regardless of how the user moved the camera (slider, scroll,
  // pinch, or orbit drag) because we bypass the dirty-flag system entirely
  // and just tell Three.js where the camera should be.
  useEffect(() => {
    if (resetKey === 0) return;
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    camera.position.set(INITIAL_CAM.x, INITIAL_CAM.y, INITIAL_CAM.z);
    ctrl.target.set(0, 0.85, 0);
    ctrl.update();
    zoomDirty.current = false;
  }, [resetKey, camera, controlsRef]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    if (cellZoom || brainZoom) {
      const target =
        cellZoom && cellTarget
          ? cellTargetVec.current.set(...cellTarget)
          : cellZoom
            ? CELL_TARGET
            : BRAIN_TARGET;
      ctrl.target.x += (target.x - ctrl.target.x) * LERP;
      ctrl.target.z += (target.z - ctrl.target.z) * LERP;
      // Pan offsets Y relative to cell/brain target. Default pan (0.5) = zero offset.
      const panOffset = (0.5 - panYRef.current) * 0.4;
      ctrl.target.y += (target.y + panOffset - ctrl.target.y) * LERP;
      if (animating.current && ctrl.target.distanceTo(target) < SETTLED)
        animating.current = false;
      ctrl.autoRotateSpeed = cellZoom ? 0 : 0.5;
    } else {
      // Normal mode — pan targets absolute Y on the body
      const panelOffset = viewPanelOpen ? 0.06 : 0.07;
      const targetY =
        organFocusY !== null
          ? organFocusY
          : PAN_Y_TOP -
            panYRef.current * (PAN_Y_TOP - PAN_Y_BOTTOM) +
            panelOffset;
      ctrl.target.y += (targetY - ctrl.target.y) * LERP;
    }

    // Zoom — map slider to the active mode's distance range
    const zoomMin = cellZoom ? 0.05 : brainZoom ? 0.12 : ZOOM_NEAR;
    const zoomMax = cellZoom ? 0.35 : brainZoom ? 0.6 : ZOOM_FAR;
    if (!cellZoom && !brainZoom && organFocusY !== null) {
      const currentDist = camera.position.distanceTo(ctrl.target);
      if (Math.abs(currentDist - TORSO_FOCUS_DIST) > 0.01) {
        const dir = camera.position.clone().sub(ctrl.target).normalize();
        const newDist = currentDist + (TORSO_FOCUS_DIST - currentDist) * LERP;
        camera.position.copy(ctrl.target).addScaledVector(dir, newDist);
      }
    } else if (zoomDirty.current) {
      const targetDist = zoomMin + zoomRef.current * (zoomMax - zoomMin);
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
