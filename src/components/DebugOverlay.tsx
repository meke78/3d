import { useEffect, useRef } from 'react';
import type { ARSceneState } from '../hooks/useAnimationState';
import type { GestureFrame, NormalizedLandmark } from '../hand/gestureTypes';

type DebugOverlayProps = {
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  gestureFrame: GestureFrame;
  sceneState: ARSceneState;
};

function getCoverTransform(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const cw = canvas.width;
  const ch = canvas.height;
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const scale = Math.max(cw / vw, ch / vh);
  const width = vw * scale;
  const height = vh * scale;
  return {
    width,
    height,
    offsetX: (cw - width) / 2,
    offsetY: (ch - height) / 2
  };
}

function drawLandmark(
  ctx: CanvasRenderingContext2D,
  landmark: NormalizedLandmark,
  transform: ReturnType<typeof getCoverTransform>
) {
  const x = transform.offsetX + (1 - landmark.x) * transform.width;
  const y = transform.offsetY + landmark.y * transform.height;
  ctx.beginPath();
  ctx.arc(x, y, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

export function DebugOverlay({ enabled, videoRef, gestureFrame, sceneState }: DebugOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!enabled || !video) return;

    const drawCanvas = canvas;
    const transform = getCoverTransform(drawCanvas, video);
    const scaleBack = 1 / dpr;
    const visualTransform = {
      width: transform.width * scaleBack,
      height: transform.height * scaleBack,
      offsetX: transform.offsetX * scaleBack,
      offsetY: transform.offsetY * scaleBack
    };

    ctx.save();
    ctx.fillStyle = 'rgba(135, 220, 255, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.lineWidth = 1;

    gestureFrame.hands.forEach((hand) => {
      hand.landmarks.forEach((landmark) => drawLandmark(ctx, landmark, visualTransform));
    });

    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.84)';
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillText(`debug: ${sceneState.mode} | hands: ${gestureFrame.hands.length}`, 18, window.innerHeight - 24);
    ctx.restore();
  }, [enabled, gestureFrame, sceneState.mode, videoRef]);

  return <canvas ref={canvasRef} className="debug-canvas" aria-hidden="true" />;
}
