import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { gestureConfig } from '../config/gestureConfig';

type HandTrackerProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onResults: (result: unknown) => void;
  onError?: (message: string) => void;
  onStatus?: (status: string) => void;
};

export function HandTracker({ videoRef, enabled, onResults, onError, onStatus }: HandTrackerProps) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const loadingRef = useRef(false);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      if (landmarkerRef.current || loadingRef.current) return;

      try {
        loadingRef.current = true;
        setIsLoading(true);
        onStatus?.('Loading MediaPipe model...');

        const vision = await FilesetResolver.forVisionTasks(gestureConfig.mediapipe.wasmUrl);
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: gestureConfig.mediapipe.modelUrl,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: gestureConfig.maxHands,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.5
        });

        if (!cancelled) {
          landmarkerRef.current = handLandmarker;
          onStatus?.('MediaPipe ready');
        } else {
          handLandmarker.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'MediaPipe failed to load.';
        onError?.(message);
        onStatus?.('MediaPipe error');
      } finally {
        loadingRef.current = false;
        if (!cancelled) setIsLoading(false);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [onError, onStatus]);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastVideoTimeRef.current = -1;
      return;
    }

    let cancelled = false;

    const tick = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (!cancelled && video && landmarker && video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          try {
            const result = landmarker.detectForVideo(video, performance.now());
            onResults(result);
            lastVideoTimeRef.current = video.currentTime;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Hand tracking inference failed.';
            onError?.(message);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, onError, onResults, videoRef]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  return null;
}
