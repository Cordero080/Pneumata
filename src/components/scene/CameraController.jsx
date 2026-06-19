import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── CAMERA SMOOTHING ─────────────────────────────────────────────────────────
// LERP: fraction of remaining distance moved per frame (higher = snappier).
// SETTLED: distance threshold below which the camera is considered "arrived".
const LERP = 0.055;
const SETTLED = 0.0008;

const IS_MOBILE = window.innerWidth <= 768;
// On mobile the scene group has a larger offsetY, so the brain's world position
// sits higher than on desktop. Raise camera and target to compensate.
const MOBILE_BRAIN_Y = IS_MOBILE ? 0.07 : 0;

// ── BRAIN ZOOM TARGETS ───────────────────────────────────────────────────────
// World-space Y the camera orbit target snaps to during brain zoom.
// Raise Y to push the figure down in frame; lower Y to push it up.
// CELL target is slightly lower than BRAIN target (zooms into the cellular view).
// The female GLB head sits lower in world space than the male — FEMALE_Y_OFFSET corrects for that.
const MALE_HEAD_Y = 1.672;
const FEMALE_HEAD_Y = 1.615;
const FEMALE_Y_OFFSET = FEMALE_HEAD_Y - MALE_HEAD_Y;
const MALE_BRAIN_TARGET = new THREE.Vector3(0, 1.45 + MOBILE_BRAIN_Y, 0);
const MALE_CELL_TARGET = new THREE.Vector3(0, 1.41 + MOBILE_BRAIN_Y, 0);
const FEMALE_BRAIN_TARGET = new THREE.Vector3(
  0,
  1.45 + FEMALE_Y_OFFSET + MOBILE_BRAIN_Y,
  0,
);
const FEMALE_CELL_TARGET = new THREE.Vector3(
  0,
  1.41 + FEMALE_Y_OFFSET + MOBILE_BRAIN_Y,
  0,
);

// ── PAN & ZOOM RANGE ─────────────────────────────────────────────────────────
// Slider value 0 = top of range, 1 = bottom. Change these to adjust how far
// the user can pan/zoom. PAN is a world-space Y target; ZOOM is camera Z distance.
const PAN_Y_TOP = 1.65;
const PAN_Y_BOTTOM = 0.1;
const ZOOM_NEAR = 0.9;
const ZOOM_FAR = 4.0;

// ── INITIAL CAMERA POSITION ──────────────────────────────────────────────────
// Starting camera position when the scene loads or resets.
// z controls how far back the camera starts (higher = more zoomed out).
const INITIAL_CAM = IS_MOBILE
  ? { x: 0, y: 0.82, z: 1.9 }
  : { x: 0, y: 0.82, z: 2.1 };

// Distance the camera moves to when focusing on a torso organ on click.
// Must be less than INITIAL_CAM.z (~2.0) or it will zoom OUT instead of in.
const TORSO_FOCUS_DIST = 1.5;

function CameraController({
  brainZoom,
  cellZoom,
  cellTarget,
  controlsRef,
  panY = 0.5,
  zoom = 0.33,
  resetKey = 0,
  organFocusY = null,
  organFocusDistance = null,
  viewPanelOpen = false,
  femaleMode = false,
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

  // Mark zoom dirty when organ focus ends so camera pulls back to slider distance
  const prevOrganFocusY = useRef(organFocusY);
  if (prevOrganFocusY.current !== null && organFocusY === null) {
    zoomDirty.current = true;
  }
  prevOrganFocusY.current = organFocusY;

  useEffect(() => {
    animating.current = true;
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    ctrl.minDistance = cellZoom ? 0.01 : brainZoom ? 0.12 : ZOOM_NEAR;
    ctrl.maxDistance = cellZoom ? 0.8 : brainZoom ? 0.6 : ZOOM_FAR;
    camera.near = cellZoom ? 0.001 : 0.1;
    camera.updateProjectionMatrix();
    const yo = femaleMode ? FEMALE_Y_OFFSET : 0;
    if (cellZoom) {
      camera.position.set(0, 1.41 + yo + MOBILE_BRAIN_Y, 0.32);
      ctrl.target.set(0, 1.41 + yo + MOBILE_BRAIN_Y, 0);
      ctrl.update();
    } else if (brainZoom) {
      // Brain path initial zoom: z = distance from brain (lower = closer). Match Y to MALE_BRAIN_TARGET.
      camera.position.set(0, 1.45 + yo + MOBILE_BRAIN_Y, 0.35);
      ctrl.target.set(0, 1.45 + yo + MOBILE_BRAIN_Y, 0);
      ctrl.update();
    }
  }, [brainZoom, cellZoom, femaleMode, controlsRef, camera]);

  // On reset: directly snap camera back to initial position + target.
  // This works regardless of how the user moved the camera (slider, scroll,
  // pinch, or orbit drag) because we bypass the dirty-flag system entirely
  // and just tell Three.js where the camera should be.
  useEffect(() => {
    if (resetKey === 0) return;
    if (brainZoom || cellZoom) return;
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    camera.position.set(INITIAL_CAM.x, INITIAL_CAM.y, INITIAL_CAM.z);
    ctrl.target.set(0, 0.85, 0);
    ctrl.update();
    zoomDirty.current = true;
  }, [resetKey, camera, controlsRef]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    if (cellZoom || brainZoom) {
      const BRAIN_TARGET = femaleMode ? FEMALE_BRAIN_TARGET : MALE_BRAIN_TARGET;
      const CELL_TARGET = femaleMode ? FEMALE_CELL_TARGET : MALE_CELL_TARGET;
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
      // Keep camera Y level with orbit target to prevent foreshortening during entry
      camera.position.y = ctrl.target.y;
      if (animating.current && ctrl.target.distanceTo(target) < SETTLED)
        animating.current = false;
      ctrl.autoRotateSpeed = 0.5;
    } else {
      // Normal mode — pan targets absolute Y on the body
      const panelOffset = 0.02;
      const targetY =
        organFocusY !== null
          ? organFocusY - 0.4
          : PAN_Y_TOP -
            panYRef.current * (PAN_Y_TOP - PAN_Y_BOTTOM) +
            panelOffset;
      ctrl.target.y += (targetY - ctrl.target.y) * LERP;
      ctrl.autoRotateSpeed = 0.5;
    }

    // Zoom — map slider to the active mode's distance range
    const zoomMin = cellZoom ? 0.05 : brainZoom ? 0.12 : ZOOM_NEAR;
    const zoomMax = cellZoom ? 0.35 : brainZoom ? 0.6 : ZOOM_FAR;
    if (!cellZoom && !brainZoom && organFocusY !== null) {
      const focusDist = organFocusDistance ?? TORSO_FOCUS_DIST;
      const currentDist = camera.position.distanceTo(ctrl.target);
      if (Math.abs(currentDist - focusDist) > 0.01) {
        const dir = camera.position.clone().sub(ctrl.target).normalize();
        const newDist = currentDist + (focusDist - currentDist) * LERP;
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
