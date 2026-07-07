import type { Vec2, Vec3Tuple } from './math';

export type ViewportSize = {
  width: number;
  height: number;
};

/**
 * MediaPipe x/y adalah normalized 0..1 dari video mentah.
 * Video di UI dibuat mirrored seperti selfie, jadi x dibalik agar overlay 3D pas di tangan yang terlihat.
 */
export function mapNormalizedToWorld(point: Vec2, viewport: ViewportSize, z = 0): Vec3Tuple {
  const mirroredX = 1 - point.x;
  const x = (mirroredX - 0.5) * viewport.width;
  const y = (0.5 - point.y) * viewport.height;
  return [x, y, z];
}

export function safeNormalizedPoint(point?: Vec2): Vec2 {
  return {
    x: point?.x ?? 0.5,
    y: point?.y ?? 0.5
  };
}
