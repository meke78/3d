import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { ARSceneState } from '../hooks/useAnimationState';
import { mapNormalizedToWorld } from '../utils/coordinateMapping';
import { gestureConfig } from '../config/gestureConfig';
import { CameraRig } from './CameraRig';
import { Lights } from './Lights';
import { ModelManager } from './ModelManager';
import { ParticleExplosion } from './ParticleExplosion';
import { WireframeCube } from './WireframeCube';

type ThreeARSceneProps = {
  sceneState: ARSceneState;
};

function damp(current: number, target: number, smoothing: number) {
  return current + (target - current) * smoothing;
}

function ARContent({ sceneState }: ThreeARSceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { viewport } = useThree();
  const tempTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const [x, y, z] = mapNormalizedToWorld(sceneState.targetNormalized, viewport, 0);
    tempTarget.current.set(x, y, z);

    const positionAlpha = 1 - Math.pow(1 - gestureConfig.smoothing.position, delta * 60);
    groupRef.current.position.lerp(tempTarget.current, positionAlpha);

    const targetScale = sceneState.cubeVisible || sceneState.mode === 'EXPLODING' ? sceneState.targetScale : 0.001;
    const scaleAlpha = 1 - Math.pow(1 - gestureConfig.smoothing.scale, delta * 60);
    const nextScale = damp(groupRef.current.scale.x, targetScale, scaleAlpha);
    groupRef.current.scale.setScalar(nextScale);

  });

  return (
    <group ref={groupRef}>
      <WireframeCube visible={sceneState.cubeVisible && sceneState.mode !== 'EXPLODING'} />
      <ModelManager objectIndex={sceneState.objectIndex} visible={sceneState.objectVisible} />
      <ParticleExplosion triggerId={sceneState.explosionId} />
    </group>
  );
}

export function ThreeARScene({ sceneState }: ThreeARSceneProps) {
  return (
    <div className="three-layer" aria-hidden="true">
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
      >
        <Lights />
        <CameraRig />
        <ARContent sceneState={sceneState} />
      </Canvas>
    </div>
  );
}
