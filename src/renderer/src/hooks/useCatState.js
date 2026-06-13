import { useState, useEffect, useRef } from 'react';
import { isInProximity } from '../utils/geometry';

const TYPING_DEBOUNCE_MS = 400;
const PROXIMITY_THRESHOLD = 80;

// Autonomous actions the cat can randomly perform
const AUTO_ACTIONS = [
  { state: 'sitting',  duration: 4000 },  // Sit for 4s
  { state: 'sleeping', duration: 6000 },  // Sleep for 6s
  { state: 'running',  duration: 2000 },  // Sprint for 2s
  { state: 'scanning', duration: 2500 },  // Look around 2.5s
  { state: 'sneaking', duration: 3000 },  // Stealth prowl 3s
];

export function useCatState({ lastKeyTime, mousePos, windowBounds, settings, screenSize }) {
  const [state, setState] = useState('idle'); 
  const [cursorAngle, setCursorAngle] = useState(0);
  const [direction, setDirection] = useState(1); 
  
  const typingTimerRef = useRef(null);
  const walkingTimerRef = useRef(null);
  const roamDecideIntervalRef = useRef(null);
  const walkLoopRef = useRef(null);
  const autoActionTimerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef(state);
  const directionRef = useRef(direction);

  // Keep refs in sync
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { directionRef.current = direction; }, [direction]);

  // Sync internal position when not walking/running
  useEffect(() => {
    if (state !== 'walking' && state !== 'running') {
      posRef.current = { x: windowBounds.x, y: windowBounds.y };
    }
  }, [windowBounds.x, windowBounds.y, state]);

  // Helper: cancel all timers
  const cancelAll = () => {
    if (walkingTimerRef.current) clearTimeout(walkingTimerRef.current);
    if (walkLoopRef.current) cancelAnimationFrame(walkLoopRef.current);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (autoActionTimerRef.current) clearTimeout(autoActionTimerRef.current);
  };

  // 1. Feeding priority (Highest)
  useEffect(() => {
    if (!window.desktopPet) return;
    const cleanup = window.desktopPet.onFeedCat(() => {
      cancelAll();
      setState('eating');
      
      setTimeout(() => {
        setState((prev) => prev === 'eating' ? 'idle' : prev);
      }, 5000);
    });
    return cleanup;
  }, []);

  // 2. Swiping priority
  useEffect(() => {
    if (!windowBounds || windowBounds.width === 0) return;
    if (stateRef.current === 'eating') return;

    const inProximity = isInProximity(mousePos, windowBounds, PROXIMITY_THRESHOLD);
    if (inProximity) {
      const centerX = windowBounds.x + windowBounds.width / 2;
      const centerY = windowBounds.y + windowBounds.height / 2;
      const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
      setCursorAngle(angle);
      setDirection(mousePos.x > centerX ? 1 : -1);
      
      if (stateRef.current !== 'eating') {
        cancelAll();
        setState('swiping');
      }
    } else if (stateRef.current === 'swiping') {
      setState('idle');
    }
  }, [mousePos.x, mousePos.y, windowBounds.x, windowBounds.y, windowBounds.width, windowBounds.height]);

  // 3. Typing priority
  useEffect(() => {
    if (lastKeyTime === 0) return;
    if (stateRef.current === 'swiping' || stateRef.current === 'eating') return;
    
    // Don't interrupt sleeping/sitting with typing
    if (stateRef.current === 'sleeping') return;
    
    setState('typing');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setState((prev) => (prev === 'typing' ? 'idle' : prev));
    }, TYPING_DEBOUNCE_MS);
    
    return () => clearTimeout(typingTimerRef.current);
  }, [lastKeyTime]);

  // 4. Autonomous Behavior Brain — random idle actions
  useEffect(() => {
    if (!settings.isRoaming) {
      if (['walking', 'running', 'sitting', 'sleeping', 'scanning', 'sneaking'].includes(stateRef.current)) {
        setState('idle');
      }
      return;
    }

    roamDecideIntervalRef.current = setInterval(() => {
      const cur = stateRef.current;
      if (cur !== 'idle') return;

      const roll = Math.random();
      
      if (roll < 0.25) {
        // Walk
        let dir = Math.random() > 0.5 ? 1 : -1;
        const margin = 100;
        if (dir === 1 && posRef.current.x > screenSize.width - windowBounds.width - margin) dir = -1;
        else if (dir === -1 && posRef.current.x < margin) dir = 1;
        
        setDirection(dir);
        setState('walking');
        
        if (walkingTimerRef.current) clearTimeout(walkingTimerRef.current);
        walkingTimerRef.current = setTimeout(() => {
          setState((prev) => prev === 'walking' ? 'idle' : prev);
        }, 2000 + Math.random() * 3000);
      } else if (roll < 0.65) {
        // Random autonomous action (sit, sleep, scan, sneak, run)
        const action = AUTO_ACTIONS[Math.floor(Math.random() * AUTO_ACTIONS.length)];
        
        // Running needs direction
        if (action.state === 'running') {
          let dir = Math.random() > 0.5 ? 1 : -1;
          const margin = 100;
          if (dir === 1 && posRef.current.x > screenSize.width - windowBounds.width - margin) dir = -1;
          else if (dir === -1 && posRef.current.x < margin) dir = 1;
          setDirection(dir);
        }
        
        setState(action.state);
        
        if (autoActionTimerRef.current) clearTimeout(autoActionTimerRef.current);
        autoActionTimerRef.current = setTimeout(() => {
          setState((prev) => prev === action.state ? 'idle' : prev);
        }, action.duration);
      }
      // else: stay idle (35% chance to just chill)
    }, 3000);

    return () => {
      if (roamDecideIntervalRef.current) clearInterval(roamDecideIntervalRef.current);
      if (walkingTimerRef.current) clearTimeout(walkingTimerRef.current);
      if (autoActionTimerRef.current) clearTimeout(autoActionTimerRef.current);
    };
  }, [settings.isRoaming, screenSize.width, windowBounds.width]);

  // Walking/Running Physical Movement Loop
  useEffect(() => {
    if (state !== 'walking' && state !== 'running') {
      if (walkLoopRef.current) cancelAnimationFrame(walkLoopRef.current);
      walkLoopRef.current = null;
      return;
    }

    let lastTime = performance.now();
    let accDx = 0;
    let running = true;

    const walkStep = (time) => {
      if (!running) return;
      
      const dt = time - lastTime;
      if (dt > 30) {
        lastTime = time;
        const baseSpeed = settings.speed || 2;
        const speed = state === 'running' ? baseSpeed * 2.5 : baseSpeed;
        const dir = directionRef.current;
        const dx = dir * speed;
        
        accDx += dx;
        posRef.current.x += dx;
        
        const roundedDx = Math.round(accDx);
        if (roundedDx !== 0) {
          window.desktopPet.moveWindow(roundedDx, 0);
          accDx -= roundedDx;
        }
        
        if (posRef.current.x <= 0) {
          posRef.current.x = 0;
          setDirection(1);
        } else if (posRef.current.x >= screenSize.width - windowBounds.width) {
          posRef.current.x = screenSize.width - windowBounds.width;
          setDirection(-1);
        }
      }
      walkLoopRef.current = requestAnimationFrame(walkStep);
    };
    
    walkLoopRef.current = requestAnimationFrame(walkStep);
    
    return () => {
      running = false;
      if (walkLoopRef.current) cancelAnimationFrame(walkLoopRef.current);
      walkLoopRef.current = null;
    };
  }, [state, settings.speed, screenSize.width, windowBounds.width]);

  return { state, cursorAngle, direction };
}
