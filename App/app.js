const path = require('path');
const { app, BrowserWindow, Notification, Menu, MenuItem, Tray, dialog, ipcMain, ipcRenderer  } = require('electron');
var DAO = require("../Repository/DB.js");
const translator = require("../Domain/Comun/Translator_app.js");
const AutoUpdater = require("../Domain/Service/AutoUpdater.js");
const Validations = require("../Domain/Comun/Validations.js");
const Screen_main = require("../Domain/Screens/main/main.js");
const Screens = require("../Domain/Screens/Screen.js");

var screen = null;

app.whenReady().then(() => {
  app.setAppUserModelId(app.getName());

  Validations.killProcessWinpy(()=>{

    Validations.DB_default_values(()=>{

      AutoUpdater.CreateWindow();
      AutoUpdater.Update_available();
      AutoUpdater.Update_not_available(createWindowApp);
      AutoUpdater.Update_downloaded(createWindowApp);
      AutoUpdater.Error(createWindowApp);
  
      app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length == 0) AutoUpdater.CreateWindow();
      });
  
      AutoUpdater.CheckUpdate();
    });

  });
  
});

function createWindowApp () {
  if(screen != null) return;

  screen = new Screen_main();

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
    if(dt != null && dt.name != null){
      Screens.New(dt.name);
      return true;
    }
    return false;
  });

  screen.handleMessages('close_window', (event, dt)=>{
    if(dt != null && dt.name != null){
      Screens.Close(dt.name);
      return true;
    }
    return false;
  });

  screen.setContextMenu(screen);
}

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin'){
    Validations.killProcessWinpy(async ()=>{
      await app.quit();
      process.exit();
    });
  }
});
