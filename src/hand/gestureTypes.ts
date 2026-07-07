export type NormalizedLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type GestureName = 'none' | 'pinch' | 'expanding' | 'openPalm' | 'fist';

export type ARState =
  | 'IDLE'
  | 'PINCHING'
  | 'EXPANDING'
  | 'ACTIVE'
  | 'EXPLODING'
  | 'DESTROYED'
  | 'SWITCHING';

export type HandGestureInfo = {
  id: string;
  handedness: string;
  landmarks: NormalizedLandmark[];
  gesture: GestureName;
  pinchDistance: number;
  pinchCenter: { x: number; y: number };
  extendedFingers: number;
};

export type GestureFrame = {
  timestamp: number;
  hands: HandGestureInfo[];
  primaryHand?: HandGestureInfo;
  destroyHand?: HandGestureInfo;
  gesture: GestureName;
  pinchDistance: number;
  pinchCenter: { x: number; y: number };
};

export type GestureDebugInfo = {
  handsDetected: number;
  activeGesture: GestureName;
  pinchDistance: number;
};
