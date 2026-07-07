import { useCallback, useEffect, useRef, useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { DebugOverlay } from './components/DebugOverlay';
import { HUD } from './components/HUD';
import { WebcamView } from './components/WebcamView';
import { HandTracker } from './hand/HandTracker';
import { useHandGesture } from './hand/useHandGesture';
import { ThreeARScene } from './three/ThreeARScene';
import { useAnimationState } from './hooks/useAnimationState';

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [debug, setDebug] = useState(false);
  const [error, setError] = useState('');
  const [fps, setFps] = useState(0);
  const [trackerStatus, setTrackerStatus] = useState('Camera idle');

  const { gestureFrame, consumeLandmarkerResult, resetGestureFrame } = useHandGesture();
  const { sceneState, resetScene, nextObject } = useAnimationState(gestureFrame);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setTrackerStatus('Camera stopped');
    resetGestureFrame();
  }, [resetGestureFrame]);

  const startCamera = useCallback(async () => {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini belum mendukung akses kamera melalui getUserMedia. Gunakan Chrome, Edge, atau browser modern lain.');
      return;
    }

    try {
      stopCamera();
      setTrackerStatus('Requesting camera permission...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, max: 60 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOn(true);
      setTrackerStatus('Camera running');
    } catch (cameraError) {
      const message = cameraError instanceof Error ? cameraError.message : 'Akses kamera ditolak atau tidak tersedia.';
      setError(`Tidak bisa membuka kamera: ${message}`);
      setTrackerStatus('Camera error');
      setIsCameraOn(false);
    }
  }, [stopCamera]);

  const handleResetScene = useCallback(() => {
    resetScene();
    resetGestureFrame();
  }, [resetGestureFrame, resetScene]);

  const handleNextObject = useCallback(() => {
    nextObject();
    resetGestureFrame();
  }, [nextObject, resetGestureFrame]);

  const handleTrackerError = useCallback((message: string) => {
    setError(message);
  }, []);

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let lastTime = performance.now();

    const loop = () => {
      frames += 1;
      const now = performance.now();
      if (now - lastTime >= 500) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return (
    <main className="app-shell">
      <WebcamView videoRef={videoRef} isCameraOn={isCameraOn} error={error} />

      <ThreeARScene sceneState={sceneState} />

      <HandTracker
        videoRef={videoRef}
        enabled={isCameraOn}
        onResults={consumeLandmarkerResult}
        onError={handleTrackerError}
        onStatus={setTrackerStatus}
      />

      <DebugOverlay enabled={debug} videoRef={videoRef} gestureFrame={gestureFrame} sceneState={sceneState} />

      <HUD sceneState={sceneState} gestureFrame={gestureFrame} fps={fps} trackerStatus={trackerStatus} />

      <ControlPanel
        isCameraOn={isCameraOn}
        debug={debug}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onResetScene={handleResetScene}
        onNextObject={handleNextObject}
        onToggleDebug={() => setDebug((value) => !value)}
      />

      <div className="gesture-help glass-card">
        <span>Pinch</span>
        <span>Open pinch</span>
        <span>Open palm</span>
        <span>Fist</span>
      </div>
    </main>
  );
}
