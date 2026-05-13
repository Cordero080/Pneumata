import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,0.85)");
  g.addColorStop(0.4, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

import { CATEGORY_COLORS, CATEGORY_EMISSIVE } from "../../data/categories";

const IS_MOBILE = window.innerWidth <= 768;

import HeartRings from "./HeartRings";
import OrganLabel from "./OrganLabel";

function OrganNode({
  organ,
  onSelect,
  onFocus,
  onHover,
  nodeOpacity = 1,
  pulseRef,
  hoveredCategory,
  onCategoryHover,
  breathingRef,
  viewMode,
  brainZoom,
  cellZoom,
  darkMode,
  femaleMode,
  femalePositions,
  selectedOrganId,
  previewedOrganId,
  onPreview,
  onClearPreview,
  legendCategory,
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const auraRef = useRef();
  const groupRef = useRef();
  const heartVisualRef = useRef();
  const heartBeat = useRef({ last: 0, scale: 1 });
  const heartSpriteOuterRef = useRef();
  const heartSpriteInnerRef = useRef();
  const heartGlowFlash = useRef(0);
  const glowTex = useMemo(
    () => (pulseRef ? makeGlowTexture() : null),
    [pulseRef],
  );
  const [hovered, setHovered] = useState(false);
  const [labelReady, setLabelReady] = useState(false);
  const screenXRef = useRef(0);
  const isEye = organ.id === "right_eye" || organ.id === "left_eye";
  const glitchRef = useRef({ nextGlitch: 3 + Math.random() * 6, duration: 0 });

  // Resolve position: explicit override → landmark-mapped → raw male position
  const femalePos =
    femaleMode && (femalePositions?.get(organ.id) || organ.femalePosition);
  const femaleBrainPos =
    femaleMode &&
    (femalePositions?.get(organ.id + ":brain") || organ.femaleBrainPosition);
  const resolvedPos = femalePos || organ.position;
  const resolvedBrainPos = femaleBrainPos || organ.brainPosition;

  const fullPos = useRef(
    new THREE.Vector3(resolvedPos[0], resolvedPos[1], resolvedPos[2]),
  );
  const zoomedPos = useRef(
    resolvedBrainPos
      ? new THREE.Vector3(
          resolvedBrainPos[0],
          resolvedBrainPos[1],
          resolvedBrainPos[2],
        )
      : null,
  );
  const currentPos = useRef(
    new THREE.Vector3(resolvedPos[0], resolvedPos[1], resolvedPos[2]),
  );

  useEffect(() => {
    const pos = femalePos || organ.position;
    const brain = femaleBrainPos || organ.brainPosition;
    fullPos.current.set(pos[0], pos[1], pos[2]);
    if (brain) {
      zoomedPos.current?.set(brain[0], brain[1], brain[2]);
    }
    currentPos.current.copy(fullPos.current);
    if (groupRef.current) {
      groupRef.current.position.copy(fullPos.current);
    }
  }, [femaleMode, femalePositions]);

  const color =
    organ.nodeColor ?? CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const emissive =
    organ.nodeColor ??
    CATEGORY_EMISSIVE[organ.category] ??
    CATEGORY_EMISSIVE.logic;
  const isSpirit = organ.category === "spirit";

  // STYLE: node size hierarchy — set nodeSize in organs.js to "small" | "large" | (default)
  // Sizes: glow outer / main sphere / inner core / hit target
  // "small" ~65% — deep/interior brain nodes. "large" ~130% — heart, liver, hemispheres.
  // Color variant idea for small nodes: blood-sunset tone like #c04030 or #e05020
  const hitMult = IS_MOBILE ? 2.5 : 1;
  const sz =
    organ.nodeSize === "small"
      ? { glow: 0.008, main: 0.011, inner: 0.005, hit: 0.007 * hitMult }
      : organ.nodeSize === "large"
        ? { glow: 0.016, main: 0.021, inner: 0.009, hit: 0.012 * hitMult }
        : { glow: 0.012, main: 0.016, inner: 0.007, hit: 0.009 * hitMult };
  const isPreview = previewedOrganId === organ.id;
  const isExternallyHighlighted =
    !hovered && hoveredCategory === organ.category;

  // Clear stuck hover/label state when entering zoomed modes
  useEffect(() => {
    if (brainZoom || cellZoom) {
      setHovered(false);
      setLabelReady(false);
      document.body.style.cursor = "default";
    }
  }, [brainZoom, cellZoom]);

  useFrame((state, delta) => {
    // Track screen X for edge-detection in label (ref only — no setState)
    if (IS_MOBILE && (hovered || previewedOrganId === organ.id)) {
      const ndc = currentPos.current.clone().project(state.camera);
      screenXRef.current = ndc.x;
    }

    // Lerp group position — nodes live in male-GLB coordinate space and never relocate
    if (groupRef.current) {
      const target =
        brainZoom && zoomedPos.current ? zoomedPos.current : fullPos.current;
      currentPos.current.lerp(target, 0.06);
      groupRef.current.position.copy(currentPos.current);
    }

    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];

    const brainFade = cellZoom || (brainZoom && !organ.brainPosition) ? 0 : 1;
    // Heart is always fully lit — never dimmed by selection or view mode
    const effectiveNodeOpacity = pulseRef
      ? Math.max(nodeOpacity, 0.7)
      : nodeOpacity;
    const selectionDim =
      pulseRef || !selectedOrganId || selectedOrganId === organ.id ? 1 : 0.18;
    const legendDim =
      !legendCategory || organ.category === legendCategory ? 1 : 0.12;

    // Eye glitch — occasional rapid color flicker
    if (isEye && meshRef.current) {
      const g = glitchRef.current;
      g.nextGlitch -= delta;
      if (g.nextGlitch <= 0) {
        g.duration = 0.25 + Math.random() * 0.3;
        g.nextGlitch = 4 + Math.random() * 8;
      }
      if (g.duration > 0) {
        g.duration -= delta;
        const glitchColors = [
          "#ff0040",
          "#00ffff",
          "#39ff14",
          "#ffffff",
          "#ff8c00",
          "#cc00ff",
        ];
        const c = glitchColors[Math.floor(t * 24) % glitchColors.length];
        meshRef.current.material.color.set(c);
        meshRef.current.material.emissive.set(c);
        meshRef.current.material.emissiveIntensity = 4 + Math.random() * 4;
        if (glowRef.current) glowRef.current.material.color.set(c);
        if (innerRef.current) innerRef.current.material.emissive.set(c);
      } else {
        meshRef.current.material.color.set(color);
        meshRef.current.material.emissive.set(color);
        if (glowRef.current) glowRef.current.material.color.set(color);
        if (innerRef.current) innerRef.current.material.emissive.set(color);
      }
    }

    const base = hovered ? 2.8 : isExternallyHighlighted ? 2.2 : 1.1;
    meshRef.current.material.emissiveIntensity =
      base + Math.sin(t * 3 + phase) * 0.5;

    meshRef.current.material.opacity +=
      (0.18 * effectiveNodeOpacity * brainFade * selectionDim * legendDim -
        meshRef.current.material.opacity) *
      0.08;

    // Breathing scale pulse — lungs in power mode, spirit node always
    if (breathingRef) {
      if (isSpirit) {
        const targetScale = 1 + breathingRef.current * 0.25;
        const cur = meshRef.current.scale.x;
        meshRef.current.scale.setScalar(cur + (targetScale - cur) * 0.04);
      } else if (viewMode === "power") {
        const targetScale = 1 + breathingRef.current * 0.08;
        const cur = meshRef.current.scale.x;
        meshRef.current.scale.setScalar(cur + (targetScale - cur) * 0.06);
      }
    }

    if (glowRef.current) {
      const glowTarget =
        (hovered ? 0.22 : isExternallyHighlighted ? 0.18 : 0.1) *
        effectiveNodeOpacity *
        selectionDim *
        legendDim;
      glowRef.current.scale.setScalar(
        hovered ? 3.5 : isExternallyHighlighted ? 3.0 : 2.5,
      );
      glowRef.current.material.opacity +=
        (glowTarget * brainFade - glowRef.current.material.opacity) * 0.08;
    }

    if (innerRef.current) {
      const innerBase = isSpirit ? 9 : 3.5;
      innerRef.current.material.emissiveIntensity =
        innerBase + Math.sin(t * 5 + phase) * (isSpirit ? 3 : 1.2);
      innerRef.current.material.opacity +=
        (effectiveNodeOpacity * brainFade * selectionDim * legendDim -
          innerRef.current.material.opacity) *
        0.08;
    }

    if (isSpirit && auraRef.current) {
      const targetScale = hovered ? 5 : 1;
      const cur = auraRef.current.scale.x;
      auraRef.current.scale.setScalar(cur + (targetScale - cur) * 0.06);
      const targetOpacity = hovered ? 0.1 : 0;
      auraRef.current.material.opacity +=
        (targetOpacity - auraRef.current.material.opacity) * 0.06;
    }

    // Heart beat scale pulse + sprite glow
    if (pulseRef) {
      const b = heartBeat.current;
      if (pulseRef.current !== b.last) {
        b.last = pulseRef.current;
        b.scale = 0.72;
        heartGlowFlash.current = 1.0;
      }
      b.scale += (1.0 - b.scale) * 0.14;
      if (heartVisualRef.current)
        heartVisualRef.current.scale.setScalar(b.scale);

      heartGlowFlash.current *= 0.84;
      const flash = heartGlowFlash.current;
      if (heartSpriteOuterRef.current)
        heartSpriteOuterRef.current.opacity +=
          (flash * 0.55 - heartSpriteOuterRef.current.opacity) * 0.2;
      if (heartSpriteInnerRef.current)
        heartSpriteInnerRef.current.opacity +=
          (flash * 1.0 - heartSpriteInnerRef.current.opacity) * 0.2;
    }
  });

  const handlePointerOver = (e) => {
    if (cellZoom || (brainZoom && !organ.brainPosition)) return;
    e.stopPropagation();
    setHovered(true);
    onHover?.(organ.id);
    onCategoryHover?.(organ.category);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
    onCategoryHover?.(null);
    document.body.style.cursor = "default";
  };

  return (
    <group ref={groupRef}>
      {/* Visual sub-group — scaled on heartbeat */}
      <group ref={pulseRef ? heartVisualRef : undefined}>
        {/* Spirit expanding aura */}
        {isSpirit && (
          <mesh ref={auraRef} scale={1}>
            <sphereGeometry args={[0.016, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Heartbeat rings — only on heart node */}
        {pulseRef && (
          <HeartRings pulseRef={pulseRef} nodeOpacity={nodeOpacity} />
        )}

        {/* Heart sprite glow — neurotransmitter-style additive halo */}
        {pulseRef && glowTex && (
          <>
            <sprite renderOrder={8} scale={[0.038, 0.038, 1]}>
              <spriteMaterial
                ref={heartSpriteOuterRef}
                map={glowTex}
                color="#ff1100"
                transparent
                opacity={0}
                depthWrite={false}
                depthTest={false}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <sprite renderOrder={9} scale={[0.012, 0.012, 1]}>
              <spriteMaterial
                ref={heartSpriteInnerRef}
                map={glowTex}
                color="#ff4422"
                transparent
                opacity={0}
                depthWrite={false}
                depthTest={false}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </>
        )}

        {/* Soft outer halo */}
        <mesh ref={glowRef} renderOrder={5}>
          <sphereGeometry args={[sz.glow, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1}
            toneMapped={false}
            transparent
            opacity={0.1}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        {/* Main node sphere */}
        <mesh ref={meshRef} renderOrder={5}>
          <sphereGeometry args={[sz.main, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1}
            toneMapped={false}
            transparent
            opacity={0.18}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        {/* Small bright inner core */}
        <mesh ref={innerRef} renderOrder={6}>
          <sphereGeometry args={[sz.inner, 12, 12]} />
          <meshStandardMaterial
            color={isSpirit ? "#ffffff" : color}
            emissive={isSpirit ? "#ffffff" : color}
            emissiveIntensity={isSpirit ? 12 : 6}
            toneMapped={false}
            transparent
            opacity={1}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      </group>
      {/* end visual sub-group */}

      {/* Invisible enlarged hit target — outside visual group so click area never shrinks */}
      <mesh
        visible={!cellZoom}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={(e) => {
          e.stopPropagation();
          if (cellZoom || (brainZoom && !organ.brainPosition)) return;
          if (IS_MOBILE) {
            if (isPreview) {
              // Second tap on node while label is showing — open modal
              onClearPreview?.();
              setLabelReady(false);
              onSelect(organ);
            } else {
              // First tap — preview: show label + highlight category
              setLabelReady(false);
              onPreview?.(organ);
              onCategoryHover?.(organ.category);
            }
          } else {
            // Desktop: click opens modal directly
            onSelect(organ);
          }
        }}
      >
        <sphereGeometry args={[sz.hit, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Label — on hover (desktop) or first tap (mobile preview) */}
      {(hovered || isPreview) &&
        !cellZoom &&
        !(brainZoom && !organ.brainPosition) && (
          <OrganLabel
            organ={organ}
            color={color}
            darkMode={darkMode}
            labelReady={labelReady}
            screenX={screenXRef.current}
            onSelect={
              IS_MOBILE && isPreview && !labelReady
                ? () => {
                    // Step 2 on mobile: zoom camera, activate "tap to open" cue
                    onFocus?.(organ);
                    setLabelReady(true);
                  }
                : () => {
                    onClearPreview?.();
                    setLabelReady(false);
                    onSelect(organ);
                  }
            }
          />
        )}
    </group>
  );
}

export default OrganNode;
