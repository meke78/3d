import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const cornerPositions: [number, number, number][] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [-0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5]
];

type WireframeCubeProps = {
  visible: boolean;
};

export function WireframeCube({ visible }: WireframeCubeProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const opacityRef = useRef(0);
  const geometry = useMemo(() => new THREE.BoxGeometry(1.65, 1.65, 1.65), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.12;
    groupRef.current.rotation.x = Math.sin(performance.now() * 0.0007) * 0.045;

    const targetOpacity = visible ? 1 : 0;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.12;
    groupRef.current.visible = visible || opacityRef.current > 0.02;

    groupRef.current.traverse((object) => {
      const material = (object as THREE.Mesh | THREE.LineSegments).material;
      if (!material) return;
      const materials = Array.isArray(material) ? material : [material];
      materials.forEach((mat) => {
        if ('opacity' in mat) {
          mat.opacity = opacityRef.current * (mat.userData.baseOpacity ?? 1);
          mat.transparent = true;
          mat.needsUpdate = true;
        }
      });
    });
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial transparent opacity={0} color="#dff8ff" userData={{ baseOpacity: 1 }} />
      </lineSegments>

      <mesh scale={[1.65, 1.65, 1.65]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} color="#aeeeff" depthWrite={false} userData={{ baseOpacity: 0.055 }} />
      </mesh>

      {cornerPositions.map((position) => (
        <mesh key={position.join(',')} position={[position[0] * 1.65, position[1] * 1.65, position[2] * 1.65]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} color="#ffffff" userData={{ baseOpacity: 1 }} />
        </mesh>
      ))}
    </group>
  );
}
