const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startProxy: (config) => ipcRenderer.invoke('start-proxy', config),
  onLog: (callback) => ipcRenderer.on('log', (event, message) => callback(message))
});
