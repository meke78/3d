import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { easeOutCubic, randomBetween } from '../utils/math';

type ParticleExplosionProps = {
  triggerId: number;
};

type Particle = {
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
};

const PARTICLE_COUNT = 115;
const DURATION = 0.95;

function createParticle() {
  const direction = new THREE.Vector3(
    randomBetween(-1, 1),
    randomBetween(-1, 1),
    randomBetween(-1, 1)
  ).normalize();

  direction.multiplyScalar(randomBetween(0.85, 2.1));

  return {
    velocity: direction,
    spin: new THREE.Vector3(randomBetween(-1, 1), randomBetween(-1, 1), randomBetween(-1, 1))
  } satisfies Particle;
}

export function ParticleExplosion({ triggerId }: ParticleExplosionProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const startTimeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const [active, setActive] = useState(false);

  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colors = useMemo(() => {
    const values = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      values[i * 3] = randomBetween(0.72, 1);
      values[i * 3 + 1] = randomBetween(0.86, 1);
      values[i * 3 + 2] = 1;
    }
    return values;
  }, []);

  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return buffer;
  }, [colors, positions]);

  useEffect(() => {
    if (triggerId <= 0) return;

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle());
    positions.fill(0);
    geometry.attributes.position.needsUpdate = true;
    startTimeRef.current = performance.now();
    setActive(true);
  }, [geometry.attributes.position, positions, triggerId]);

  useFrame(() => {
    if (!active || !pointsRef.current) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased = easeOutCubic(progress);
    const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

    particlesRef.current.forEach((particle, index) => {
      const base = index * 3;
      const drift = Math.sin(elapsed * 7 + index) * 0.06;
      positions[base] = particle.velocity.x * eased + particle.spin.x * drift;
      positions[base + 1] = particle.velocity.y * eased + particle.spin.y * drift - progress * progress * 0.18;
      positions[base + 2] = particle.velocity.z * eased + particle.spin.z * drift;
    });

    positionAttr.needsUpdate = true;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - progress;
    material.size = 0.048 + progress * 0.025;

    if (progress >= 1) {
      setActive(false);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} visible={active}>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
