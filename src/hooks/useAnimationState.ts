import { useCallback, useEffect, useRef, useState } from 'react';
import { gestureConfig } from '../config/gestureConfig';
import { modelConfigs } from '../config/models';
import type { ARState, GestureFrame } from '../hand/gestureTypes';
import { clamp, mapRange } from '../utils/math';

export type ARSceneState = {
  mode: ARState;
  objectIndex: number;
  objectName: string;
  targetNormalized: { x: number; y: number };
  targetScale: number;
  cubeVisible: boolean;
  objectVisible: boolean;
  explosionId: number;
  lastGesture: string;
};

const defaultSceneState: ARSceneState = {
  mode: 'IDLE',
  objectIndex: 0,
  objectName: modelConfigs[0]?.name ?? 'Object',
  targetNormalized: { x: 0.5, y: 0.5 },
  targetScale: 0.45,
  cubeVisible: false,
  objectVisible: false,
  explosionId: 0,
  lastGesture: 'none'
};

function scaleFromPinchDistance(distance: number) {
  if (!Number.isFinite(distance) || distance <= 0) return gestureConfig.cube.minScale;
  return mapRange(
    distance,
    gestureConfig.pinchStartDistance,
    gestureConfig.pinchMaxDistance,
    gestureConfig.cube.minScale,
    gestureConfig.cube.maxScale
  );
}

export function useAnimationState(gestureFrame: GestureFrame) {
  const stateRef = useRef(defaultSceneState);
  const timersRef = useRef<number[]>([]);
  const lastTransitionRef = useRef(-Number.MAX_SAFE_INTEGER);
  const lastPublishRef = useRef(0);
  const [sceneState, setSceneState] = useState<ARSceneState>(defaultSceneState);

  const publish = useCallback((force = false) => {
    const now = performance.now();
    if (!force && now - lastPublishRef.current < gestureConfig.statePublishMs) return;
    lastPublishRef.current = now;
    const next = { ...stateRef.current, targetNormalized: { ...stateRef.current.targetNormalized } };
    setSceneState(next);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const enterMode = useCallback(
    (mode: ARState) => {
      if (stateRef.current.mode === mode) return;

      stateRef.current.mode = mode;
      lastTransitionRef.current = performance.now();

      if (mode === 'EXPLODING') {
        stateRef.current.explosionId += 1;
        stateRef.current.cubeVisible = true;
        stateRef.current.objectVisible = false;

        const timer = window.setTimeout(() => {
          stateRef.current.mode = 'DESTROYED';
          stateRef.current.cubeVisible = false;
          stateRef.current.objectVisible = false;
          publish(true);
        }, gestureConfig.explodingDurationMs);
        timersRef.current.push(timer);
      }

      if (mode === 'SWITCHING') {
        const nextIndex = (stateRef.current.objectIndex + 1) % modelConfigs.length;
        stateRef.current.objectIndex = nextIndex;
        stateRef.current.objectName = modelConfigs[nextIndex]?.name ?? 'Object';
        stateRef.current.cubeVisible = false;
        stateRef.current.objectVisible = false;

        const timer = window.setTimeout(() => {
          stateRef.current.mode = 'IDLE';
          stateRef.current.targetScale = gestureConfig.cube.minScale;
          publish(true);
        }, gestureConfig.switchingDurationMs);
        timersRef.current.push(timer);
      }

      publish(true);
    },
    [publish]
  );

  const resetScene = useCallback(() => {
    clearTimers();
    stateRef.current = {
      ...defaultSceneState,
      objectIndex: stateRef.current.objectIndex,
      objectName: modelConfigs[stateRef.current.objectIndex]?.name ?? 'Object',
      explosionId: stateRef.current.explosionId
    };
    publish(true);
  }, [clearTimers, publish]);

  const nextObject = useCallback(() => {
    clearTimers();
    const nextIndex = (stateRef.current.objectIndex + 1) % modelConfigs.length;
    stateRef.current = {
      ...defaultSceneState,
      objectIndex: nextIndex,
      objectName: modelConfigs[nextIndex]?.name ?? 'Object',
      explosionId: stateRef.current.explosionId
    };
    publish(true);
  }, [clearTimers, publish]);

  useEffect(() => {
    const now = performance.now();
    const hand = gestureFrame.primaryHand;
    const hasPinch = gestureFrame.hands.some((item) => item.gesture === 'pinch');
    const hasExpanding = gestureFrame.hands.some((item) => item.gesture === 'expanding');
    const hasOpenPalm = gestureFrame.hands.some((item) => item.gesture === 'openPalm');
    const hasFist = gestureFrame.hands.some((item) => item.gesture === 'fist');
    const canTrigger = now - lastTransitionRef.current > gestureConfig.gestureCooldownMs;

    stateRef.current.lastGesture = gestureFrame.gesture;

    if (hand) {
      stateRef.current.targetNormalized = hand.pinchCenter;
      stateRef.current.targetScale = clamp(
        scaleFromPinchDistance(hand.pinchDistance),
        gestureConfig.cube.minScale,
        gestureConfig.cube.maxScale
      );
    }

    const currentMode = stateRef.current.mode;

    if (hasOpenPalm && ['PINCHING', 'EXPANDING', 'ACTIVE'].includes(currentMode) && canTrigger) {
      enterMode('EXPLODING');
      return;
    }

    switch (currentMode) {
      case 'IDLE':
        stateRef.current.cubeVisible = false;
        stateRef.current.objectVisible = false;
        if (hasPinch && canTrigger) {
          stateRef.current.targetScale = gestureConfig.cube.minScale;
          stateRef.current.cubeVisible = true;
          stateRef.current.objectVisible = true;
          enterMode('PINCHING');
        }
        break;

      case 'PINCHING':
        stateRef.current.cubeVisible = true;
        stateRef.current.objectVisible = true;
        if (hasExpanding || (hand?.pinchDistance ?? 0) > gestureConfig.pinchReleaseDistance) {
          enterMode('EXPANDING');
        }
        break;

      case 'EXPANDING':
        stateRef.current.cubeVisible = true;
        stateRef.current.objectVisible = true;
        if (stateRef.current.targetScale >= gestureConfig.cube.activeScale || (!hasPinch && !hasExpanding && hand)) {
          enterMode('ACTIVE');
        }
        break;

      case 'ACTIVE':
        stateRef.current.cubeVisible = true;
        stateRef.current.objectVisible = true;
        break;

      case 'DESTROYED':
        stateRef.current.cubeVisible = false;
        stateRef.current.objectVisible = false;
        if (hasFist && canTrigger) {
          enterMode('SWITCHING');
        }
        break;

      case 'EXPLODING':
      case 'SWITCHING':
        break;

      default:
        break;
    }

    publish();
  }, [enterMode, gestureFrame, publish]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    sceneState,
    resetScene,
    nextObject
  };
}
