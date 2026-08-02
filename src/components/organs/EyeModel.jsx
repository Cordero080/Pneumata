import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// === MALE EYES — tweak these ===
// The two eye OrganNode markers live at these coords in data/organs.js.
// We drop the 3D eyeball at the same spot (z a hair deeper = "behind" the node).
const EYE_Y = 1.64; // up (+) / down (-)
const EYE_X = 0.032; // half the inter-eye gap — right eye = -EYE_X, left = +EYE_X
const EYE_Z = 0.075; // forward (+) / back into skull (-); node sits at 0.08
const TARGET_HEIGHT = 0.03; // eyeball diameter in world units — increase to enlarge

// === FEMALE EYES — female skull sits lower/smaller (matches meridian BL-1 data) ===
const EYE_Y_FEMALE = 1.58;
const EYE_X_FEMALE = 0.032;
const EYE_Z_FEMALE = 0.068;
const TARGET_HEIGHT_FEMALE = 0.032;

// Facing rotation of the eyeball (radians). The GLB's "front" may not be +Z,
// so these let us aim the pupil forward without re-exporting the model.
const EYE_ROT_X = 0;
const EYE_ROT_Y = 0;
const EYE_ROT_Z = 0;

// === WHOLE-EYE COLOR & BRIGHTNESS ===
// The eye is a single textured material, so we treat the whole eyeball:
//   TINT  — multiplies the texture to push it toward EYE_COLOR (adds saturation)
//   LIGHTEN — uniform self-illumination in EYE_COLOR so the eye reads brighter,
//             independent of scene lighting. We null the emissiveMap first so
//             this lifts the ENTIRE eye, not just the (invisible) iris map region.
const EYE_COLOR = "#ff5fd4f6"; // the color to push the eye toward
const EYE_TINT = 0.75; // 0 = keep texture as-is, 1 = fully EYE_COLOR
const EYE_LIGHTEN = 0.02; // 0 = no extra light, ~0.3–0.6 = a soft lift

function EyeModel({ femaleMode }) {
  const gltf = useGLTF("/models/organs/pneuma-eye.opt.glb");

  // Build both eyes once. useMemo so we don't re-clone every render.
  // Re-runs only if the source scene or femaleMode changes.
  const eyes = useMemo(() => {
    const th = femaleMode ? TARGET_HEIGHT_FEMALE : TARGET_HEIGHT;
    const ex = femaleMode ? EYE_X_FEMALE : EYE_X;
    const ey = femaleMode ? EYE_Y_FEMALE : EYE_Y;
    const ez = femaleMode ? EYE_Z_FEMALE : EYE_Z;

    // Measure the raw GLB once to derive a uniform scale + recentering offset.
    // Never mutate gltf.scene directly (it's cached) — measure on a throwaway clone.
    const probe = gltf.scene.clone(true);
    probe.rotation.set(0, 0, 0);
    probe.scale.set(1, 1, 1);
    probe.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(probe);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = size.y > 0 ? th / size.y : 1; // scale to target height (guard /0)

    // Make one eye clone anchored at a given world x. center.* * s removes the
    // model's own off-origin pivot so it lands exactly on our coordinate.
    const eyeColor = new THREE.Color(EYE_COLOR);
    const white = new THREE.Color(1, 1, 1);

    const makeEye = (worldX) => {
      const eye = gltf.scene.clone(true);
      eye.scale.setScalar(s);
      eye.rotation.set(EYE_ROT_X, EYE_ROT_Y, EYE_ROT_Z);
      eye.position.set(
        worldX - center.x * s,
        ey - center.y * s,
        ez - center.z * s,
      );

      // clone() shares material objects with the cached GLB — mutating them
      // would poison the cache. Clone each material, then color the whole eye.
      eye.traverse((child) => {
        if (!child.isMesh) return;
        const m = child.material.clone();
        // Tint: baseColor multiplies the texture, so lerp white→EYE_COLOR to
        // push the whole eye toward the color (white = texture unchanged).
        if (m.color) m.color.copy(white).lerp(eyeColor, EYE_TINT);
        // Lighten: null the emissive MAP so the glow isn't masked to the iris,
        // then self-illuminate the entire eyeball in EYE_COLOR.
        m.emissiveMap = null;
        m.emissive = eyeColor;
        m.emissiveIntensity = EYE_LIGHTEN;
        child.material = m;
      });

      return eye;
    };

    return [makeEye(-ex), makeEye(ex)]; // right eye (−x), left eye (+x)
  }, [gltf.scene, femaleMode]);

  return (
    <>
      {eyes.map((eye, i) => (
        <primitive key={i} object={eye} />
      ))}
    </>
  );
}

// Warm the cache so the eyes pop in without a hitch on first view.
useGLTF.preload("/models/organs/pneuma-eye.opt.glb");

export default EyeModel;
