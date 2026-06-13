import { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import { startGlobalEventTracking, stopGlobalEventTracking } from './uiohook';

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isClickThrough = true;

// App Settings Store
let appSettings = {
  isRoaming: true,
  speed: 2,
  size: 1.0,
  theme: 'midnight',
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 250,
    height: 250,
    x: screenWidth - 310,
    y: screenHeight - 290,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Stay above all windows, including fullscreen apps
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Show on all macOS desktop spaces (Mission Control)
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Enable click-through by default with mouse event forwarding
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Load the renderer (Pet Canvas)
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Start global event tracking and forward events to renderer
  startGlobalEventTracking(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 380,
    height: 600,
    minWidth: 320,
    minHeight: 450,
    resizable: true,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'menu',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the renderer (Settings route)
  if (process.env.ELECTRON_RENDERER_URL) {
    settingsWindow.loadURL(process.env.ELECTRON_RENDERER_URL + '#settings');
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'settings' });
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setTitle('🐱 Paw-Pet');
  tray.setToolTip('Desktop Paw-Pet');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Feed Cat 🐟', click: () => {
        if (mainWindow) mainWindow.webContents.send('FEED_CAT');
      }
    },
    { type: 'separator' },
    { label: 'Settings', click: () => createSettingsWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
}

// ----- IPC Handlers -----

ipcMain.handle('GET_SETTINGS', () => appSettings);

ipcMain.handle('UPDATE_SETTINGS', (event, newSettings) => {
  const oldSize = appSettings.size;
  appSettings = { ...appSettings, ...newSettings };
  
  if (newSettings.size !== undefined && newSettings.size !== oldSize && mainWindow) {
    const pxSize = 5 * appSettings.size;
    const newCanvasSize = Math.ceil(50 * pxSize);
    
    const bounds = mainWindow.getBounds();
    const x = bounds.x + (bounds.width - newCanvasSize) / 2;
    const y = bounds.y + (bounds.height - newCanvasSize) / 2;
    
    mainWindow.setBounds({
      x: Math.round(x),
      y: Math.round(y),
      width: newCanvasSize,
      height: newCanvasSize,
    });
  }
  
  // Broadcast to all windows
  if (mainWindow) mainWindow.webContents.send('SETTINGS_CHANGED', appSettings);
  if (settingsWindow) settingsWindow.webContents.send('SETTINGS_CHANGED', appSettings);
  
  return appSettings;
});

ipcMain.handle('GET_SCREEN_SIZE', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.workAreaSize;
});

ipcMain.handle('TOGGLE_CLICK_THROUGH', () => {
  if (!mainWindow) return false;
  isClickThrough = !isClickThrough;

  if (isClickThrough) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setFocusable(false);
  } else {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setFocusable(true);
    mainWindow.focus();
  }

  // Notify renderer
  mainWindow.webContents.send('CLICK_THROUGH_CHANGED', isClickThrough);
  return isClickThrough;
});

ipcMain.handle('GET_WINDOW_BOUNDS', () => {
  if (!mainWindow) return null;
  return mainWindow.getBounds();
});

ipcMain.handle('MOVE_WINDOW', (_event, deltaX, deltaY) => {
  if (!mainWindow) return;
  const [x, y] = mainWindow.getPosition();
  mainWindow.setPosition(Math.round(x + deltaX), Math.round(y + deltaY));
});

ipcMain.handle('SET_IGNORE_MOUSE', (_event, ignore, options) => {
  if (!mainWindow) return;
  mainWindow.setIgnoreMouseEvents(ignore, options || {});
});

ipcMain.handle('TRIGGER_FEED_CAT', () => {
  if (mainWindow) mainWindow.webContents.send('FEED_CAT');
});

// ----- App Lifecycle -----

app.whenReady().then(() => {
  createTray();
  createWindow();

  // Register global shortcut: Cmd+Shift+P to toggle click-through
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (!mainWindow) return;
    isClickThrough = !isClickThrough;

    if (isClickThrough) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
      mainWindow.setFocusable(false);
    } else {
      mainWindow.setIgnoreMouseEvents(false);
      mainWindow.setFocusable(true);
      mainWindow.focus();
    }

    mainWindow.webContents.send('CLICK_THROUGH_CHANGED', isClickThrough);
  });
});

app.on('before-quit', () => {
  stopGlobalEventTracking();
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Don't quit if only settings closed — mainWindow is the pet overlay
  if (!mainWindow) {
    app.quit();
  }
});

// Hide dock icon — this is a background/overlay app
app.dock?.hide();
