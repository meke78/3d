import { useCallback, useState } from 'react';
import { analyzeLandmarkerResult } from './gestureUtils';
import type { GestureFrame } from './gestureTypes';

const emptyFrame: GestureFrame = {
  timestamp: 0,
  hands: [],
  gesture: 'none',
  pinchDistance: 0,
  pinchCenter: { x: 0.5, y: 0.5 }
};

export function useHandGesture() {
  const [gestureFrame, setGestureFrame] = useState<GestureFrame>(emptyFrame);

  const consumeLandmarkerResult = useCallback((result: unknown) => {
    setGestureFrame(analyzeLandmarkerResult(result));
  }, []);

  const resetGestureFrame = useCallback(() => {
    setGestureFrame({ ...emptyFrame, timestamp: performance.now() });
  }, []);

  return {
    gestureFrame,
    consumeLandmarkerResult,
    resetGestureFrame
  };
}
