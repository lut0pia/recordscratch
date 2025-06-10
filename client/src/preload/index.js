import { contextBridge, ipcRenderer } from 'electron'

ipcRenderer.on('expose', (e, message_types) => {
  const api = {
    on_state_update: (...args) => ipcRenderer.on('state', ...args),
  };
  for(let message_type of message_types.in) {
    api[message_type] = async (...args) => await ipcRenderer.invoke(message_type, ...args);
  }
  for(let message_type of message_types.out) {
    api['on_'+message_type] = (...args) => ipcRenderer.on(message_type, ...args);
  }
  contextBridge.exposeInMainWorld('rs', api);
});

ipcRenderer.invoke('expose');
