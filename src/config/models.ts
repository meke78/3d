export type ModelType = 'placeholder' | 'gltf';
export type PlaceholderKind = 'butterfly' | 'flower' | 'bird' | 'fish' | 'energyOrb';
export type AnimationType = 'flap' | 'bloom' | 'wing' | 'swim' | 'orbit';

export type ModelConfig = {
  id: string;
  name: string;
  type: ModelType;
  placeholder: PlaceholderKind;
  path?: string;
  scale: number;
  rotationSpeed: number;
  animationType: AnimationType;
};

export const modelConfigs: ModelConfig[] = [
  {
    id: 'butterfly',
    name: 'Butterfly Placeholder',
    type: 'placeholder',
    placeholder: 'butterfly',
    path: '/models/butterfly.glb',
    scale: 0.9,
    rotationSpeed: 0.45,
    animationType: 'flap'
  },
  {
    id: 'flower',
    name: 'Flower Placeholder',
    type: 'placeholder',
    placeholder: 'flower',
    path: '/models/flower.glb',
    scale: 0.78,
    rotationSpeed: 0.28,
    animationType: 'bloom'
  },
  {
    id: 'bird',
    name: 'Bird Placeholder',
    type: 'placeholder',
    placeholder: 'bird',
    path: '/models/bird.glb',
    scale: 0.82,
    rotationSpeed: 0.38,
    animationType: 'wing'
  },
  {
    id: 'fish',
    name: 'Fish Placeholder',
    type: 'placeholder',
    placeholder: 'fish',
    path: '/models/fish.glb',
    scale: 0.86,
    rotationSpeed: 0.32,
    animationType: 'swim'
  },
  {
    id: 'energy-orb',
    name: 'Energy Orb Placeholder',
    type: 'placeholder',
    placeholder: 'energyOrb',
    path: '/models/energy_orb.glb',
    scale: 0.76,
    rotationSpeed: 0.55,
    animationType: 'orbit'
  }
];
