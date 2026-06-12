import { useState, useEffect, useRef } from 'react';
import { isInProximity } from '../utils/geometry';

const TYPING_DEBOUNCE_MS = 300;
const PROXIMITY_THRESHOLD = 80;

export function useCatState({ lastKeyTime, mousePos, windowBounds, settings, screenSize }) {
  const [state, setState] = useState('idle'); 
  const [cursorAngle, setCursorAngle] = useState(0);
  const [direction, setDirection] = useState(1); 
  
  const typingTimerRef = useRef(null);
  const walkingTimerRef = useRef(null);
  const roamDecideIntervalRef = useRef(null);
  const walkLoopRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  // Sync internal position when not walking
  useEffect(() => {
    if (state !== 'walking') {
      posRef.current = { x: windowBounds.x, y: windowBounds.y };
    }
  }, [windowBounds.x, windowBounds.y, state]);

  // 1. Feeding priority (Highest)
  useEffect(() => {
    if (!window.desktopPet) return;
    const cleanup = window.desktopPet.onFeedCat(() => {
      setState('eating');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (walkingTimerRef.current) clearTimeout(walkingTimerRef.current);
      
      setTimeout(() => {
        setState((prev) => prev === 'eating' ? 'idle' : prev);
      }, 5000); // Eat for 5 seconds
    });
    return cleanup;
  }, []);

  // 2. Swiping priority
  useEffect(() => {
    if (!windowBounds || windowBounds.width === 0 || state === 'eating') return;
    const inProximity = isInProximity(mousePos, windowBounds, PROXIMITY_THRESHOLD);
    if (inProximity) {
      const centerX = windowBounds.x + windowBounds.width / 2;
      const centerY = windowBounds.y + windowBounds.height / 2;
      const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
      setCursorAngle(angle);
      setDirection(mousePos.x > centerX ? 1 : -1);
      setState('swiping');
    } else if (state === 'swiping') {
      setState('idle');
    }
  }, [mousePos, windowBounds]);

  // 3. Typing priority
  useEffect(() => {
    if (lastKeyTime === 0 || state === 'swiping' || state === 'eating') return;
    setState('typing');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setState((prev) => (prev === 'typing' ? 'idle' : prev));
    }, TYPING_DEBOUNCE_MS);
    return () => clearTimeout(typingTimerRef.current);
  }, [lastKeyTime]);

  // 4. Roaming Brain
  useEffect(() => {
    if (!settings.isRoaming || state === 'swiping' || state === 'typing' || state === 'eating') {
      if (state === 'walking') setState('idle');
      return;
    }

    roamDecideIntervalRef.current = setInterval(() => {
      // 30% chance to start walking if currently idle
      if (state === 'idle' && Math.random() < 0.3) {
        setState('walking');
        // Pick a random direction
        const dir = Math.random() > 0.5 ? 1 : -1;
        
        // Prevent walking off screen
        const margin = 100;
        if (dir === 1 && posRef.current.x > screenSize.width - windowBounds.width - margin) {
          setDirection(-1);
        } else if (dir === -1 && posRef.current.x < margin) {
          setDirection(1);
        } else {
          setDirection(dir);
        }

        // Stop walking after 2-5 seconds
        walkingTimerRef.current = setTimeout(() => {
          setState('idle');
        }, 2000 + Math.random() * 3000);
      }
    }, 3000);

    return () => {
      if (roamDecideIntervalRef.current) clearInterval(roamDecideIntervalRef.current);
      if (walkingTimerRef.current) clearTimeout(walkingTimerRef.current);
    };
  }, [state, settings.isRoaming, screenSize.width, windowBounds.width]);

  // Walking Physical Movement Loop
  useEffect(() => {
    if (state === 'walking') {
      let lastTime = performance.now();
      let accDx = 0;

      const walkStep = (time) => {
        const dt = time - lastTime;
        if (dt > 30) { // ~30 fps movement for smooth roaming
          lastTime = time;
          const speed = settings.speed || 2;
          const dx = direction * speed;
          
          accDx += dx;
          posRef.current.x += dx;
          
          // Send move command to main process via fast IPC message
          window.desktopPet.moveWindow(Math.round(accDx), 0);
          accDx -= Math.round(accDx); // keep fractional part
          
          // Screen bounds check
          if (posRef.current.x <= 0 || posRef.current.x >= screenSize.width - windowBounds.width) {
             setDirection(d => -d);
          }
        }
        walkLoopRef.current = requestAnimationFrame(walkStep);
      };
      walkLoopRef.current = requestAnimationFrame(walkStep);
    } else {
      if (walkLoopRef.current) cancelAnimationFrame(walkLoopRef.current);
    }
    return () => {
      if (walkLoopRef.current) cancelAnimationFrame(walkLoopRef.current);
    };
  }, [state, direction, settings.speed, screenSize.width, windowBounds.width]);

  return { state, cursorAngle, direction };
}
