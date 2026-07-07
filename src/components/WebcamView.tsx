type WebcamViewProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  error?: string;
};

export function WebcamView({ videoRef, isCameraOn, error }: WebcamViewProps) {
  return (
    <section className="webcam-stage" aria-label="Webcam preview">
      <video
        ref={videoRef}
        className="webcam-video"
        autoPlay
        playsInline
        muted
        aria-hidden="true"
      />

      {!isCameraOn && (
        <div className="camera-placeholder glass-card">
          <div className="placeholder-orb" />
          <h1>AR Hand 3D</h1>
          <p>Klik Start Camera untuk mengaktifkan webcam dan gesture tracking.</p>
        </div>
      )}

      {error && (
        <div className="camera-error glass-card" role="alert">
          <strong>Camera / Tracking Error</strong>
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
