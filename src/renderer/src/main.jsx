import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Settings from './Settings';
import './App.css';

const root = createRoot(document.getElementById('root'));

// Simple hash router to differentiate the Pet Canvas from the Settings UI
if (window.location.hash === '#settings') {
  root.render(<Settings />);
} else {
  root.render(<App />);
}
