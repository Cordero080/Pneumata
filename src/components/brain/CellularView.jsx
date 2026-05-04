import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { organs } from "../../data/organs";

const IS_MOBILE = window.innerWidth <= 768;

const pituitaryOrgan = organs.find((o) => o.id === "pituitary");

function makeMatcap(hexColor) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const c = (v) =>
    Math.min(255, Math.max(0, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  const lighter = `#${c(r * 0.4 + 155)}${c(g * 0.4 + 155)}${c(b * 0.4 + 155)}`;
  const darker = `#${c(r * 0.25)}${c(g * 0.25)}${c(b * 0.25)}`;
  const cx = size / 2,
    cy = size / 2,
    rad = size * 0.5;
  // Fill entire canvas — no black background at edges
  ctx.fillStyle = darker;
  ctx.fillRect(0, 0, size, size);
  // Primary gradient fills the whole canvas, no arc clip
  const grad = ctx.createRadialGradient(cx * 0.6, cy * 0.55, 0, cx, cy, rad);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.08, "#e8f4ff");
  grad.addColorStop(0.2, lighter);
  grad.addColorStop(0.5, hexColor);
  grad.addColorStop(0.82, darker);
  grad.addColorStop(1, darker);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // Bottom-edge secondary reflection (metallic characteristic)
  const ref = ctx.createRadialGradient(
    cx,
    cy + rad * 0.68,
    0,
    cx,
    cy + rad * 0.68,
    rad * 0.42,
  );
  ref.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
  ref.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ref;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const matcapCache = new Map();

function makeGlowTex() {
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
  g.addColorStop(0.15, "rgba(255,255,255,0.7)");
  g.addColorStop(0.5, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
const glowTexSingleton = makeGlowTex();

const LOGIC_COLOR = "#cc88ff";
const INFRA_COLOR = "#ffb347";

const CELL_NODES = [
  // Neuron cluster — three somas in a loose triangle
  // Primary neuron (top-center): [0.014, 1.702, 0.026]
  {
    id: "neuron",
    label: "Neuron",
    hardware: "Transistor",
    position: [0.014, 1.708, 0.03],
    color: LOGIC_COLOR,
    bio_function:
      "Receives electrochemical signals through dendrites, integrates them in the cell body, and fires an electrical impulse down the axon when threshold is reached.",
    hard_function:
      "A semiconductor switch that allows current to flow when voltage exceeds a threshold — the fundamental binary switching unit of all computation.",
    synthesis:
      "Both are threshold-triggered switches. Fire or do not fire. One or zero. The logic of all computation begins here.",
  },
  {
    id: "synapse",
    label: "Synapse",
    hardware: "Logic Gate",
    position: [0.02, 1.696, 0.024],
    color: LOGIC_COLOR,
    bio_function:
      "The junction between two neurons where neurotransmitters cross the synaptic cleft and bind to receptors — passing or blocking the signal based on chemical conditions.",
    hard_function:
      "A circuit that evaluates multiple input signals and produces a defined output based on Boolean logic — AND, OR, NOT. Passes or blocks based on conditions.",
    synthesis:
      "Both evaluate inputs and make a pass or block decision. The synapse is the original logic gate.",
  },
  // Axon extends downward from primary neuron soma
  {
    id: "axon",
    label: "Axon",
    hardware: "Data Bus",
    position: [0.012, 1.678, 0.018],
    color: LOGIC_COLOR,
    bio_function:
      "The long fiber extending from the neuron cell body that carries the electrical impulse to the synaptic terminals — pure transmission, no processing.",
    hard_function:
      "A set of parallel conductors that transmit data between components. The bus carries signals without computing them.",
    synthesis:
      "Both are transmission-only pathways. The axon does not think. The bus does not compute. They carry.",
  },
  {
    id: "myelin",
    label: "Myelin",
    hardware: "Signal Insulation",
    position: [0.008, 1.666, 0.012],
    color: LOGIC_COLOR,
    bio_function:
      "Fatty segments wrapped around the axon that insulate the signal and enable saltatory conduction — the signal jumps between nodes of Ranvier at high speed.",
    hard_function:
      "Dielectric insulation on PCB traces that prevents signal bleed between adjacent conductors and maintains signal integrity at high frequencies.",
    synthesis:
      "Both solve the same problem: keep the signal clean and fast over distance.",
  },
  // On pituitary.glb — center [0, 1.620, 0.005]
  {
    id: "glial",
    label: "Glial Cell",
    hardware: "Cache",
    position: [0.006, 1.625, -0.006],
    color: INFRA_COLOR,
    bio_function:
      "Non-neuronal cells that maintain the chemical environment, remove waste, provide structural support, and regulate ion concentrations. They do not transmit signals but make transmission possible.",
    hard_function:
      "Support chips and cache memory that do not execute primary computation but maintain the environment — buffering data, managing thermal output — that makes computation possible.",
    synthesis: "Neither computes. Both make computation possible.",
  },
  {
    id: "bbbarrier",
    label: "Blood Brain Barrier",
    hardware: "Firewall",
    position: [-0.006, 1.613, -0.014],
    color: INFRA_COLOR,
    bio_function:
      "A selective cellular barrier that controls what substances pass from the bloodstream into the brain — allowing nutrients, blocking pathogens and most chemicals.",
    hard_function:
      "A network security system that inspects incoming traffic and allows or blocks packets based on defined rules — protecting the core system from external threats.",
    synthesis:
      "Both are selective gatekeepers. The brain and the network both need a perimeter.",
  },
];

const neuronNode = CELL_NODES.find((n) => n.id === "neuron");
const axonNode = CELL_NODES.find((n) => n.id === "axon");
// Reuse neuronNode data for the two flanking neurons — same cell type, different position
const neuron2Node = { ...neuronNode, id: "neuron_b" };
const neuron3Node = { ...neuronNode, id: "neuron_c" };

function CellMesh({
  path,
  targetHeight,
  posX,
  posY,
  posZ,
  color,
  emissive,
  emissiveIntensity = 0.4,
  brainZoom,
  cellZoom,
  clickNode,
  onCellSelect,
  onCellZoom,
  hoverLabel,
  hoverHardware,
}) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const matsRef = useRef([]);
  const glowSpriteRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const activeRef = useRef(false);
  activeRef.current = brainZoom || cellZoom;

  useEffect(() => {
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = targetHeight / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(s);
    scene.position.set(
      -center.x * s + posX,
      -center.y * s + posY,
      -center.z * s + posZ,
    );

    const matcapKey = emissive ?? color;
    if (!matcapCache.has(matcapKey))
      matcapCache.set(matcapKey, makeMatcap(matcapKey));
    const mat = new THREE.MeshMatcapMaterial({
      color,
      matcap: matcapCache.get(matcapKey),
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 5;
      }
    });
    mat.needsUpdate = true;
    matsRef.current = [mat];
    return () => mat.dispose();
  }, [
    scene,
    targetHeight,
    posX,
    posY,
    posZ,
    color,
    emissive,
    emissiveIntensity,
  ]);

  useFrame(() => {
    const target = 0.9;
    for (const m of matsRef.current) {
      m.opacity += (target - m.opacity) * 0.06;
    }
    // Subtle resting glow; brighter on hover
    const glowTarget = hovered ? 0.45 : 0.15;
    if (glowSpriteRef.current) {
      glowSpriteRef.current.material.opacity +=
        (glowTarget - glowSpriteRef.current.material.opacity) * 0.08;
    }
  });

  const labelText = clickNode
    ? `${clickNode.organ ?? clickNode.label} / ${clickNode.hardware}`
    : hoverLabel && hoverHardware
      ? `${hoverLabel} / ${hoverHardware}`
      : null;

  return (
    <group>
      <primitive object={scene} />
      {/* Reliable hit target — GLB geometry is too thin/small for raycasting */}
      <mesh
        position={[posX, posY, posZ]}
        renderOrder={10}
        onClick={(e) => {
          if (!activeRef.current) return;
          e.stopPropagation();
          if (!clickNode) return;
          // First click while only in brainZoom: zoom into cellular view
          if (brainZoom && !cellZoom) {
            onCellZoom?.();
            return;
          }
          if (IS_MOBILE) {
            if (isPreview) {
              setIsPreview(false);
              onCellSelect?.(clickNode);
            } else setIsPreview(true);
          } else {
            onCellSelect?.(clickNode);
          }
        }}
        onPointerOver={(e) => {
          if (!activeRef.current || !clickNode) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[IS_MOBILE ? 0.05 : 0.032, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <sprite
        ref={glowSpriteRef}
        position={[posX, posY, posZ]}
        renderOrder={4}
        scale={[0.09, 0.09, 1]}
      >
        <spriteMaterial
          map={glowTexSingleton}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {(brainZoom || cellZoom) && (hovered || isPreview) && labelText && (
        <Html
          position={[posX, posY, posZ]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              color,
              fontSize: "13px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              textShadow: `0 0 10px ${color}`,
              background: "rgba(0,0,0,0.65)",
              padding: "4px 10px",
              borderRadius: "4px",
              letterSpacing: "0.05em",
            }}
          >
            {labelText}
          </div>
        </Html>
      )}
    </group>
  );
}

function CellNode({ node, cellZoom, onCellSelect, flash }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const cellZoomRef = useRef(cellZoom);
  cellZoomRef.current = cellZoom;
  const flashRef = useRef(0); // 0 = idle, >0 = flash intensity decaying
  const nextFlashRef = useRef(Math.random() * 4 + 2);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const active = cellZoomRef.current;

    if (flash && active) {
      nextFlashRef.current -= delta;
      if (nextFlashRef.current <= 0) {
        flashRef.current = 1.0;
        nextFlashRef.current = Math.random() * 3 + 1.5;
      }
      if (flashRef.current > 0) flashRef.current *= 0.88;
    }

    const target = active ? (hovered ? 1.0 : 0.85) : 0;
    const glowTarget = active
      ? hovered
        ? 0.3
        : 0.12 + flashRef.current * 0.25
      : 0;
    if (meshRef.current) {
      meshRef.current.material.opacity +=
        (target - meshRef.current.material.opacity) * 0.06;
      meshRef.current.material.emissiveIntensity =
        2 + Math.sin(t * 3 + node.position[0]) * 0.5 + flashRef.current * 4;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity +=
        (glowTarget - glowRef.current.material.opacity) * 0.06;
    }
  });

  return (
    <group position={node.position}>
      <mesh ref={glowRef} renderOrder={5}>
        <sphereGeometry args={[0.004, 12, 12]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={1}
          toneMapped={false}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <mesh ref={meshRef} renderOrder={6}>
        <sphereGeometry args={[0.002, 12, 12]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {/* Hit target */}
      <mesh
        renderOrder={7}
        onPointerOver={(e) => {
          if (!cellZoomRef.current) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          if (!cellZoomRef.current) return;
          e.stopPropagation();
          onCellSelect?.(node);
        }}
      >
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      {cellZoom && hovered && (
        <Html center style={{ pointerEvents: "none" }}>
          <div
            style={{
              color: node.color,
              fontSize: "13px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              textShadow: `0 0 10px ${node.color}`,
              background: "rgba(0,0,0,0.65)",
              padding: "4px 10px",
              borderRadius: "4px",
              letterSpacing: "0.05em",
            }}
          >
            {node.label} / {node.hardware}
          </div>
        </Html>
      )}
    </group>
  );
}

const FEMALE_Y_OFFSET = 1.615 - 1.672; // female brain center minus male brain center

function CellularView({
  brainZoom,
  cellZoom,
  darkMode,
  meshMode,
  femaleMode,
  onCellSelect,
  onCellZoom,
}) {
  return (
    <group position={[0, femaleMode ? FEMALE_Y_OFFSET : 0, 0]}>
      {/* Primary neuron — top center of cluster */}
      <CellMesh
        path="/neuron.glb"
        targetHeight={0.055}
        posX={0.014}
        posY={1.702}
        posZ={0.026}
        color="#cc88ff"
        emissive="#9933ff"
        emissiveIntensity={1.4}
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        clickNode={neuronNode}
        onCellSelect={onCellSelect}
        onCellZoom={onCellZoom}
      />
      {/* Neuron B — left, slightly lower (receiving signals from A's axon) */}
      <CellMesh
        path="/neuron.glb"
        targetHeight={0.042}
        posX={-0.018}
        posY={1.685}
        posZ={0.014}
        color="#cc88ff"
        emissive="#9933ff"
        emissiveIntensity={1.1}
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        clickNode={neuron2Node}
        onCellSelect={onCellSelect}
        onCellZoom={onCellZoom}
      />
      {/* Neuron C — right, lower and slightly deeper */}
      <CellMesh
        path="/neuron.glb"
        targetHeight={0.038}
        posX={0.034}
        posY={1.674}
        posZ={-0.004}
        color="#cc88ff"
        emissive="#9933ff"
        emissiveIntensity={1.0}
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        clickNode={neuron3Node}
        onCellSelect={onCellSelect}
        onCellZoom={onCellZoom}
      />
      {/* Axon — emerges below primary neuron soma, extends toward neuron B */}
      <CellMesh
        path="/axon-single.glb"
        targetHeight={0.05}
        posX={0.002}
        posY={1.682}
        posZ={0.018}
        color="#a8ff80"
        emissive="#44cc44"
        emissiveIntensity={0.9}
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        clickNode={axonNode}
        onCellSelect={onCellSelect}
        onCellZoom={onCellZoom}
      />
      <CellMesh
        path="/pituitary.glb"
        targetHeight={0.025}
        posX={0}
        posY={1.62}
        posZ={0.005}
        color="#ffe080"
        emissive="#ffaa00"
        emissiveIntensity={1.2}
        brainZoom={brainZoom}
        cellZoom={cellZoom}
        clickNode={pituitaryOrgan}
        onCellSelect={onCellSelect}
        onCellZoom={onCellZoom}
      />
      {CELL_NODES.map((node) => (
        <CellNode
          key={node.id}
          node={node}
          cellZoom={cellZoom}
          onCellSelect={onCellSelect}
          flash={node.id === "neuron" || node.id === "synapse"}
        />
      ))}
    </group>
  );
}

useGLTF.preload("/neuron.glb");
useGLTF.preload("/axon-single.glb");
useGLTF.preload("/pituitary.glb");

export default CellularView;
