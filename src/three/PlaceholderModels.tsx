import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlaceholderKind } from '../config/models';

type PlaceholderProps = {
  kind: PlaceholderKind;
  visible: boolean;
  rotationSpeed: number;
};

function GlowMaterial({ color, opacity = 0.82 }: { color: string; opacity?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.75} transparent opacity={opacity} />;
}

function Butterfly({ visible, rotationSpeed }: Omit<PlaceholderProps, 'kind'>) {
  const groupRef = useRef<THREE.Group | null>(null);
  const leftWingRef = useRef<THREE.Mesh | null>(null);
  const rightWingRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
    const flap = Math.sin(performance.now() * 0.009) * 0.42;
    if (leftWingRef.current) leftWingRef.current.rotation.y = -0.45 - flap;
    if (rightWingRef.current) rightWingRef.current.rotation.y = 0.45 + flap;
  });

  return (
    <group ref={groupRef} visible={visible}>
      <mesh scale={[0.14, 0.72, 0.14]}>
        <capsuleGeometry args={[0.18, 1.08, 8, 18]} />
        <GlowMaterial color="#e8faff" opacity={0.9} />
      </mesh>
      <mesh ref={leftWingRef} position={[-0.48, 0.1, 0]} rotation={[0, -0.7, 0.18]} scale={[0.78, 1.08, 0.035]}>
        <circleGeometry args={[0.65, 48]} />
        <GlowMaterial color="#9ad9ff" opacity={0.48} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.48, 0.1, 0]} rotation={[0, 0.7, -0.18]} scale={[0.78, 1.08, 0.035]}>
        <circleGeometry args={[0.65, 48]} />
        <GlowMaterial color="#d9b9ff" opacity={0.48} />
      </mesh>
      <mesh position={[-0.34, -0.38, 0.02]} rotation={[0, -0.45, -0.4]} scale={[0.38, 0.48, 0.03]}>
        <circleGeometry args={[0.55, 36]} />
        <GlowMaterial color="#ffffff" opacity={0.34} />
      </mesh>
      <mesh position={[0.34, -0.38, 0.02]} rotation={[0, 0.45, 0.4]} scale={[0.38, 0.48, 0.03]}>
        <circleGeometry args={[0.55, 36]} />
        <GlowMaterial color="#ffffff" opacity={0.34} />
      </mesh>
    </group>
  );
}

function Flower({ visible, rotationSpeed }: Omit<PlaceholderProps, 'kind'>) {
  const groupRef = useRef<THREE.Group | null>(null);
  const petals = useMemo(() => Array.from({ length: 10 }, (_, index) => index), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * rotationSpeed;
    const pulse = 1 + Math.sin(performance.now() * 0.0035) * 0.04;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} visible={visible}>
      {petals.map((item) => {
        const angle = (item / petals.length) * Math.PI * 2;
        return (
          <mesh
            key={item}
            position={[Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0]}
            rotation={[0, 0, angle]}
            scale={[0.32, 0.68, 0.06]}
          >
            <sphereGeometry args={[0.36, 24, 24]} />
            <GlowMaterial color={item % 2 === 0 ? '#ffb7dd' : '#bde9ff'} opacity={0.68} />
          </mesh>
        );
      })}
      <mesh scale={[0.45, 0.45, 0.18]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <GlowMaterial color="#fff2a8" opacity={0.95} />
      </mesh>
    </group>
  );
}

