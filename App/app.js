const path = require('path');
const packageJson = require("../package.json");
const { app, BrowserWindow, Notification, Menu, MenuItem, Tray, dialog, ipcMain, ipcRenderer  } = require('electron');
const Screen_update = require("../Domain/Screens/updater/mainScreen.js");
const Screen_main = require("../Domain/Screens/main/sreen.js");
const { autoUpdater, AppUpdater } = require("electron-updater");
const { exec } = require('child_process');
const MAIN_DIR = path.dirname(require.main.filename);
var DAO = require("../Repository/DB.js");
const translator = require("../Domain/Comun/Translator_app.js");

DAO.DB.set("select_folder", null);
DAO.DB.set("select_file", null);

var screen = null;
var window_update;
var windows_custom = {};

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
//

function createWindowApp () {
  screen = new Screen_main(packageJson);

  screen.window.on('minimize',function(event){
    event.preventDefault();
    screen.window.hide();
  });
  screen.appIcon.on('double-click', function(e){
    if (screen.window.isVisible()){
      screen.window.hide();
    } else {
      screen.window.show();
      screen.window.maximize();
    }
  });

  screen.handleMessages('update_lang', (event, dt)=>{
    screen.setContextMenu(screen);
    return true;
  });

  screen.handleMessages('new_window', (event, dt)=>{
    if(dt != null){
      create_new_windows(dt);
      return true;
    }
    return false;
  });

  screen.setContextMenu(screen);
}

const create_new_windows = async (data) =>{
  if(windows_custom[data.name] == null){
    windows_custom[data.name] = new BrowserWindow({
      title: packageJson.productName+" - "+data.name,
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        devTools: false
      }
    });
    windows_custom[data.name].maximize();
    windows_custom[data.name].loadURL(data.url);
    windows_custom[data.name].show();
    await DAO.Opens_windows.set(data.name, data);
    windows_custom[data.name].on('closed', async function(){
      await DAO.Opens_windows.delete(data.name)
      delete windows_custom[data.name];
    });
  }
  else{
    await windows_custom[data.name].show();
  }
}

function killProcessWinpy(callback) {
  exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
    if(callback != null)
      callback();
  })
}

function createWindowUpdate() {
  window_update = new Screen_update(packageJson);
}

app.whenReady().then(() => {
  if(DAO.DB.get('App_notification_windows') == null)
    DAO.DB.set('App_notification_windows', true);
  killProcessWinpy(()=>{
    createWindowUpdate();

    app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length == 0) createWindowUpdate();
    });
    autoUpdater.checkForUpdates();
  });
});

autoUpdater.on("update-available", (info) => {
  window_update.sendDataView("dataView", {
    version: app.getVersion(),
    status: 1,
    msg: translator.getNameTd('.auiapwftdtc')
  });

  new Notification({
    body: translator.getNameTd('.auiapwftdtc')
  }).show();
  let pth = autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", (info) => {
  window_update.sendDataView("dataView", {
    version: app.getVersion(),
    status: 2,
    msg: `${translator.getNameTd('.taiaitlastv')}: ${app.getVersion()}!`
  });
  createWindowApp();
  setTimeout(()=>{
    try {
      window_update.close();
    } catch (error) { 
    }
  }, 5000);
});

autoUpdater.on("update-downloaded", (info) => {
  window_update.sendDataView("dataView", {
    version: app.getVersion(),
    status: 3,
    msg: translator.getNameTd('.updateds')
  });
  new Notification({
    body: translator.getNameTd('.updateds')
  }).show();
  setTimeout(()=>{
    try {
      window_update.close();
      autoUpdater.quitAndInstall(false, true);
    } catch (error) { 
    }
  }, 5000);
});

autoUpdater.on("error", (info) => {
  window_update.sendDataView("dataView", {
    version: app.getVersion(),
    status: 0,
    msg: translator.getNameTd('.erroupdatetheapp')
  });
  createWindowApp();
  setTimeout(()=>{
    try {
      window_update.close();
    } catch (error) { 
    }
  }, 10000);
});

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin'){
    killProcessWinpy(async ()=>{
      await app.quit();
      process.exit();
    });
  }
});
