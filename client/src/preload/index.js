import { contextBridge, ipcRenderer } from 'electron'

ipcRenderer.on('expose', (e, ipc_methods) => {
  const api = {
    on_state_update: c => ipcRenderer.on('state', c),
  };
  for(let ipc_method of ipc_methods) {
    api[ipc_method] = async (...args) => await ipcRenderer.invoke(ipc_method, ...args);
  }
  contextBridge.exposeInMainWorld('rs', api);
});
