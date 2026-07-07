export const gestureConfig = {
  maxHands: 2,
  pinchStartDistance: 0.055,
  pinchReleaseDistance: 0.09,
  pinchMaxDistance: 0.24,
  palmMinExtendedFingers: 4,
  fistMaxExtendedFingers: 1,
  minGestureHoldMs: 90,
  gestureCooldownMs: 760,
  statePublishMs: 32,
  explodingDurationMs: 950,
  switchingDurationMs: 360,
  smoothing: {
    position: 0.16,
    scale: 0.14,
    opacity: 0.12
  },
  cube: {
    minScale: 0.42,
    maxScale: 2.25,
    activeScale: 1.4
  },
  mediapipe: {
    wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    modelUrl:
      'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
  }
} as const;
