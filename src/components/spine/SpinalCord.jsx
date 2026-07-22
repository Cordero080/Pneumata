import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { smoothPoints } from "./spineData";
import SpineLines from "./SpineLines";
import Vertebrae from "./Vertebrae";
import DiscMarkers from "./DiscMarkers";

// Style palettes — dark and light mode separated for independent tuning
const SC_DARK = {
  core: "#00d4ff",
  glow: "#0066ff",
  bone: "#a8c8ff",
  cauda: "#00d4ff",
  coreOp: 0.8,
  glowOp: 0.2,
  bodyOp: 0.22,
  spinOp: 0.18,
  transOp: 0.16,
  lamOp: 0.28,
  caudaOp: 0.22,
};

const SC_LIGHT = {
  core: "#ffffff",
  glow: "#e8f0f8",
  bone: "#f0f4f8",
  cauda: "#ffffff",
  coreOp: 0.7,
  glowOp: 0.08,
  bodyOp: 0.55,
  spinOp: 0.45,
  transOp: 0.4,
  lamOp: 0.65,
  caudaOp: 0.45,
};

// Disc orientation quaternions — average of neighboring segment directions
function computeDiscQuats(pts) {
  const _Y = new THREE.Vector3(0, 1, 0);
  return pts.map((_, i) => {
    const curr = new THREE.Vector3(...pts[i]);
    const hasPrev = i > 0;
    const hasNext = i < pts.length - 1;
    let dir;
    if (hasPrev && hasNext) {
      const d1 = new THREE.Vector3()
        .subVectors(curr, new THREE.Vector3(...pts[i - 1]))
        .normalize();
      const d2 = new THREE.Vector3()
        .subVectors(new THREE.Vector3(...pts[i + 1]), curr)
        .normalize();
      dir = new THREE.Vector3().addVectors(d1, d2).normalize();
    } else if (hasNext) {
      dir = new THREE.Vector3()
        .subVectors(new THREE.Vector3(...pts[i + 1]), curr)
        .normalize();
    } else {
      dir = new THREE.Vector3()
        .subVectors(curr, new THREE.Vector3(...pts[i - 1]))
        .normalize();
    }
    return new THREE.Quaternion().setFromUnitVectors(_Y, dir);
  });
}

function SpinalCord({
  organ,
  onSelect,
  nodeOpacity = 1,
  dynamicPoints,
  hoveredCategory,
  onCategoryHover,
  darkMode = true,
  meshMode = 2,
  showQi = false,
}) {
  const groupRef = useRef();
  const SC = darkMode ? SC_DARK : SC_LIGHT;

  const pts = useMemo(
    () => smoothPoints(dynamicPoints ?? organ.points),
    [dynamicPoints, organ.points],
  );

  const discQuats = useMemo(() => computeDiscQuats(pts), [pts]);

  // Force spine to render on top of the body mesh in all view modes
  useEffect(() => {
    groupRef.current?.traverse((o) => {
      o.renderOrder = 2;
    });
  }, [dynamicPoints]);

  return (
    <group ref={groupRef}>
      <SpineLines pts={pts} SC={SC} nodeOpacity={nodeOpacity} />
      <Vertebrae pts={pts} SC={SC} />
      <DiscMarkers
        pts={pts}
        discQuats={discQuats}
        darkMode={darkMode}
        meshMode={meshMode}
        hoveredCategory={hoveredCategory}
        onCategoryHover={onCategoryHover}
        onSelect={onSelect}
        showQi={showQi}
      />
    </group>
  );
}

export default SpinalCord;