function Bird({ visible, rotationSpeed }: Omit<PlaceholderProps, 'kind'>) {
  const groupRef = useRef<THREE.Group | null>(null);
  const leftWingRef = useRef<THREE.Mesh | null>(null);
  const rightWingRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
    const flap = Math.sin(performance.now() * 0.0075) * 0.34;
    if (leftWingRef.current) leftWingRef.current.rotation.z = 0.36 + flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -0.36 - flap;
  });

  return (
    <group ref={groupRef} visible={visible} rotation={[0, 0.4, 0]}>
      <mesh scale={[0.55, 0.34, 0.32]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <GlowMaterial color="#dff8ff" opacity={0.86} />
      </mesh>
      <mesh position={[0.48, 0.12, 0]} scale={[0.28, 0.24, 0.24]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <GlowMaterial color="#ffffff" opacity={0.86} />
      </mesh>
      <mesh ref={leftWingRef} position={[-0.34, 0, 0.05]} rotation={[0, 0.1, 0.48]} scale={[0.78, 0.16, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <GlowMaterial color="#8ed8ff" opacity={0.58} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.34, 0, 0.05]} rotation={[0, 0.1, -0.48]} scale={[0.78, 0.16, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <GlowMaterial color="#8ed8ff" opacity={0.58} />
      </mesh>
      <mesh position={[0.78, 0.13, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.14, 0.14, 0.18]}>
        <coneGeometry args={[0.5, 0.8, 4]} />
        <GlowMaterial color="#ffd28d" opacity={0.9} />
      </mesh>
    </group>
  );
}

function Fish({ visible, rotationSpeed }: Omit<PlaceholderProps, 'kind'>) {
  const groupRef = useRef<THREE.Group | null>(null);
  const tailRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
    groupRef.current.position.y = Math.sin(performance.now() * 0.0025) * 0.05;
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(performance.now() * 0.012) * 0.45;
  });

  return (
    <group ref={groupRef} visible={visible}>
      <mesh scale={[0.82, 0.42, 0.36]}>
        <sphereGeometry args={[0.58, 36, 36]} />
        <GlowMaterial color="#7be7ff" opacity={0.82} />
      </mesh>
      <mesh ref={tailRef} position={[-0.76, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.42, 0.42, 0.1]}>
        <coneGeometry args={[0.65, 0.85, 3]} />
        <GlowMaterial color="#d0f7ff" opacity={0.7} />
      </mesh>
      <mesh position={[0.46, 0.12, 0.28]} scale={[0.08, 0.08, 0.08]}>
        <sphereGeometry args={[0.45, 14, 14]} />
        <meshStandardMaterial color="#07101e" emissive="#6ee7ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.04, 0.38, 0]} rotation={[0, 0, 0.3]} scale={[0.22, 0.12, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <GlowMaterial color="#ffffff" opacity={0.36} />
      </mesh>
    </group>
  );
}

function OrbitingDot({ radius, speed, offset }: { radius: number; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() * 0.001 * speed + offset;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 1.31) * radius * 0.46,
      Math.sin(t) * radius
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.028, 10, 10]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
}

function EnergyOrb({ visible, rotationSpeed }: Omit<PlaceholderProps, 'kind'>) {
  const groupRef = useRef<THREE.Group | null>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        radius: 0.62 + (index % 4) * 0.08,
        speed: 0.4 + (index % 5) * 0.08,
        offset: (index / 18) * Math.PI * 2
      })),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <group ref={groupRef} visible={visible}>
      <mesh>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshStandardMaterial color="#dff9ff" emissive="#66e4ff" emissiveIntensity={1.6} transparent opacity={0.78} />
      </mesh>
      <mesh scale={[1.22, 1.22, 1.22]}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshBasicMaterial color="#8bf1ff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {particles.map((particle) => (
        <OrbitingDot key={particle.id} radius={particle.radius} speed={particle.speed} offset={particle.offset} />
      ))}
    </group>
  );
}

export function PlaceholderModel({ kind, visible, rotationSpeed }: PlaceholderProps) {
  if (kind === 'butterfly') return <Butterfly visible={visible} rotationSpeed={rotationSpeed} />;
  if (kind === 'flower') return <Flower visible={visible} rotationSpeed={rotationSpeed} />;
  if (kind === 'bird') return <Bird visible={visible} rotationSpeed={rotationSpeed} />;
  if (kind === 'fish') return <Fish visible={visible} rotationSpeed={rotationSpeed} />;
  return <EnergyOrb visible={visible} rotationSpeed={rotationSpeed} />;
}
