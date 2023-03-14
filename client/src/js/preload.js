const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ws', {
  request: async msg => await ipcRenderer.invoke('request', msg),
});
