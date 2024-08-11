//Agora
const path = require('path');
const { app, BrowserWindow, Menu, MenuItem, Tray, dialog, ipcMain, ipcRenderer  } = require('electron');
const Screen_update = require("../Domain/Updater/main/mainScreen.js");
const { autoUpdater, AppUpdater } = require("electron-updater");
const { exec } = require('child_process');
const MAIN_DIR = path.dirname(require.main.filename);
var DAO = require("../Repository/DB.js");
var windows_custom = {};

DAO.DB.set("select_folder", null);
DAO.DB.set("select_file", null);
DAO.Opens_windows.delete("google_tranlate")

var window = null;
var window_update;
//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoRunAppAfterInstall = true;
//

const select_folder = async (properties = ['openDirectory'], filters = [])=>{
  dialog.showOpenDialog({ properties: properties, filters: filters }).then(async (obj)=>{
    var is_selec_folder = await DAO.DB.get("select_folder");
    if(!is_selec_folder)
      is_selec_folder = {};

    if(obj.canceled){
      is_selec_folder.status = 'canceled';
      await DAO.DB.set("select_folder", is_selec_folder);
    }
    else{
      is_selec_folder.files = obj.filePaths;
      is_selec_folder.status = 200; 
      await DAO.DB.set("select_folder", is_selec_folder);
    }
  });
}
const select_file = async (properties = ['openFile'], filters = [])=>{
  dialog.showOpenDialog({ properties: properties,  filters: filters }).then(async (obj)=>{
    var is_selec_file = await DAO.DB.get("select_file");
    if(!is_selec_file)
      is_selec_file = {};

    if(obj.canceled){
      is_selec_file.status = 'canceled';
      await DAO.DB.set("select_file", is_selec_file);
    }
    else{
      is_selec_file.files = obj.filePaths;
      is_selec_file.status = 200; 
      await DAO.DB.set("select_file", is_selec_file);
    }
  });
}
const create_new_windows = async (data) =>{
  if(windows_custom[data.name] == null){
    windows_custom[data.name] = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        preload: path.join(MAIN_DIR, 'Domain', 'service', 'preload.js'),
        devTools: true
      }
    });
    windows_custom[data.name].maximize();
    windows_custom[data.name].loadURL(data.url);
    windows_custom[data.name].show();
    await DAO.Opens_windows.set(data.name, data);
    windows_custom[data.name].on('closed', async function(){
      delete windows_custom[data.name];
      await DAO.Opens_windows.delete(data.name);
    });
  }
  else{
    await windows_custom[data.name].show();
  }
}
const _check = async ()=>{
  var is_selec_folder = await DAO.DB.get("select_folder");
  var is_selec_file = await DAO.DB.get("select_file");
  var new_windows = await DAO.DB.get("new_windows");
  var focus_window = await DAO.DB.get("focus_window");

  if(focus_window != null){
    
    if(windows_custom[focus_window] != null)
      await windows_custom[focus_window].show();

    await DAO.DB.delete("focus_window");
  }

  if(new_windows != null){
    create_new_windows(new_windows)
    await DAO.DB.set("new_windows", null);
  }

  if(is_selec_folder != null && is_selec_folder.status == "get"){

    await select_folder(is_selec_folder.properties, is_selec_folder.filters);
    is_selec_folder.status = 'await';
    DAO.DB.set("select_folder", is_selec_folder);

  }
  else if(is_selec_file != null && is_selec_file.status == "get"){

    await select_file(is_selec_file.properties, is_selec_file.filters);
    is_selec_file.status = 'await';
    DAO.DB.set("select_file", is_selec_file);

  }
  
  setTimeout(async ()=>{_check()}, 200);
}
_check();
function createWindowApp () {

  window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 300,
    autoHideMenuBar: true,
    icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(MAIN_DIR, 'Domain', 'service', 'preload.js'),
      devTools: false
    }
  });

  window.on('minimize',function(event){
    event.preventDefault();
    window.hide();
  });

  var appIcon = null;
  appIcon = new Tray(path.join(MAIN_DIR, '/Domain/src/img/under-icon.ico'));
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Open', type: 'normal', click: () => {
        window.show();
        window.maximize();
      }
    },
    { label: 'Relaunch App', type: 'normal', click: () => {
      app.relaunch();
      app.exit();
      }
    },
    { label: 'Reload Window', type: 'normal', click: () => {
        window.show();
        window.reload();
      }
    },
    { label: 'Quit', type: 'normal', click: async () => {
        killProcessWinpy(async ()=>{
          await app.quit();
          process.exit();
        });
      }
    }
  ]);
  
  appIcon.setToolTip('Under Deck');
  appIcon.setContextMenu(contextMenu);
  appIcon.on('double-click', function(e){
    if (window.isVisible()){
      window.hide();
    } else {
      window.show();
      window.maximize();
    }
  });

  window.maximize();
  window.loadFile(path.join(MAIN_DIR, "/Domain/src/html/app.html"));

  setTimeout(()=>{
    window.show();
    
  },2000)
}
function killProcessWinpy(callback) {
  exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
    if(callback != null)
      callback();
  })
}
const menuTemplate = [
  {
    label: "Menu",
    submenu: [
      {label: 'Reload Window', click(){ window.show(); window.reload(); } },
      {label: 'Relaunch App', click(){ app.relaunch(); app.exit(); }},
      {label: 'Quit', click(){ killProcessWinpy(async ()=>{ await app.quit(); process.exit(); }) } },
    ]
  },
  {
    label: 'View',
    role: 'viewMenu',
  }
]
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

function createWindowUpdate() {
  window_update = new Screen_update();
}

app.whenReady().then(() => {
  killProcessWinpy(()=>{
    createWindowUpdate();

    app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length == 0) createWindowUpdate();
    });
    
    autoUpdater.checkForUpdates();
    window_update.sendDataView({version: app.getVersion(), status: 11, msg: "Procurando atualizações!"});
  });
});

autoUpdater.on("update-available", (info) => {
  window_update.sendDataView({version: app.getVersion(), status: 1, msg: "Uma atualização esta disponival, por favor aguarde o downlaod ser finalizado!"});
  let pth = autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", (info) => {
  window_update.sendDataView({version: app.getVersion(), status: 2, msg: `O aplicativo ja esta na ultima versão: ${app.getVersion()}!`});
  createWindowApp();
  setTimeout(()=>{
    try {
      window_update.close();
    } catch (error) { 
    }
  }, 10000);
});

//Download Completion Message
autoUpdater.on("update-downloaded", (info) => {
  window_update.sendDataView({version: app.getVersion(), status: 3, msg: "Atualização baixada com sucesso!"});
  createWindowApp();
  setTimeout(()=>{
    try {
      window_update.close();
    } catch (error) { 
    }
  }, 10000);
});

autoUpdater.on("error", (info) => {
  window_update.sendDataView({version: app.getVersion(), status: 0, msg: "Erro na atualização do aplicativo!"});
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
