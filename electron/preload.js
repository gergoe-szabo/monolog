const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sendToElectron', (...args) => {
  ipcRenderer.send(...args);
});

contextBridge.exposeInMainWorld('receiveFromElectron', (channel, callback) => {
  ipcRenderer.on(channel, (event, ...args) => callback(...args));
});

contextBridge.exposeInMainWorld('removeElectronListener', (channel, callback) => {
  ipcRenderer.removeListener(channel, callback);
});

// Explicitly set a property to identify Electron's environment
contextBridge.exposeInMainWorld('isElectronEnvironment', true);
