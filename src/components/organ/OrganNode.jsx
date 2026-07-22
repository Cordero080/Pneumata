import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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
import { ORGAN_TCM } from "../../data/tcmMapping";
import {
  activeMeridianRef,
  subscribeActiveMeridian,
} from "../../data/activeMeridian";
import { getOrganNodeSizeTier } from "../../data/sizing";
import HeartRings from "./HeartRings";
import OrganLabel from "./OrganLabel";
import NodeCore from "./NodeCore";

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
  femaleMode,
  femalePositions,
  selectedOrganId,
  previewedOrganId,
  onPreview,
  onClearPreview,
  legendCategory,
  showMeridians,
  darkMode,
}) {
  const IS_MOBILE = window.innerWidth <= 768;

  const GLITCH_COLORS = [
    new THREE.Color("#f8f2f4"),
    new THREE.Color("#00ffff"),
    new THREE.Color("#39ff14"),
    new THREE.Color("#ffffff"),
    new THREE.Color("#ff8c00"),
    new THREE.Color("#fbf5fd"),
  ];

  const meshRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const auraRef = useRef();
  const groupRef = useRef();
  const selectedScaleRef = useRef(1);
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
  const [labelClosed, setLabelClosed] = useState(false);
  const [isMeridianTarget, setIsMeridianTarget] = useState(false);
  const screenXRef = useRef(0);

  const myMeridianId = ORGAN_TCM[organ.id]?.meridianId ?? null;
  useEffect(() => {
    if (!myMeridianId) return;
    return subscribeActiveMeridian((id) => {
      setIsMeridianTarget(id === myMeridianId);
    });
  }, [myMeridianId]);
  const isEye = organ.id === "right_eye" || organ.id === "left_eye";
  const glitchRef = useRef({ nextGlitch: 3 + Math.random() * 6, duration: 0 });
  const frameSkip = useRef(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [femaleMode, femalePositions, organ.position, organ.brainPosition]);

  const color =
    organ.nodeColor ?? CATEGORY_COLORS[organ.category] ?? CATEGORY_COLORS.logic;
  const emissive =
    organ.nodeColor ??
    CATEGORY_EMISSIVE[organ.category] ??
    CATEGORY_EMISSIVE.logic;
  const isSpirit = organ.category === "spirit";

  // STYLE: node size hierarchy — set nodeSize in organs.js to "small" | "large" | (default)
  // Sizes: glow outer / main faceted core / inner core / hit target
  // "small" ~65% — deep/interior brain nodes. "large" ~130% — heart, liver, hemispheres.
  // Color variant idea for small nodes: blood-sunset tone like #c04030 or #e05020
  // Tiers (mobile/desktop/large-monitor) + values live in src/data/sizing.js
  const sizeTier = useMemo(() => getOrganNodeSizeTier(), []);
  const sz =
    sizeTier[
      isEye
        ? "eye"
        : organ.nodeSize === "small" || organ.nodeSize === "large"
          ? organ.nodeSize
          : "default"
    ];
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
    if (IS_MOBILE) {
      frameSkip.current = (frameSkip.current + 1) % 2;
      if (frameSkip.current !== 0) return;
      delta *= 2;
    }

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

      // Scale: 1.5 when modal open, 2.0 on hover (desktop) or preview tap
      // (mobile), else 1 — shrunk in brain zoom where head nodes are dense.
      const isInteractive = IS_MOBILE ? isPreview : hovered;
      const zoomShrink = brainZoom ? 0.68 : 1.0;
      const targetScale =
        (selectedOrganId === organ.id ? 1.5 : isInteractive ? 2.0 : 1.0) *
        zoomShrink;
      selectedScaleRef.current +=
        (targetScale - selectedScaleRef.current) * 0.1;
      groupRef.current.scale.setScalar(selectedScaleRef.current);
    }

    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const phase = organ.position[0];

    // Slow tumble so the faceted core actually catches light instead of reading as a static blob
    if (!IS_MOBILE) {
      meshRef.current.rotation.x = t * 0.35 + phase;
      meshRef.current.rotation.y = t * 0.25 + phase;
      if (innerRef.current) {
        innerRef.current.rotation.x = t * 0.5 + phase;
        innerRef.current.rotation.y = t * -0.4 + phase;
      }
    }

    const brainFade = cellZoom || (brainZoom && !organ.brainPosition) ? 0 : 1;
    // Heart is always fully lit — never dimmed by selection or view mode
    const effectiveNodeOpacity = pulseRef
      ? Math.max(nodeOpacity, 0.7)
      : nodeOpacity;
    const selectionDim =
      pulseRef || !selectedOrganId || selectedOrganId === organ.id ? 1 : 0.18;
    const legendDim =
      !legendCategory || organ.category === legendCategory ? 1 : 0.12;
    const mid = activeMeridianRef.current;
    const meridianDim =
      !mid || ORGAN_TCM[organ.id]?.meridianId === mid ? 1 : 0.08;

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
        const c = GLITCH_COLORS[Math.floor(t * 24) % GLITCH_COLORS.length];
        meshRef.current.material.color.copy(c);
        meshRef.current.material.emissive.copy(c);
        meshRef.current.material.emissiveIntensity = 4 + Math.random() * 4;
        if (glowRef.current) glowRef.current.material.color.copy(c);
        if (innerRef.current) innerRef.current.material.emissive.copy(c);
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
      (0.18 *
        effectiveNodeOpacity *
        brainFade *
        selectionDim *
        legendDim *
        meridianDim -
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
        legendDim *
        meridianDim;
      // In brain zoom the head nodes cluster tightly, so shrink the glow halo
      // (its big soft circle is what overlaps into clutter up close).
      const gBase = brainZoom ? 1.5 : 2.5;
      const gHi = brainZoom ? 1.9 : 3.0;
      const gHover = brainZoom ? 2.0 : 3.33; // hover halo growth trimmed ~5%
      glowRef.current.scale.setScalar(
        hovered ? gHover : isExternallyHighlighted ? gHi : gBase,
      );
      glowRef.current.material.opacity +=
        (glowTarget * brainFade - glowRef.current.material.opacity) * 0.08;
    }

    if (innerRef.current) {
      const innerBase = isSpirit ? 9 : 3.5;
      innerRef.current.material.emissiveIntensity =
        innerBase + Math.sin(t * 5 + phase) * (isSpirit ? 3 : 1.2);
      innerRef.current.material.opacity +=
        (effectiveNodeOpacity *
          brainFade *
          selectionDim *
          legendDim *
          meridianDim -
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

    // Heart beat scale pulse + sprite glow — delta-time corrected so the
    // pulse pace stays consistent regardless of actual frame rate.
    if (pulseRef) {
      const b = heartBeat.current;
      if (pulseRef.current !== b.last) {
        b.last = pulseRef.current;
        b.scale = 0.72;
        heartGlowFlash.current = 1.0;
      }
      b.scale += (1.0 - b.scale) * (1 - Math.exp(-delta * 9.05)); // matches 0.14/frame at 60fps
      if (heartVisualRef.current)
        heartVisualRef.current.scale.setScalar(b.scale);

      heartGlowFlash.current *= Math.exp(-delta * 10.46); // matches 0.84/frame at 60fps
      const flash = heartGlowFlash.current;
      const spriteLerp = 1 - Math.exp(-delta * 13.4); // matches 0.2/frame at 60fps
      if (heartSpriteOuterRef.current)
        heartSpriteOuterRef.current.opacity +=
          (flash * 0.55 - heartSpriteOuterRef.current.opacity) * spriteLerp;
      if (heartSpriteInnerRef.current)
        heartSpriteInnerRef.current.opacity +=
          (flash * 1.0 - heartSpriteInnerRef.current.opacity) * spriteLerp;
    }
  });

  const handlePointerOver = (e) => {
    if (cellZoom || (brainZoom && !organ.brainPosition)) return;
    e.stopPropagation();
    setHovered(true);
    setLabelClosed(false);
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

        <NodeCore
          ref={meshRef}
          glowRef={glowRef}
          innerRef={innerRef}
          color={color}
          emissive={emissive}
          isSpirit={isSpirit}
          sz={sz}
          isMobile={IS_MOBILE}
        />
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
        !labelClosed &&
        !cellZoom &&
        !(brainZoom && !organ.brainPosition) && (
          <OrganLabel
            organ={organ}
            color={color}
            labelReady={labelReady}
            screenX={screenXRef.current}
            showMeridians={showMeridians}
            darkMode={darkMode}
            onClose={() => {
              setLabelClosed(true);
              onClearPreview?.();
              setLabelReady(false);
              onCategoryHover?.(null);
            }}
            onSelect={
              IS_MOBILE && isPreview && !labelReady
                ? () => {
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

      {/* Meridian connection label — appears when a linked meridian point triggers it */}
      {isMeridianTarget &&
        !cellZoom &&
        !(brainZoom && !organ.brainPosition) && (
          <Html
            center
            portal={{ current: document.body }}
            zIndexRange={[9998, 9998]}
            style={{
              pointerEvents: "none",
              userSelect: "none",
              overflow: "visible",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "10px",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                animation: "scanReveal 0.22s ease-out both",
              }}
            >
              {/* Connector line going down to node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "1px",
                    height: "10px",
                    background: `${color}dd`,
                  }}
                />
                <div
                  style={{
                    width: "1px",
                    height: "36px",
                    background: `linear-gradient(to bottom, ${color}dd, ${color}00)`,
                  }}
                />
              </div>

              {/* Panel — back layer re-blurs the scene, front layer holds content */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "translate(0, 1px)",
                    background: "rgba(205, 222, 250, 0.17)",
                    backdropFilter: "blur(160px) saturate(65%)",
                    WebkitBackdropFilter: "blur(160px) saturate(65%)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    background: "rgba(190, 212, 248, 0.21)",
                    backdropFilter: "blur(220px) saturate(65%)",
                    WebkitBackdropFilter: "blur(220px) saturate(65%)",
                    boxShadow: `0 8px 32px rgba(0,0,0,0.22), 0 0 20px ${color}40, inset 0 1.5px 0 rgba(255,255,255,0.70)`,
                    border: `1px solid ${color}88`,
                    borderRadius: "6px",
                    padding: IS_MOBILE ? "6px 10px" : "8px 14px",
                    maxWidth: IS_MOBILE ? "140px" : "220px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Orbitron', system-ui, sans-serif",
                      fontSize: IS_MOBILE
                        ? "clamp(10px, 3vw, 13px)"
                        : "clamp(13px, 1.2vw, 17px)",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      color: "rgba(8, 20, 48, 0.95)",
                      textShadow: "0 1px 0 rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                    }}
                  >
                    {organ.organ}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Orbitron', system-ui, sans-serif",
                      fontSize: IS_MOBILE
                        ? "clamp(7px, 2vw, 9px)"
                        : "clamp(9px, 0.8vw, 11px)",
                      fontWeight: 600,
                      letterSpacing: "0.10em",
                      color,
                      textTransform: "uppercase",
                      marginTop: "4px",
                    }}
                  >
                    {ORGAN_TCM[organ.id]?.meridianName}
                  </div>
                </div>
              </div>
            </div>
            <style>{`
            @keyframes scanReveal {
              from { opacity: 0; clip-path: inset(0 100% 0 0); }
              to   { opacity: 1; clip-path: inset(0 0% 0 0); }
            }
          `}</style>
          </Html>
        )}
    </group>
  );
}

export default OrganNode;
