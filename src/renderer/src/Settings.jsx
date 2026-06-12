import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState({ isRoaming: true, speed: 2, size: 1.0, theme: 'midnight' });
  const [clickThrough, setClickThrough] = useState(true);

  useEffect(() => {
    const api = window.desktopPet;
    if (!api) return;

    api.getSettings().then(setSettings);
    
    const cleanupSettings = api.onSettingsChanged((newSettings) => {
      setSettings(newSettings);
    });

    const cleanupClickThrough = api.onClickThroughChanged((enabled) => {
      setClickThrough(enabled);
    });

    return () => {
      cleanupSettings();
      cleanupClickThrough();
    };
  }, []);

  const handleToggleRoaming = (e) => {
    window.desktopPet.updateSettings({ isRoaming: e.target.checked });
  };

  const handleSpeedChange = (e) => {
    window.desktopPet.updateSettings({ speed: Number(e.target.value) });
  };

  const handleSizeChange = (e) => {
    window.desktopPet.updateSettings({ size: Number(e.target.value) });
  };

  const handleThemeChange = (e) => {
    window.desktopPet.updateSettings({ theme: e.target.value });
  };

  const handleFeedCat = () => {
    window.desktopPet.triggerFeedCat();
  };

  const toggleClickThrough = () => {
    window.desktopPet.toggleClickThrough();
  };

  return (
    <div className="settings-container">
      <h2>🐱 Paw-Pet Settings</h2>
      
      <div className="setting-row">
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.isRoaming} onChange={handleToggleRoaming} />
          <span>Enable Roaming (Walk around)</span>
        </label>
      </div>

      <div className="setting-row split-row">
        <label>
          Speed: {settings.speed}
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={settings.speed} 
            onChange={handleSpeedChange} 
          />
        </label>
        
        <label>
          Size: {settings.size}x
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.1"
            value={settings.size || 1.0} 
            onChange={handleSizeChange} 
          />
        </label>
      </div>

      <div className="setting-row">
        <label>
          Cat Theme
          <select value={settings.theme || 'midnight'} onChange={handleThemeChange} className="theme-select">
            <option value="midnight">Midnight (Black)</option>
            <option value="snow">Snow (White)</option>
            <option value="ginger">Ginger (Orange)</option>
            <option value="ash">Ash (Grey)</option>
            <option value="mocha">Mocha (Brown)</option>
            <option value="oreo">Oreo Cat (Aichan)</option>
          </select>
        </label>
      </div>

      <div className="setting-row">
        <button onClick={toggleClickThrough}>
          {clickThrough ? 'Disable Click-Through (Drag Mode)' : 'Enable Click-Through (Pet Mode)'}
        </button>
        <p className="hint">Shortcut: Cmd+Shift+P</p>
      </div>

      <div className="setting-row">
        <button className="feed-btn" onClick={handleFeedCat}>
          Feed Cat 🐟
        </button>
      </div>
    </div>
  );
}
