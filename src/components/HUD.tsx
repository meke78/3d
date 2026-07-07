import type { ARSceneState } from '../hooks/useAnimationState';
import type { GestureFrame } from '../hand/gestureTypes';

type HUDProps = {
  sceneState: ARSceneState;
  gestureFrame: GestureFrame;
  fps: number;
  trackerStatus: string;
};

export function HUD({ sceneState, gestureFrame, fps, trackerStatus }: HUDProps) {
  return (
    <aside className="hud glass-card" aria-label="AR status panel">
      <div className="hud-topline">
        <span className="pulse-dot" />
        <span>{trackerStatus}</span>
      </div>

      <div className="hud-grid">
        <span>State</span>
        <strong>{sceneState.mode}</strong>

        <span>Gesture</span>
        <strong>{gestureFrame.gesture}</strong>

        <span>Object</span>
        <strong>{sceneState.objectName}</strong>

        <span>Hands</span>
        <strong>{gestureFrame.hands.length}</strong>

        <span>FPS</span>
        <strong>{fps}</strong>
      </div>
    </aside>
  );
}
