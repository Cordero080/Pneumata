import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Two events per 4-second breath cycle:
//   t=2s   Peak: emissive spike on core sphere (oxygenation moment)
//   t=2.5s Exhale: handled by OxygenPulse (sternum dispersal)
// Inhale convergence is now handled by the body mesh breath color layer in AnatomyModel.
function LungVolume({ position, visible, breathingRef, viewMode }) {
  const coreRef = useRef();

  const prevBreathRef = useRef(0);
  const flashBoost = useRef(0);
  const hasFiredPeakFlash = useRef(false);

  useFrame((state) => {
    if (!coreRef.current) return;
    const t = state.clock.getElapsedTime();

    const isBreathingMode = viewMode === "breathing";
    const useLiveBreath =
      breathingRef && (viewMode === "power" || isBreathingMode);
    const breathe = useLiveBreath
      ? breathingRef.current
      : (Math.sin(t * 1.257) + 1) / 2;

    const isVisible = visible || isBreathingMode;
    const isExhaling = breathe < prevBreathRef.current;
    const isInhaling = breathe > prevBreathRef.current;

    // Reset peak gate on any inhaling frame
    if (isInhaling) hasFiredPeakFlash.current = false;

    // --- Peak: emissive flash (t≈2s) ---
    if (isExhaling && isVisible && !hasFiredPeakFlash.current) {
      flashBoost.current = 8.0;
      hasFiredPeakFlash.current = true;
    }

    // --- Core sphere ---
    const targetScale = isVisible ? 1.0 + breathe * 0.6 : 0.01;
    const curScale = coreRef.current.scale.x;
    coreRef.current.scale.setScalar(curScale + (targetScale - curScale) * 0.06);

    const coreOpacity = isVisible ? 0.12 + breathe * 0.1 : 0;
    coreRef.current.material.opacity +=
      (coreOpacity - coreRef.current.material.opacity) * 0.06;

    flashBoost.current *= 0.9;
    coreRef.current.material.emissiveIntensity = 1.2 + flashBoost.current;

    prevBreathRef.current = breathe;
  });

  return (
    <group position={position}>
      {/* Core glow — scales with breath, flashes at peak */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.022, 16, 12]} />
        <meshStandardMaterial
          color="#e0f7ff"
          emissive="#b8efff"
          emissiveIntensity={1.2}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default LungVolume;
