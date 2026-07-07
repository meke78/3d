type ControlPanelProps = {
  isCameraOn: boolean;
  debug: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onResetScene: () => void;
  onNextObject: () => void;
  onToggleDebug: () => void;
};

export function ControlPanel({
  isCameraOn,
  debug,
  onStartCamera,
  onStopCamera,
  onResetScene,
  onNextObject,
  onToggleDebug
}: ControlPanelProps) {
  return (
    <div className="control-panel glass-card" aria-label="AR controls">
      <button type="button" onClick={onStartCamera} disabled={isCameraOn}>
        Start Camera
      </button>
      <button type="button" onClick={onStopCamera} disabled={!isCameraOn}>
        Stop Camera
      </button>
      <button type="button" onClick={onResetScene}>
        Reset Scene
      </button>
      <button type="button" onClick={onNextObject}>
        Next Object
      </button>
      <button type="button" className={debug ? 'active' : ''} onClick={onToggleDebug}>
        Toggle Debug
      </button>
    </div>
  );
}
