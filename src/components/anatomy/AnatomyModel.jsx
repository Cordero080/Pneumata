import { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as maleConfig from "./male/male-config";
import * as femaleConfig from "./female/female-config";
import { BODY_TARGET_HEIGHT } from "../../data/sizing";
import { getMeshStyle } from "./modes/meshStyles";
import { applyMeshStyle } from "./modes/applyMeshStyle";
import {
  sampleSpinePoints,
  sampleExtremities,
  sampleBodyLandmarks,
} from "./calibration";
import "./male/MaleModel.scss";

const IS_MOBILE = window.innerWidth <= 768;

const BREATH_BLUE = new THREE.Color("#334499");
const BREATH_CYAN = new THREE.Color("#b0e8ff");
const EMISSIVE_WHITE = new THREE.Color("#ffffff");
const EMISSIVE_POWER = new THREE.Color("#bd0404");

function AnatomyModel({
  modelPath = "/models/body/male-body.glb",
  viewMode,
  onSpineExtracted,
  onLandmarksExtracted,
  heartbeatRef,
  breathingRef,
  darkMode,
  meshMode,
  femaleMode,
  organWindowPositions = [],
}) {
  // Config is constant for this component's lifetime — AnatomyModel remounts (key=modelPath)
  // whenever femaleMode changes, so this selection never changes mid-lifecycle.
  const config = femaleMode ? femaleConfig : maleConfig;

  const gltf = useGLTF(modelPath);
  const materialRef = useRef(null);
  // Uniform objects live in the ref from creation. onBeforeCompile merges them into
  // shader.uniforms via Object.assign — same object reference — so updating the ref
  // always updates the GPU, with no dependency on onBeforeCompile timing.
  const onyxUniformsRef = useRef({
    uOrganPos: {
      value: Array.from({ length: 12 }, () => new THREE.Vector3(0, -100, 0)),
    },
    uFadeRadius: { value: 0.12 },
    uOnyxFade: { value: 0.0 },
    uRegionFade: { value: 0.0 },
    uHeadYBot: { value: 1.55 },
    uHeadYTop: { value: 1.63 },
    uTorsoYBot: { value: 0.9 },
    uTorsoYTop: { value: 1.38 },
  });
  const bloodMatRef = useRef(null);
  const bloodPulseRef = useRef(0);
  const lastBeatCountRef = useRef(0);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const raw = config.RAW;
    const s = (BODY_TARGET_HEIGHT * config.HEIGHT_SCALE) / raw.height;
    cloned.scale.setScalar(s);
    cloned.position.set(
      -raw.centerX * s,
      -raw.yMin * s + config.Y_OFFSET,
      -raw.centerZ * s,
    );
    // Apply ghost material immediately so frame 1 never shows raw GLB materials
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eef2f6"),
      transparent: true,
      transmission: 0,
      opacity: 0.13,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      iridescence: 0.001,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 280],
      depthWrite: false,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
    });
    materialRef.current = mat;
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 1;
      }
    });
    return cloned;
  }, [gltf.scene]);
  const [bloodScene, setBloodScene] = useState(null);
  const breathMatRef = useRef(null);
  const [breathScene, setBreathScene] = useState(null);
  const aluminumMatRef = useRef(null);
  const [aluminumScene, setAluminumScene] = useState(null);
  const [sheenScene, setSheenScene] = useState(null);

  useEffect(() => {
    setBloodScene(null);
    setBreathScene(null);
    setAluminumScene(null);
    setSheenScene(null);

    const raw = config.RAW;
    const s = (BODY_TARGET_HEIGHT * config.HEIGHT_SCALE) / raw.height;

    // Scale/position already applied in useMemo; re-apply here in case effect runs
    // after a hot-reload or future change that resets the scene transform.
    scene.scale.setScalar(s);
    scene.position.set(
      -raw.centerX * s,
      -raw.yMin * s + config.Y_OFFSET,
      -raw.centerZ * s,
    );
    scene.updateMatrixWorld(true);

    let emissiveMap = null;
    scene.traverse((child) => {
      if (child.isMesh && !emissiveMap) {
        const m = child.material;
        emissiveMap = m?.aoMap ?? m?.roughnessMap ?? null;
      }
    });

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eef2f6"),
      transparent: true,
      transmission: 0,
      opacity: 0.13,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      iridescence: 0.001,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 280],
      depthWrite: false,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0,
    });

    if (emissiveMap) mat.emissiveMap = emissiveMap;

    // Organ window shader — creates pulsing transparent holes near organ positions in onyx mode
    // onyxUniformsRef holds the actual uniform objects. onBeforeCompile merges them into
    // shader.uniforms (same references), so useFrame updates propagate to the GPU immediately.
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, onyxUniformsRef.current);
      shader.vertexShader = "varying vec3 vOnyxWorld;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
vOnyxWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
      shader.fragmentShader =
        "varying vec3 vOnyxWorld;\nuniform vec3 uOrganPos[12];\nuniform float uFadeRadius;\nuniform float uOnyxFade;\nuniform float uRegionFade;\nuniform float uHeadYBot;\nuniform float uHeadYTop;\nuniform float uTorsoYBot;\nuniform float uTorsoYTop;\n" +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `#include <output_fragment>
if (uOnyxFade > 0.0) {
  float _f = 1.0;
  for (int i = 0; i < 12; i++) {
    float _d = length(vOnyxWorld - uOrganPos[i]);
    _f *= smoothstep(uFadeRadius * 0.35, uFadeRadius, _d);
  }
  float _a = 1.0 - uOnyxFade * (1.0 - _f);
  if (_a < 0.02) discard;
  gl_FragColor.a *= _a;
}
if (uRegionFade > 0.0) {
  float _head = smoothstep(uHeadYBot, uHeadYTop, vOnyxWorld.y);
  float _tIn = smoothstep(uTorsoYBot - 0.04, uTorsoYBot + 0.04, vOnyxWorld.y);
  float _tOut = 1.0 - smoothstep(uTorsoYTop - 0.04, uTorsoYTop + 0.04, vOnyxWorld.y);
  float _rt = uRegionFade * max(_head, _tIn * _tOut);
  gl_FragColor.a *= (1.0 - _rt);
  if (gl_FragColor.a < 0.02) discard;
}`,
      );
    };
    mat.customProgramCacheKey = () => "onyx-organ-windows-v2";

    mat.needsUpdate = true;
    materialRef.current = mat;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 1;
      }
    });

    // Spine — male uses hardcoded points, female samples dynamically
    if (!config.SPINE_OPTS) {
      if (onSpineExtracted) onSpineExtracted(config.MALE_SPINE_POINTS);
    } else {
      const spinePoints = sampleSpinePoints(scene, 24, config.SPINE_OPTS);
      if (spinePoints && onSpineExtracted) onSpineExtracted(spinePoints);
    }

    const landmarks = sampleBodyLandmarks(scene, config.HEIGHT_SCALE);
    if (onLandmarksExtracted) onLandmarksExtracted(landmarks);

    // Body extremity sampler — logs per-2cm y-slice arm centroid and outer edge.
    // Open the "[ExtremitySampler]" group in DevTools to calibrate meridian coordinates.
    sampleExtremities(scene);

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8d5e0"),
      metalness: 0.88,
      roughness: 0.15,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
    });
    aluminumMatRef.current = aluminumMat;

    const aluminumClone = scene.clone(true);
    aluminumClone.traverse((child) => {
      if (child.isMesh) {
        child.material = aluminumMat;
        child.renderOrder = 0;
      }
    });
    setAluminumScene(aluminumClone);

    const bloodMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#4d1515"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });
    bloodMatRef.current = bloodMat;

    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = bloodMat;
        child.renderOrder = 2;
      }
    });
    setBloodScene(clone);

    const breathMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#334499"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });
    breathMatRef.current = breathMat;

    const breathClone = scene.clone(true);
    breathClone.traverse((child) => {
      if (child.isMesh) {
        child.material = breathMat;
        child.renderOrder = 3;
      }
    });
    setBreathScene(breathClone);

    // Sync dark mode immediately in case it was active before this async GLB load resolved
    if (darkMode) {
      // Colors come from male-config.js or female-config.js → COLORS object. Change colors there.
      // "mat" = ghost/base layer. "al" = aluminum layer on top.
      mat.color.set(config.COLORS.obsColor);
      mat.emissive.set(config.COLORS.obsEmissive);
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.opacity = 0.2;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
      mat.needsUpdate = true;
      aluminumMat.opacity = 0;
      aluminumMat.needsUpdate = true;
    }
  }, [scene]);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    const { obsColor, obsEmissive, ghostColor, alColor } = config.COLORS;

    if (darkMode) {
      mat.color.set(obsColor);
      mat.emissive.set(obsEmissive);
      mat.metalness = 0.92;
      mat.roughness = 0.08;
      mat.transmission = 0;
      mat.opacity = 0.82;
      mat.iridescence = 0.45;
      mat.iridescenceIOR = 1.32;
      mat.iridescenceThicknessRange = [120, 280];
      mat.clearcoat = 0.9;
      mat.clearcoatRoughness = 0.08;
      if (aluminumMatRef.current) {
        aluminumMatRef.current.opacity = 0;
        aluminumMatRef.current.depthWrite = false;
        aluminumMatRef.current.needsUpdate = true;
      }
    } else {
      mat.color.set(ghostColor);
      mat.metalness = 0;
      mat.roughness = 0.2;
      mat.transmission = 0;
      mat.opacity = 0.13;
      mat.iridescence = 0.001;
      mat.clearcoat = 0.5;
      mat.clearcoatRoughness = 0.1;
      mat.emissive.set("#ffffff");
      mat.emissiveIntensity = 0;
      if (aluminumMatRef.current) {
        aluminumMatRef.current.color.set(alColor);
        aluminumMatRef.current.opacity = 0.95;
        aluminumMatRef.current.depthWrite = true;
        aluminumMatRef.current.needsUpdate = true;
      }
    }
    mat.needsUpdate = true;
  }, [darkMode, femaleMode]);

  useEffect(() => {
    const mat = materialRef.current;
    const al = aluminumMatRef.current;
    if (!mat || !al) return;

    // uOnyxFade/uRegionFade are managed in useFrame to avoid onBeforeCompile timing race.
    // Recipes for every meshMode × theme live in ./modes/meshStyles.js
    applyMeshStyle(mat, al, getMeshStyle(meshMode, darkMode, config.COLORS));
  }, [meshMode, darkMode, femaleMode]);

  // Sheen layer — female only: upper-body velvet/peach-fuzz, fades out at waist
  useEffect(() => {
    if (!config.HAS_SHEEN) {
      setSheenScene(null);
      return;
    }

    const sheenMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d8c0d0"),
      metalness: 0.1,
      roughness: 0.4,
      sheen: 0.6,
      sheenColor: new THREE.Color("#e0c8d8"),
      sheenRoughness: 0.3,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });

    sheenMat.onBeforeCompile = (shader) => {
      shader.vertexShader = "varying float vSheenFade;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 _wp = modelMatrix * vec4(position, 1.0);
        vSheenFade = smoothstep(0.5, 0.92, _wp.y);`,
      );
      shader.fragmentShader =
        "varying float vSheenFade;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `#include <output_fragment>
        gl_FragColor.a *= vSheenFade;`,
      );
    };

    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = sheenMat;
        child.renderOrder = 6;
      }
    });
    setSheenScene(clone);
  }, [femaleMode, scene]);

  const organPosSyncedRef = useRef(false);
  useEffect(() => {
    organPosSyncedRef.current = false;
  }, [organWindowPositions]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();

    // Organ positions — sync once (or when positions change), then update fade every frame
    if (!organPosSyncedRef.current && organWindowPositions.length) {
      organWindowPositions.forEach((p, i) => {
        onyxUniformsRef.current.uOrganPos.value[i]?.set(p[0], p[1], p[2]);
      });
      organPosSyncedRef.current = true;
    }
    const wantFade = darkMode && (meshMode === 6 || meshMode === 1) ? 1.0 : 0.0;
    onyxUniformsRef.current.uOnyxFade.value = wantFade;
    if (wantFade > 0) {
      onyxUniformsRef.current.uFadeRadius.value =
        0.09 + Math.abs(Math.sin(t * 0.75)) * 0.06;
    }
    onyxUniformsRef.current.uRegionFade.value =
      darkMode && meshMode === 1 ? 1.0 : 0.0;

    if (darkMode && materialRef.current.iridescence > 0) {
      // Only animate iridescence for the onyx/obsidian modes (0,1,2,6).
      // Modes 3 (Bone) and 4 (Chrome-Trans) have iridescence set but don't need
      // per-frame animation — modifying iridescenceThicknessRange every frame
      // forces a full shader recompute on a high-poly mesh and causes the lag.
      const iridModes = [0, 1, 2, 6];
      if (iridModes.includes(meshMode)) {
        materialRef.current.iridescenceIOR = 1.2 + Math.sin(t * 0.4) * 0.25;
        const iriRange = materialRef.current.iridescenceThicknessRange;
        iriRange[0] = 100 + Math.sin(t * 0.3) * 60;
        iriRange[1] = 260 + Math.cos(t * 0.35) * 80;
      }
    }

    let base = 0;
    if (viewMode === "power") base = darkMode ? 0.55 : 0.4;
    else if (viewMode === "unified") base = darkMode ? 0.25 : 0.15;

    if (!darkMode) {
      materialRef.current.emissive.copy(
        viewMode === "power" || viewMode === "unified"
          ? EMISSIVE_POWER
          : EMISSIVE_WHITE,
      );
    }

    if (viewMode === "breathing") {
      materialRef.current.emissiveIntensity = 0;
    } else {
      const pulse = base > 0 ? Math.sin(t * 1.2) * 0.15 * base : 0;
      const target = base + pulse;
      materialRef.current.emissiveIntensity +=
        (target - materialRef.current.emissiveIntensity) * 0.05;
    }

    if (!bloodMatRef.current) return;

    if (heartbeatRef && heartbeatRef.current !== lastBeatCountRef.current) {
      lastBeatCountRef.current = heartbeatRef.current;
      bloodPulseRef.current = 0.35;
    }

    // Blood/breath overlays are full-resolution duplicate clones of the entire
    // body mesh, rendered as a separate additive draw call. Their opacity only
    // reaches ~30% (blood) or ~8% (breath) even at peak, so the visual cost of
    // skipping them on mobile is minor — but the GPU cost of the extra draw
    // call is not, and (unlike other view modes) these rarely settle back to
    // 0 while their mode is actually in use, so the existing visibility-culling
    // optimization barely helps during normal use. Disable outright on mobile.
    if (IS_MOBILE) {
      bloodPulseRef.current = 0;
      bloodMatRef.current.opacity = 0;
    } else if (viewMode === "power") {
      bloodPulseRef.current *= 0.94;
      const ambient = Math.sin(t * 1.2) * 0.008 + 0.012;
      bloodMatRef.current.opacity = bloodPulseRef.current + ambient;
    } else if (viewMode === "breathing") {
      bloodPulseRef.current = 0;
      bloodMatRef.current.opacity = 0;
    } else {
      bloodPulseRef.current *= 0.9;
      bloodMatRef.current.opacity = bloodPulseRef.current * 0.3;
    }

    if (!breathMatRef.current) return;
    const isBreathActive =
      !IS_MOBILE && (viewMode === "breathing" || viewMode === "unified");
    const breathe = breathingRef?.current ?? 0;
    if (isBreathActive) {
      breathMatRef.current.color.lerpColors(BREATH_BLUE, BREATH_CYAN, breathe);
      breathMatRef.current.opacity = breathe * 0.08;
    } else {
      breathMatRef.current.opacity = 0;
    }

    // Visibility culling — zero-opacity transparent meshes still participate in
    // Three.js's per-frame transparent depth sort. Hiding them eliminates that cost.
    scene.visible = materialRef.current.opacity > 0.001;
    if (aluminumScene && aluminumMatRef.current)
      aluminumScene.visible = aluminumMatRef.current.opacity > 0.001;
    if (bloodScene) bloodScene.visible = bloodMatRef.current.opacity > 0.001;
    if (breathScene) breathScene.visible = breathMatRef.current.opacity > 0.001;
  });

  return (
    <>
      {aluminumScene && <primitive object={aluminumScene} />}
      <primitive object={scene} />
      {bloodScene && <primitive object={bloodScene} />}
      {breathScene && <primitive object={breathScene} />}
      {sheenScene && <primitive object={sheenScene} />}
    </>
  );
}

useGLTF.preload("/models/body/male-body.glb");
useGLTF.preload("/models/body/female-body.glb");

export default AnatomyModel;
