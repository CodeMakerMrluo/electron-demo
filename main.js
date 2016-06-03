
const electron = require('electron');
// Module to control application life.
const { app } = electron;
// Module to create native browser window.
const { BrowserWindow } = electron;
// ipcMain
const { ipcMain } = electron;
// globalShortcut
const { globalShortcut } = electron;
// menu
const { Menu } = electron;
// Tray
const { Tray } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Tray
let appIcon = null;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600});
  // win.setOverlayIcon('./imgs/ico.png', 'Description for overlay');
  // app.dock.setIcon('/Users/chenhao/code/github/electron-demo/imgs/ico.png');
  
  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  win.setProgressBar(0.3);
  
  // sending messages from the main process to the renderer process
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-process-messages', 'webContents event "did-finish-load" called');
  });
  
  // 监听Renderer Process的消息。
  ipcMain.on('asynchronous-message', (event, arg) => {
    // 返回消息
    event.sender.send('asynchronous-reply', 'pong');
    event.returnValue = 'asynchronous-return-value';
  });

  ipcMain.on('synchronous-message', (event, arg) => {
    event.returnValue = 'pong';
  });
  
  // globalShortcut
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed');
  });

  if (!ret) {
    console.log('registration failed');
  }

  // Check whether a shortcut is registered.
  // console.log(globalShortcut.isRegistered('CommandOrControl+X'));
  
  // Tray
  const contextMenuTray = Menu.buildFromTemplate([
    {label: 'Item1', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Item4', type: 'radio'}
  ]);
  appIcon = new Tray(`/${__dirname}/imgs/ico.png`);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenuTray);
  
  // app.dock.setIcon(`/${__dirname}/imgs/ico.png`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.dock.setBadge('66+');
// app.dock.setIcon(`/${__dirname}/imgs/ico.png`);
// dock Menu
const dockMenu = Menu.buildFromTemplate([
  { label: 'New Window', click() { console.log('New Window'); } },
  { label: 'New Window with Settings', submenu: [
    { label: 'Basic' },
    { label: 'Pro'}
  ]},
  { label: 'New Command...'}
]);
app.dock.setMenu(dockMenu);
// app.dock.setIcon(`/${__dirname}/imgs/ico.png`);


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// 程序退出前注销注册的快捷键
app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+X');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.