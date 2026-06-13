import React, { useRef, useEffect, useCallback } from 'react';
import { drawIdle, drawTyping, drawSwiping, drawWalking, drawEating, FRAME_COUNTS } from '../sprites/CatSprites';
import oreoCatImgUrl from '../assets/oreo_cat.png';
import aeroCatImgUrl from '../assets/aero_cat_clean.png';

const TARGET_FPS = 12;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const DRAW_FUNCTIONS = {
  idle: drawIdle,
  typing: drawTyping,
  swiping: drawSwiping,
  walking: drawWalking,
  eating: drawEating,
  sitting: drawIdle,
  sleeping: drawIdle,
  running: drawWalking,
  scanning: drawIdle,
  sneaking: drawWalking,
};

// Oreo sprite sheet layout (from Cat Animation List, 0-indexed rows)
const OREO_ANIMATIONS = {
  idle:     { row: 6,  frames: 8 },   // Stand Idle
  eating:   { row: 7,  frames: 4 },   // Eat
  walking:  { row: 8,  frames: 8 },   // Walk
  typing:   { row: 13, frames: 7 },   // Jump (bounce effect)
  swiping:  { row: 14, frames: 5 },   // Attack
  sitting:  { row: 1,  frames: 4 },   // Sit Idle
  sleeping: { row: 4,  frames: 4 },   // Sleep Idle
  running:  { row: 9,  frames: 8 },   // Run
  scanning: { row: 21, frames: 4 },   // Scan
  sneaking: { row: 11, frames: 6 },   // Stealth
};

const AERO_ANIMATIONS = {
  idle:     { row: 0, frames: 6 },
  walking:  { row: 1, frames: 6 },
  running:  { row: 2, frames: 6 },
  swiping:  { row: 3, frames: 6 },
  eating:   { row: 4, frames: 6 },
  sneaking: { row: 5, frames: 6 }, // Using ANGRY for sneaking
  sleeping: { row: 6, frames: 6 },
  typing:   { row: 7, frames: 6 }, // Using PLAY for typing/jumping
  sitting:  { row: 0, frames: 6 }, // Fallback to IDLE
  scanning: { row: 0, frames: 6 }, // Fallback to IDLE
};

export default function CatCanvas({ state, cursorAngle, direction, clickThrough, settings }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationIdRef = useRef(null);
  const prevStateRef = useRef(state);
  const oreoImgRef = useRef(null);
  const oreoLoadedRef = useRef(false);
  const aeroImgRef = useRef(null);
  const aeroLoadedRef = useRef(false);

  // Store ALL changing props in refs so animate() never needs to be recreated
  const stateRef = useRef(state);
  const cursorAngleRef = useRef(cursorAngle);
  const directionRef = useRef(direction);
  const settingsRef = useRef(settings);

  // Keep refs in sync — this is zero-cost and prevents blink on state change
  useEffect(() => {
    if (prevStateRef.current !== state) {
      frameRef.current = 0;
      prevStateRef.current = state;
    }
    stateRef.current = state;
  }, [state]);
  useEffect(() => { cursorAngleRef.current = cursorAngle; }, [cursorAngle]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Preload sprite sheets once
  useEffect(() => {
    const imgOreo = new Image();
    imgOreo.src = oreoCatImgUrl;
    imgOreo.onload = () => {
      oreoImgRef.current = imgOreo;
      oreoLoadedRef.current = true;
    };
    
    const imgAero = new Image();
    imgAero.src = aeroCatImgUrl;
    imgAero.onload = () => {
      aeroImgRef.current = imgAero;
      aeroLoadedRef.current = true;
    };
  }, []);

  // Single stable animation loop — NEVER recreated, reads from refs
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      animationIdRef.current = requestAnimationFrame(animate);
      return;
    }

    const elapsed = timestamp - lastFrameTimeRef.current;

    if (elapsed >= FRAME_INTERVAL) {
      lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

      // Read all values from refs (always fresh, no dependency needed)
      const currentState = stateRef.current;
      const currentDirection = directionRef.current;
      const currentAngle = cursorAngleRef.current;
      const currentSettings = settingsRef.current;
      
      const sizeMultiplier = currentSettings?.size || 1.0;
      const themeId = currentSettings?.theme || 'midnight';
      const pxSize = 5 * sizeMultiplier;
      const canvasSize = Math.ceil(50 * pxSize);
      
      // Resize canvas if needed
      if (canvas.width !== canvasSize || canvas.height !== canvasSize) {
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        canvas.style.width = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
      }

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      ctx.save();
      if (currentDirection === -1) {
        ctx.translate(canvasSize, 0);
        ctx.scale(-1, 1);
      }

      const isOreo = themeId === 'oreo' && oreoLoadedRef.current && oreoImgRef.current;
      const isAero = themeId === 'aero' && aeroLoadedRef.current && aeroImgRef.current;

      if (isOreo || isAero) {
        const img = isOreo ? oreoImgRef.current : aeroImgRef.current;
        
        const strideX = isOreo ? 33 : 100;
        const strideY = isOreo ? 32 : 100;
        const spriteW = isOreo ? 32 : 100;
        const spriteH = isOreo ? 32 : 100;
        
        const dSize = Math.floor(canvasSize * (isOreo ? 0.75 : 0.95));
        const dx = Math.floor((canvasSize - dSize) / 2);
        const dy = Math.floor((canvasSize - dSize) / 2) + Math.floor(canvasSize * (isOreo ? 0.03 : 0.0));
        
        const animations = isOreo ? OREO_ANIMATIONS : AERO_ANIMATIONS;
        const anim = animations[currentState] || animations.idle;
        const frame = frameRef.current % anim.frames;
        
        const sx = frame * strideX;
        const sy = anim.row * strideY;
        
        ctx.drawImage(img, sx, sy, spriteW, spriteH, dx, dy, dSize, dSize);
        
        // Fish for eating state (only for Oreo for now)
        if (currentState === 'eating' && isOreo) {
          const fx = dx + dSize * 0.55;
          const fy = dy + dSize * 0.85;
          const s = Math.max(2, Math.floor(pxSize * 0.8));
          ctx.fillStyle = '#ff79c6';
          ctx.fillRect(fx, fy, s * 2, s * 3);
          ctx.fillStyle = '#8be9fd';
          ctx.fillRect(fx + s * 2, fy + s, s * 5, s * 2);
          ctx.fillRect(fx + s * 6, fy, s * 2, s * 3);
          ctx.fillStyle = '#282a36';
          ctx.fillRect(fx + s * 6, fy + s, s, s);
        }
        
        frameRef.current = (frameRef.current + 1) % (anim.frames * 100);
      } else {
        const drawFn = DRAW_FUNCTIONS[currentState] || drawIdle;
        const maxFrames = FRAME_COUNTS[currentState] || 8;
        const frame = frameRef.current % maxFrames;
        const adjustedAngle = currentDirection === -1 ? Math.PI - currentAngle : currentAngle;

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
  }, []); // Empty deps — never recreated!

  // Start animation loop once, never restart
  useEffect(() => {
    animationIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate]);

  // Initial canvas size
  const sizeMultiplier = settings?.size || 1.0;
  const pxSize = 5 * sizeMultiplier;
  const canvasSize = Math.ceil(50 * pxSize);

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
