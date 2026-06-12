import React, { useRef, useEffect, useCallback, useState } from 'react';
import { drawIdle, drawTyping, drawSwiping, drawWalking, drawEating, FRAME_COUNTS } from '../sprites/CatSprites';
import oreoCatImgUrl from '../assets/oreo_cat.png';

const TARGET_FPS = 12;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const DRAW_FUNCTIONS = {
  idle: drawIdle,
  typing: drawTyping,
  swiping: drawSwiping,
  walking: drawWalking,
  eating: drawEating,
};

export default function CatCanvas({ state, cursorAngle, direction, clickThrough, settings }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationIdRef = useRef(null);
  const prevStateRef = useRef(state);
  const oreoImgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = oreoCatImgUrl;
    img.onload = () => {
      oreoImgRef.current = img;
    };
  }, []);

  // Derive sizes from settings
  const sizeMultiplier = settings?.size || 1.0;
  const themeId = settings?.theme || 'midnight';
  const pxSize = 5 * sizeMultiplier;
  const canvasSize = Math.ceil(40 * pxSize);

  useEffect(() => {
    if (prevStateRef.current !== state) {
      frameRef.current = 0;
      prevStateRef.current = state;
    }
  }, [state]);

  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const elapsed = timestamp - lastFrameTimeRef.current;

    if (elapsed >= FRAME_INTERVAL) {
      lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      ctx.save();
      if (direction === -1) {
        ctx.translate(canvasSize, 0);
        ctx.scale(-1, 1);
      }

      if (themeId === 'oreo' && oreoImgRef.current) {
        const img = oreoImgRef.current;
        const strideX = 33; 
        const strideY = 32;
        const spriteWidth = 32;
        const spriteHeight = 32;
        const dSize = Math.floor(canvasSize * 0.75); // 75% to prevent cropping
        const dx = Math.floor((canvasSize - dSize) / 2);
        const dy = Math.floor((canvasSize - dSize) / 2);
        
        let row = 0;
        let maxFrames = 4;
        
        if (state === 'eating') { row = 7; maxFrames = 4; }
        else if (state === 'swiping') { row = 14; maxFrames = 14; }
        else if (state === 'typing') { row = 13; maxFrames = 7; }
        else if (state === 'walking') { row = 8; maxFrames = 8; }
        else { row = 0; maxFrames = 4; }
        
        const frame = frameRef.current % maxFrames;
        const sx = frame * strideX;
        const sy = row * strideY;
        
        ctx.drawImage(img, sx, sy, spriteWidth, spriteHeight, dx, dy, dSize, dSize);
        
        // Oreo Fish Feature
        if (state === 'eating') {
          const fx = dx + dSize / 2 + 10;
          const fy = dy + dSize - 20;
          ctx.fillStyle = '#ff79c6';
          ctx.fillRect(fx, fy, 2*pxSize, 3*pxSize);
          ctx.fillStyle = '#8be9fd';
          ctx.fillRect(fx + 2*pxSize, fy + 1*pxSize, 5*pxSize, 2*pxSize);
          ctx.fillRect(fx + 6*pxSize, fy, 2*pxSize, 3*pxSize);
          ctx.fillStyle = '#282a36';
          ctx.fillRect(fx + 6*pxSize, fy + 1*pxSize, 1*pxSize, 1*pxSize);
        }
        
        frameRef.current = (frameRef.current + 1) % (maxFrames * 100);
      } else {
        const drawFn = DRAW_FUNCTIONS[state] || drawIdle;
        const maxFrames = FRAME_COUNTS[state] || 8;
        const frame = frameRef.current % maxFrames;
        const adjustedAngle = direction === -1 ? Math.PI - cursorAngle : cursorAngle;

        drawFn(ctx, frame, {
          width: canvasSize,
          height: canvasSize,
          cursorAngle: adjustedAngle,
          pxSize: pxSize,
          themeId: themeId,
        });
        frameRef.current = (frameRef.current + 1) % (maxFrames * 100);
      }
      
      ctx.restore();
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }, [state, cursorAngle, direction, canvasSize, pxSize, themeId]);

  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        width: canvasSize,
        height: canvasSize,
        background: 'transparent',
        imageRendering: 'pixelated',
        WebkitAppRegion: clickThrough ? 'no-drag' : 'drag',
        cursor: clickThrough ? 'default' : 'grab',
      }}
    />
  );
}
