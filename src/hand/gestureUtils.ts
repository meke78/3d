import { gestureConfig } from '../config/gestureConfig';
import { distance2D } from '../utils/math';
import type { GestureFrame, GestureName, HandGestureInfo, NormalizedLandmark } from './gestureTypes';

const WRIST = 0;
const THUMB_TIP = 4;
const THUMB_IP = 3;
const INDEX_MCP = 5;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;

function midpoint(a: NormalizedLandmark, b: NormalizedLandmark) {
  return {
    x: (a.x + b.x) * 0.5,
    y: (a.y + b.y) * 0.5
  };
}

function isFingerExtended(landmarks: NormalizedLandmark[], tipIndex: number, pipIndex: number) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  if (!tip || !pip) return false;
  // Untuk kamera tegak, jari yang terbuka biasanya memiliki tip lebih tinggi daripada PIP.
  return tip.y < pip.y - 0.018;
}

function isThumbExtended(landmarks: NormalizedLandmark[]) {
  const thumbTip = landmarks[THUMB_TIP];
  const thumbIp = landmarks[THUMB_IP];
  const indexMcp = landmarks[INDEX_MCP];
  const wrist = landmarks[WRIST];
  if (!thumbTip || !thumbIp || !indexMcp || !wrist) return false;

  const thumbAwayFromPalm = distance2D(thumbTip, indexMcp) > distance2D(thumbIp, indexMcp) + 0.018;
  const thumbAboveWrist = thumbTip.y < wrist.y - 0.035;
  return thumbAwayFromPalm || thumbAboveWrist;
}

export function countExtendedFingers(landmarks: NormalizedLandmark[]) {
  if (landmarks.length < 21) return 0;

  let count = 0;
  if (isThumbExtended(landmarks)) count += 1;
  if (isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP)) count += 1;
  if (isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_PIP)) count += 1;
  if (isFingerExtended(landmarks, RING_TIP, RING_PIP)) count += 1;
  if (isFingerExtended(landmarks, PINKY_TIP, PINKY_PIP)) count += 1;
  return count;
}

export function getPinchDistance(landmarks: NormalizedLandmark[]) {
  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  if (!thumbTip || !indexTip) return Number.POSITIVE_INFINITY;
  return distance2D(thumbTip, indexTip);
}

export function getPinchCenter(landmarks: NormalizedLandmark[]) {
  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  if (!thumbTip || !indexTip) return { x: 0.5, y: 0.5 };
  return midpoint(thumbTip, indexTip);
}

export function classifyGesture(landmarks: NormalizedLandmark[]): {
  gesture: GestureName;
  pinchDistance: number;
  pinchCenter: { x: number; y: number };
  extendedFingers: number;
} {
  const pinchDistance = getPinchDistance(landmarks);
  const pinchCenter = getPinchCenter(landmarks);
  const extendedFingers = countExtendedFingers(landmarks);

  if (pinchDistance <= gestureConfig.pinchStartDistance) {
    return { gesture: 'pinch', pinchDistance, pinchCenter, extendedFingers };
  }

  if (extendedFingers >= gestureConfig.palmMinExtendedFingers) {
    return { gesture: 'openPalm', pinchDistance, pinchCenter, extendedFingers };
  }

  if (extendedFingers <= gestureConfig.fistMaxExtendedFingers && pinchDistance > gestureConfig.pinchReleaseDistance) {
    return { gesture: 'fist', pinchDistance, pinchCenter, extendedFingers };
  }

  if (pinchDistance > gestureConfig.pinchStartDistance && pinchDistance <= gestureConfig.pinchMaxDistance) {
    return { gesture: 'expanding', pinchDistance, pinchCenter, extendedFingers };
  }

  return { gesture: 'none', pinchDistance, pinchCenter, extendedFingers };
}

export function analyzeLandmarkerResult(result: unknown): GestureFrame {
  const raw = result as {
    landmarks?: NormalizedLandmark[][];
    handednesses?: Array<Array<{ categoryName?: string; score?: number }>>;
  };

  const hands: HandGestureInfo[] = (raw.landmarks ?? []).slice(0, gestureConfig.maxHands).map((landmarks, index) => {
    const analysis = classifyGesture(landmarks);
    const handedness = raw.handednesses?.[index]?.[0]?.categoryName ?? `Hand ${index + 1}`;

    return {
      id: `${handedness}-${index}`,
      handedness,
      landmarks,
      ...analysis
    };
  });

  const pinchHand = hands.find((hand) => hand.gesture === 'pinch' || hand.gesture === 'expanding');
  const destroyHand = hands.find((hand) => hand.gesture === 'openPalm');
  const fistHand = hands.find((hand) => hand.gesture === 'fist');
  const primaryHand = pinchHand ?? hands[0];
  const activeGesture = pinchHand?.gesture ?? destroyHand?.gesture ?? fistHand?.gesture ?? 'none';

  return {
    timestamp: performance.now(),
    hands,
    primaryHand,
    destroyHand,
    gesture: activeGesture,
    pinchDistance: primaryHand?.pinchDistance ?? 0,
    pinchCenter: primaryHand?.pinchCenter ?? { x: 0.5, y: 0.5 }
  };
}
