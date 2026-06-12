import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that listens for global keyboard and mouse events sent from the main process.
 * Returns { lastKeyTime, mousePos } where mousePos is {x, y} in screen coordinates.
 */
export function useGlobalEvents() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastKeyTimeRef = useRef(0);
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    const api = window.desktopPet;
    if (!api) {
      console.warn('desktopPet API not available — running outside Electron?');
      return;
    }

    const cleanupKey = api.onKeyPressed(() => {
      const now = Date.now();
      lastKeyTimeRef.current = now;
      setLastKeyTime(now);
    });

    const cleanupMouse = api.onMouseMoved((pos) => {
      setMousePos(pos);
    });

    return () => {
      if (cleanupKey) cleanupKey();
      if (cleanupMouse) cleanupMouse();
    };
  }, []);

  return { lastKeyTime, mousePos };
}
