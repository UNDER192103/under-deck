const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const MAIN_DIR = path.dirname(require.main.filename);
const translator = require(path.join(MAIN_DIR, 'Domain', 'Comun', 'Translator_app.js'));

class MainScreen {
  window;

  position = {
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 300,
    maximized: false,
  };

  constructor() {
    this.window = new BrowserWindow({
      width: this.position.width,
      height: this.position.height,
      minWidth: this.position.minWidth,
      minHeight: this.position.minHeight,
      title: `${app.getName()} - ${translator.getNameTd('.looking_for_updates')}`,
      show: false,
      removeMenu: true,
      acceptFirstMouse: true,
      autoHideMenuBar: true,
      icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "./mainPreload.js"),
        devTools: false
      },
    });

    this.window.once("ready-to-show", () => {
      this.sendDataView("dataView", {version: app.getVersion(), status: 1, msg: translator.getNameTd('.looking_for_updates')});
      this.window.show();

      if (this.position.maximized) {
        this.window.maximize();
      }
    });

    this.window.loadFile(path.join(__dirname, "./app-check-update.html"));
  }

  sendDataView(type, message) {
    this.window.webContents.send(type, message);
  }

  close() {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  hide() {
    this.window.hide();
  }

  handleMessages(type, callback) {
    ipcMain.handle(type, callback);
  }
}

module.exports = MainScreen;
