import { useFrame, useThree } from '@react-three/fiber';

export function CameraRig() {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    camera.position.x += (pointer.x * 0.08 - camera.position.x) * 0.015;
    camera.position.y += (pointer.y * 0.06 - camera.position.y) * 0.015;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
