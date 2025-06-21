const { app, BrowserWindow, Notification, Menu, dialog, MenuItem, Tray, ipcMain, ipcRenderer, globalShortcut } = require("electron");
const path = require('path');
const fs = require("fs");
const translator = require(path.join(app.getAppPath(), 'Domain', 'Comun', 'Translator_app.js'));
var DAO = require(path.join(app.getAppPath(), 'Repository', 'DB.js'));
const PACKGEJSON = require("../../../package.json");

class OverlayScreen {
  isShowing = false;
  mainScreen;
  window;
  position = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    maximized: false,
  };

  constructor(MainScreen) {
    this.mainScreen = MainScreen;
    this.window = new BrowserWindow({
      title: app.getName(),
      show: false,
      fullscreen: true,
      movable: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      autoHideMenuBar: true,
      transparent:true,
      frame: false,
      width: this.position.width,
      height: this.position.height,
      minWidth: this.position.minWidth,
      minHeight: this.position.minHeight,
      icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: PACKGEJSON.status == 'dev' ? true : false,
      },
    });
    this.startAllHandleMessages();
    this.startAllServices();

    this.window.once("ready-to-show", () => {
      setTimeout(() => { this.startServices(); }, 2500);
    });
    this.window.loadFile(path.join(__dirname, "./overlay.html"));
    this.window.maximize();
    this.window.setFullScreen(true);
  }

  sendFrontData(type, message) {
    this.window.webContents.send(type, message);
  }

  toggle(){
    if(this.isShowing === true){
      this.isShowing = false;
      this.window.hide();
    }else{
      this.isShowing = true;
      this.window.maximize();
      this.window.setFullScreen(true);
      this.window.show();
      this.window.focus();
    }
  }

  show(){
    this.isShowing = true;
    this.window.show();
    this.window.focus();
  }

  Reload(){
    this.window.reload();
  }

  hide(){
    this.isShowing = false;
    this.window.hide();
  }

  Notification(title, body, onClickMenu) {
    if (DAO.DB.get('App_notification_windows') == true) {
      new Notification({
        title: title,
        body: body,
        icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      }).on('click', (e) => {
        if (onClickMenu) onClickMenu(e);
      }).show();
    }
  }

  close() {
    this.window.close();
  }
  
  handleMessages(type, callback) {
    ipcMain.handle(type, callback);
  }

  startAllHandleMessages() {

    this.handleMessages('get-app-name', () => {
      return app.getName();
    });

    this.handleMessages('get-app-version', () => {
      return app.getVersion();
    });

    this.handleMessages('get-app-path', () => {
      return app.getAppPath();
    });

    this.handleMessages('get-app-icon', () => {
      return path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico');
    });

    this.handleMessages('hide', (event, path) => {
      this.hide();
    });

    this.handleMessages('close', (event, path) => {
      this.close();
    });
   
    this.handleMessages('OV-Update-data', (event, type) => {
      this.sendFrontData('OV-Update-data', type);
    });
  }

  startAllServices() {
    
  }

  startServices() {

  }
}

module.exports = OverlayScreen;
