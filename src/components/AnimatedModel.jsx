import { useEffect, useRef, useMemo } from "react";
import { useFBX, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AnimatedModel({ darkMode, meshMode, fbxRef }) {
  const fbx = useFBX("/animations/pneumata_swing.fbx");
  const standingFbx = useFBX("/animations/Standing.fbx");
  const matRef = useRef(null);

  const clips = useMemo(() => {
    const swing = fbx.animations[0]?.clone();
    if (swing) swing.name = "Swing";
    const standing = standingFbx.animations[0]?.clone();
    if (standing) {
      standing.name = "Standing";
      // Shift Standing's root position track so it starts exactly where Swing ends.
      const swingRoot = swing?.tracks.find((t) => t.name.endsWith(".position"));
      const standRoot = standing.tracks.find((t) =>
        t.name.endsWith(".position"),
      );
      if (swingRoot && standRoot) {
        const n = swingRoot.values.length;
        const ex = swingRoot.values[n - 3];
        const ey = swingRoot.values[n - 2];
        const ez = swingRoot.values[n - 1];
        const sx = standRoot.values[0];
        const sy = standRoot.values[1];
        const sz = standRoot.values[2];
        const dx = ex - sx,
          dy = ey - sy,
          dz = ez - sz;
        for (let i = 0; i < standRoot.values.length; i += 3) {
          standRoot.values[i] += dx;
          standRoot.values[i + 1] += dy;
          standRoot.values[i + 2] += dz;
        }
      }
    }
    return [swing, standing].filter(Boolean);
  }, [fbx, standingFbx]);

  const { actions, mixer } = useAnimations(clips, fbx);

  useEffect(() => {
    fbx.scale.setScalar(0.047);
    if (fbxRef) fbxRef.current = fbx;
  }, [fbx]);

  useEffect(() => {
    const swing = actions["Swing"];
    const standing = actions["Standing"];
    if (!swing || !mixer) return;
    swing.setLoop(THREE.LoopOnce);
    swing.clampWhenFinished = true;
    if (standing) {
      standing.setLoop(THREE.LoopOnce);
      standing.clampWhenFinished = true;
    }
    swing.play();
    const onFinished = (e) => {
      if (e.action === swing && standing) {
        standing.reset();
        standing.play();
        swing.crossFadeTo(standing, 0.8, true);
      } else if (e.action === standing) {
        standing.stop();
        swing.reset();
        swing.play();
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [actions, mixer]);

  // Single material applied directly to the animated mesh.
  // We cannot clone the FBX for a second render layer — the mixer is bound
  // to the original fbx object, so any clone stays frozen in T-pose.
  useEffect(() => {
    let mat;
    if (darkMode) {
      if (meshMode === 4 || meshMode === 5) {
        const solid = meshMode === 5;
        mat = new THREE.MeshStandardMaterial({
          color: "#d8dde2",
          metalness: 0.88,
          roughness: 0.15,
          transparent: !solid,
          opacity: solid ? 1.0 : 0.82,
          depthWrite: solid,
        });
      } else if (meshMode === 3) {
        mat = new THREE.MeshPhysicalMaterial({
          color: "#f0f4ff",
          emissive: "#c8a060",
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.28,
          metalness: 0.05,
          roughness: 0.1,
          depthWrite: false,
        });
      } else if (meshMode === 0) {
        mat = new THREE.MeshPhysicalMaterial({
          color: "#030306",
          emissive: "#880000",
          transparent: true,
          opacity: 0.45,
          metalness: 0.1,
          roughness: 0.12,
          depthWrite: false,
        });
      } else {
        const solid = meshMode === 2;
        mat = new THREE.MeshPhysicalMaterial({
          color: "#030306",
          emissive: "#880000",
          metalness: 0.92,
          roughness: 0.08,
          transparent: !solid,
          opacity: solid ? 1.0 : 0.82,
          iridescence: 0.45,
          iridescenceIOR: 1.32,
          iridescenceThicknessRange: [120, 280],
          clearcoat: 0.9,
          clearcoatRoughness: 0.08,
          depthWrite: solid,
        });
      }
    } else {
      if (meshMode === 0) {
        mat = new THREE.MeshPhysicalMaterial({
          color: "#1a1a2a",
          transparent: true,
          opacity: 0.45,
          metalness: 0.1,
          roughness: 0.12,
          depthWrite: false,
        });
      } else if (meshMode === 3) {
        mat = new THREE.MeshPhysicalMaterial({
          color: "#f0f4ff",
          emissive: "#c8a060",
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.28,
          metalness: 0.05,
          roughness: 0.1,
          depthWrite: false,
        });
      } else {
        const solid = meshMode === 2;
        mat = new THREE.MeshStandardMaterial({
          color: "#d8dde2",
          metalness: 0.88,
          roughness: 0.15,
          transparent: !solid,
          opacity: solid ? 1.0 : 0.82,
          depthWrite: solid,
        });
      }
    }
    if (matRef.current) matRef.current.dispose();
    matRef.current = mat;
    fbx.traverse((child) => {
      if (child.isMesh) child.material = mat;
    });
    return () => {
      mat.dispose();
    };
  }, [fbx, darkMode, meshMode]);

  useFrame(() => {
    fbx.position.set(0, 0.45, -0.9);
  });

  return <primitive object={fbx} />;
}

export default AnimatedModel;
