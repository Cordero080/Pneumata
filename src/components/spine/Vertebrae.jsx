import { useMemo } from "react";
import * as THREE from "three";

function Vertebrae({ pts, SC }) {
  const vertebrae = useMemo(() => {
    const _Y = new THREE.Vector3(0, 1, 0);
    const _X = new THREE.Vector3(1, 0, 0);
    const total = pts.length - 1;

    return pts.slice(0, -1).map((pt, i) => {
      const a = new THREE.Vector3(...pt);
      const b = new THREE.Vector3(...pts[i + 1]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const height = dir.length() * 0.55;
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      dir.normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(_Y, dir);

      // Cervical: 0.014 → Lumbar: 0.030
      const tNorm = i / (total - 1);
      const radius = 0.014 + tNorm * 0.016;

      // Spinous process: perpendicular to spine axis, pointing posteriorly (-z)
      const posterior = new THREE.Vector3().crossVectors(dir, _X).normalize();
      if (posterior.z > 0) posterior.negate();
      const spinousQuat = new THREE.Quaternion().setFromUnitVectors(
        _Y,
        posterior,
      );
      const spinousLen = 0.012 + Math.sin(tNorm * Math.PI) * 0.018;
      const spinousCenter = mid
        .clone()
        .add(posterior.clone().multiplyScalar(radius + spinousLen * 0.5));

      // Transverse processes
      const canalHalf = radius * 0.7;
      const p = tNorm;
      const baseProfile =
        0.62 +
        0.15 * Math.cos(p * 2 * Math.PI + 0.5) +
        0.55 * Math.pow(Math.max(0, p - 0.55), 1.5);
      const sacralFade = p > 0.82 ? 1 - Math.pow((p - 0.82) / 0.18, 1.5) : 1;
      const transHalfLen = radius * Math.max(0.12, baseProfile * sacralFade);

      const isLumbar = p > 0.62 && p <= 0.82;
      const isSacral = p > 0.82;
      const transRadiusTip = isLumbar ? radius * 0.4 : isSacral ? 0.001 : 0.004;
      const transRadiusBase = isLumbar
        ? radius * 0.12
        : isSacral
          ? 0.001
          : 0.002;
      const transOffset = canalHalf + transHalfLen / 2;
      const postShift = posterior.clone().multiplyScalar(radius * 0.55);

      const transPitch = Math.sin(tNorm * Math.PI) * 0.2;
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -transPitch,
      );
      const rightTransQuat = new THREE.Quaternion()
        .setFromUnitVectors(_Y, _X)
        .premultiply(pitchQuat);
      const _X_neg = new THREE.Vector3(-1, 0, 0);
      const leftTransQuat = new THREE.Quaternion()
        .setFromUnitVectors(_Y, _X_neg)
        .premultiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            transPitch,
          ),
        );

      const leftTrans = [
        mid.x - transOffset + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      ];
      const rightTrans = [
        mid.x + transOffset + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      ];

      // Vertebral arch — laminae
      const leftArchAttach = new THREE.Vector3(
        mid.x - canalHalf + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      );
      const rightArchAttach = new THREE.Vector3(
        mid.x + canalHalf + postShift.x,
        mid.y + postShift.y,
        mid.z + postShift.z,
      );
      const makeLamina = (from, to) => {
        const d = new THREE.Vector3().subVectors(to, from);
        const length = d.length();
        const center = from.clone().add(d.clone().multiplyScalar(0.5));
        const lquat = new THREE.Quaternion().setFromUnitVectors(
          _Y,
          d.normalize(),
        );
        return { center, length, lquat };
      };
      const leftLamina = makeLamina(leftArchAttach, spinousCenter);
      const rightLamina = makeLamina(rightArchAttach, spinousCenter);

      // Vertebral body lathe profile
      const bodyGeo = new THREE.LatheGeometry(
        [
          new THREE.Vector2(radius * 1.06, -height / 2),
          new THREE.Vector2(radius * 0.93, -height * 0.28),
          new THREE.Vector2(radius * 0.84, 0),
          new THREE.Vector2(radius * 0.93, height * 0.28),
          new THREE.Vector2(radius * 1.06, height / 2),
        ],
        12,
      );

      return {
        mid,
        quat,
        bodyGeo,
        spinousQuat,
        spinousLen,
        spinousCenter,
        transHalfLen,
        transRadiusTip,
        transRadiusBase,
        leftTransQuat,
        rightTransQuat,
        leftTrans,
        rightTrans,
        leftLamina,
        rightLamina,
      };
    });
  }, [pts]);

  return (
    <>
      {vertebrae.map(
        (
          {
            mid,
            quat,
            bodyGeo,
            spinousQuat,
            spinousLen,
            spinousCenter,
            transHalfLen,
            transRadiusTip,
            transRadiusBase,
            leftTransQuat,
            rightTransQuat,
            leftTrans,
            rightTrans,
            leftLamina,
            rightLamina,
          },
          i,
        ) => (
          <group key={`vb-${i}`}>
            {/* Vertebral body — waisted lathe profile */}
            <mesh position={mid} quaternion={quat}>
              <primitive object={bodyGeo} attach="geometry" />
              <meshBasicMaterial
                color={SC.bone}
                transparent
                opacity={SC.bodyOp}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>

            {/* Spinous process */}
            <mesh position={spinousCenter} quaternion={spinousQuat}>
              <cylinderGeometry args={[0.003, 0.005, spinousLen, 6]} />
              <meshBasicMaterial
                color={SC.bone}
                transparent
                opacity={SC.spinOp}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>

            {/* Transverse processes */}
            {[
              [leftTrans, leftTransQuat],
              [rightTrans, rightTransQuat],
            ].map(([pos, tq], side) => (
              <mesh key={side} position={pos} quaternion={tq}>
                <cylinderGeometry
                  args={[transRadiusTip, transRadiusBase, transHalfLen, 6]}
                />
                <meshBasicMaterial
                  color={SC.bone}
                  transparent
                  opacity={SC.transOp}
                  depthTest={false}
                  depthWrite={false}
                />
              </mesh>
            ))}

            {/* Vertebral arch laminae */}
            {[leftLamina, rightLamina].map(
              ({ center, length, lquat }, side) => (
                <mesh key={`lam-${side}`} position={center} quaternion={lquat}>
                  <cylinderGeometry args={[0.002, 0.002, length, 6]} />
                  <meshBasicMaterial
                    color={SC.bone}
                    transparent
                    opacity={SC.lamOp}
                    depthTest={false}
                    depthWrite={false}
                  />
                </mesh>
              ),
            )}
          </group>
        ),
      )}
    </>
  );
}

export default Vertebrae;
