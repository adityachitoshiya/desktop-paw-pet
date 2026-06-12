import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopPet', {
  onKeyPressed(callback) {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('KEY_PRESSED', handler);
    return () => ipcRenderer.removeListener('KEY_PRESSED', handler);
  },
  onMouseMoved(callback) {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('MOUSE_MOVED', handler);
    return () => ipcRenderer.removeListener('MOUSE_MOVED', handler);
  },
  onClickThroughChanged(callback) {
    const handler = (_event, enabled) => callback(enabled);
    ipcRenderer.on('CLICK_THROUGH_CHANGED', handler);
    return () => ipcRenderer.removeListener('CLICK_THROUGH_CHANGED', handler);
  },
  onSettingsChanged(callback) {
    const handler = (_event, settings) => callback(settings);
    ipcRenderer.on('SETTINGS_CHANGED', handler);
    return () => ipcRenderer.removeListener('SETTINGS_CHANGED', handler);
  },
  onFeedCat(callback) {
    const handler = () => callback();
    ipcRenderer.on('FEED_CAT', handler);
    return () => ipcRenderer.removeListener('FEED_CAT', handler);
  },
  triggerFeedCat() {
    return ipcRenderer.invoke('TRIGGER_FEED_CAT');
  },
  getSettings() {
    return ipcRenderer.invoke('GET_SETTINGS');
  },
  updateSettings(settings) {
    return ipcRenderer.invoke('UPDATE_SETTINGS', settings);
  },
  getScreenSize() {
    return ipcRenderer.invoke('GET_SCREEN_SIZE');
  },
  toggleClickThrough() {
    return ipcRenderer.invoke('TOGGLE_CLICK_THROUGH');
  },
  getWindowBounds() {
    return ipcRenderer.invoke('GET_WINDOW_BOUNDS');
  },
  moveWindow(deltaX, deltaY) {
    return ipcRenderer.invoke('MOVE_WINDOW', deltaX, deltaY);
  },
  setIgnoreMouseEvents(ignore, options) {
    return ipcRenderer.invoke('SET_IGNORE_MOUSE', ignore, options);
  },
});
