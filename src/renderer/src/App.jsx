import React, { useState, useEffect, useRef } from 'react';
import CatCanvas from './components/CatCanvas';
import StatusBadge from './components/StatusBadge';
import { useGlobalEvents } from './hooks/useGlobalEvents';
import { useCatState } from './hooks/useCatState';

export default function App() {
  const [clickThrough, setClickThrough] = useState(true);
  const [windowBounds, setWindowBounds] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [settings, setSettings] = useState({ isRoaming: true, speed: 2 });
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });
  const boundsIntervalRef = useRef(null);

  const { lastKeyTime, mousePos } = useGlobalEvents();
  const { state, cursorAngle, direction } = useCatState({ lastKeyTime, mousePos, windowBounds, settings, screenSize });

  useEffect(() => {
    const api = window.desktopPet;
    if (!api) return;

    api.getSettings().then(setSettings);
    api.getScreenSize().then(setScreenSize);

    const cleanupClick = api.onClickThroughChanged(setClickThrough);
    const cleanupSettings = api.onSettingsChanged(setSettings);

    const fetchBounds = async () => {
      try {
        const bounds = await api.getWindowBounds();
        if (bounds) setWindowBounds(bounds);
      } catch (e) {}
    };

    fetchBounds();
    boundsIntervalRef.current = setInterval(fetchBounds, 1000);

    return () => {
      cleanupClick();
      cleanupSettings();
      if (boundsIntervalRef.current) clearInterval(boundsIntervalRef.current);
    };
  }, []);

  return (
    <div className={`desktop-pet-container ${!clickThrough ? 'draggable' : ''}`}>
      <StatusBadge state={state} clickThrough={clickThrough} />
      <CatCanvas state={state} cursorAngle={cursorAngle} direction={direction} clickThrough={clickThrough} settings={settings} />
    </div>
  );
}
