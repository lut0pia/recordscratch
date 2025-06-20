import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from './img/icon.png?asset'
import { RSClient } from 'recordscratch-common'

// Create recordscratch client
const client = new RSClient();
const ipc_message_in_types = RSClient.get_ipc_message_in_types(is.dev);
const ipc_message_out_types = RSClient.get_ipc_message_out_types();

// Prepare for handling requests to the client
for(let ipc_message of ipc_message_in_types) {
  ipcMain.handle(ipc_message, async (e, ...args) => {
    let result = RSClient.prototype[ipc_message].apply(client, args)
    if(result instanceof Promise) {
      result = await result;
    }
    return result;
  });
}

// Be prepared to tell preload script which messages to expose
ipcMain.handle('expose', e => {
  e.sender.send('expose', {
    in: ipc_message_in_types,
    out: ipc_message_out_types,
  });
});

const createWindow = async () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    center: true,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  });

  // Prepare for handling requests from the client
  for(let ipc_message_type of ipc_message_out_types) {
    RSClient.prototype['emit_'+ipc_message_type] = (...args) => {
      win.webContents.send(ipc_message_type, ...args);
    }
  }

  win.on('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
