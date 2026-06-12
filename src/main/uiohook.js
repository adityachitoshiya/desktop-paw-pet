import { uIOhook } from 'uiohook-napi';
import { systemPreferences } from 'electron';

let isRunning = false;
let throttleTimer = null;

const MOUSE_THROTTLE_MS = 60; // ~16 events/sec

/**
 * Start capturing global keyboard and mouse events.
 * Forwards events to the renderer via IPC.
 *
 * @param {Electron.BrowserWindow} win - The main window to send events to
 */
export function startGlobalEventTracking(win) {
  if (isRunning) return;

  // Check macOS Accessibility permission (shows system prompt if not granted)
  const isTrusted = systemPreferences.isTrustedAccessibilityClient(true);
  if (!isTrusted) {
    console.warn(
      '[Desktop Paw-Pet] Accessibility permission not granted.\n' +
      'Go to System Settings > Privacy & Security > Accessibility\n' +
      'and add this app. Then restart.'
    );
    // Still attempt to start — it may work if permission is granted while running
  }

  // ----- Keyboard: keydown -----
  uIOhook.on('keydown', (event) => {
    if (win && !win.isDestroyed()) {
      try {
        win.webContents.send('KEY_PRESSED', {
          keycode: event.keycode,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        });
      } catch (err) {
        // Window may have been destroyed between check and send
      }
    }
  });

  // ----- Mouse: mousemove (throttled) -----
  let lastMouseSendTime = 0;

  uIOhook.on('mousemove', (event) => {
    const now = Date.now();
    if (now - lastMouseSendTime < MOUSE_THROTTLE_MS) return;
    lastMouseSendTime = now;

    if (win && !win.isDestroyed()) {
      try {
        win.webContents.send('MOUSE_MOVED', {
          x: event.x,
          y: event.y,
        });
      } catch (err) {
        // Window may have been destroyed between check and send
      }
    }
  });

  // Start the hook
  try {
    uIOhook.start();
    isRunning = true;
    console.log('[Desktop Paw-Pet] Global event tracking started.');
  } catch (err) {
    console.error('[Desktop Paw-Pet] Failed to start uIOhook:', err.message);
    console.error(
      'Make sure Accessibility and Input Monitoring permissions are granted.\n' +
      'System Settings > Privacy & Security > Accessibility\n' +
      'System Settings > Privacy & Security > Input Monitoring'
    );
  }
}

/**
 * Stop global event tracking. Must be called before app quits.
 */
export function stopGlobalEventTracking() {
  if (!isRunning) return;

  try {
    uIOhook.stop();
    isRunning = false;
    console.log('[Desktop Paw-Pet] Global event tracking stopped.');
  } catch (err) {
    console.error('[Desktop Paw-Pet] Error stopping uIOhook:', err.message);
  }

  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }
}
