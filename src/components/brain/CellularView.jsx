import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LOGIC_COLOR = "#64c8ff";
const INFRA_COLOR = "#ffb347";

const CELL_NODES = [
  {
    id: "neuron",
    label: "Neuron",
    hardware: "Transistor",
    position: [0.02, 1.645, 0.01],
    color: LOGIC_COLOR,
  },
  {
    id: "synapse",
    label: "Synapse",
    hardware: "Logic Gate",
    position: [-0.025, 1.63, 0.015],
    color: LOGIC_COLOR,
  },
  {
    id: "axon",
    label: "Axon",
    hardware: "Data Bus",
    position: [0.01, 1.615, -0.02],
    color: LOGIC_COLOR,
  },
  {
    id: "myelin",
    label: "Myelin",
    hardware: "Signal Insulation",
    position: [-0.015, 1.66, -0.015],
    color: LOGIC_COLOR,
  },
  {
    id: "glial",
    label: "Glial Cell",
    hardware: "Cache",
    position: [0.025, 1.625, -0.005],
    color: INFRA_COLOR,
  },
  {
    id: "bbbarrier",
    label: "Blood Brain Barrier",
    hardware: "Firewall",
    position: [0, 1.595, 0.025],
    color: INFRA_COLOR,
  },
];

function CellMesh({ path, targetHeight, posX, posY, posZ, color, cellZoom }) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const matsRef = useRef([]);
  const cellZoomRef = useRef(cellZoom);
  useEffect(() => {
    cellZoomRef.current = cellZoom;
  }, [cellZoom]);

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

    const mat = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat;
        child.renderOrder = 5;
      }
    });
    matsRef.current = [mat];
    return () => mat.dispose();
  }, [scene, targetHeight, posX, posY, posZ, color]);

  useFrame(() => {
    const target = cellZoomRef.current ? 0.9 : 0.0;
    for (const m of matsRef.current) {
      m.opacity += (target - m.opacity) * 0.06;
    }
  });

  return <primitive object={scene} />;
}

function CellNode({ node, cellZoom, onCellSelect }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const cellZoomRef = useRef(cellZoom);
  useEffect(() => {
    cellZoomRef.current = cellZoom;
  }, [cellZoom]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const active = cellZoomRef.current;
    const target = active ? (hovered ? 1.0 : 0.85) : 0;
    const glowTarget = active ? (hovered ? 0.22 : 0.12) : 0;
    if (meshRef.current) {
      meshRef.current.material.opacity +=
        (target - meshRef.current.material.opacity) * 0.06;
      meshRef.current.material.emissiveIntensity =
        2 + Math.sin(t * 3 + node.position[0]) * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity +=
        (glowTarget - glowRef.current.material.opacity) * 0.06;
    }
  });

  return (
    <group position={node.position}>
      <mesh ref={glowRef} renderOrder={5}>
        <sphereGeometry args={[0.008, 12, 12]} />
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
        <sphereGeometry args={[0.004, 12, 12]} />
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
          onCellSelect?.(node.position);
        }}
      >
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      {cellZoom && hovered && (
        <Html center distanceFactor={0.15} style={{ pointerEvents: "none" }}>
          <div
            style={{
              color: node.color,
              fontSize: "9px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              textShadow: `0 0 6px ${node.color}`,
            }}
          >
            {node.label} / {node.hardware}
          </div>
        </Html>
      )}
    </group>
  );
}

function CellularView({ cellZoom, darkMode, meshMode, onCellSelect }) {
  return (
    <group>
      <CellMesh
        path="/neuron.glb"
        targetHeight={0.03}
        posX={0.02}
        posY={1.64}
        posZ={0.01}
        color="#88b4d8"
        cellZoom={cellZoom}
      />
      <CellMesh
        path="/axon-single.glb"
        targetHeight={0.03}
        posX={-0.02}
        posY={1.62}
        posZ={-0.01}
        color="#6aa8cc"
        cellZoom={cellZoom}
      />
      <CellMesh
        path="/pituitary.glb"
        targetHeight={0.025}
        posX={0}
        posY={1.645}
        posZ={-0.01}
        color="#c8a090"
        cellZoom={cellZoom}
      />
      {CELL_NODES.map((node) => (
        <CellNode
          key={node.id}
          node={node}
          cellZoom={cellZoom}
          onCellSelect={onCellSelect}
        />
      ))}
    </group>
  );
}

useGLTF.preload("/neuron.glb");
useGLTF.preload("/axon-single.glb");
useGLTF.preload("/pituitary.glb");

export default CellularView;
