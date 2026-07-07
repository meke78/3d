import { Clone, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import type { ModelConfig } from '../config/models';
import { modelConfigs } from '../config/models';
import { PlaceholderModel } from './PlaceholderModels';

type ModelManagerProps = {
  objectIndex: number;
  visible: boolean;
};

function GLTFModel({ config, visible }: { config: ModelConfig; visible: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { scene } = useGLTF(config.path ?? '/models/missing.glb');

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * config.rotationSpeed;
    groupRef.current.position.y = Math.sin(performance.now() * 0.0018) * 0.04;
  });

  return (
    <group ref={groupRef} visible={visible} scale={config.scale}>
      <Clone object={scene} />
    </group>
  );
}

function LoadingSpark() {
  const ref = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 1.4;
    ref.current.rotation.y += delta * 1.2;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.42, 1]} />
      <meshStandardMaterial color="#dff8ff" emissive="#73e7ff" emissiveIntensity={1.1} transparent opacity={0.6} />
    </mesh>
  );
}

export function ModelManager({ objectIndex, visible }: ModelManagerProps) {
  const config = modelConfigs[objectIndex] ?? modelConfigs[0];

  if (config.type === 'gltf' && config.path) {
    return (
      <Suspense fallback={<LoadingSpark />}>
        <GLTFModel config={config} visible={visible} />
      </Suspense>
    );
  }

  return (
    <group scale={config.scale} visible={visible}>
      <PlaceholderModel kind={config.placeholder} visible={visible} rotationSpeed={config.rotationSpeed} />
    </group>
  );
}
