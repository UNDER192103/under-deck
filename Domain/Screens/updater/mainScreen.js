const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const MAIN_DIR = path.dirname(require.main.filename);

class MainScreen {
  window;

  position = {
    width: 1000,
    height: 600,
    maximized: false,
  };

  constructor() {
    this.window = new BrowserWindow({
      width: this.position.width,
      height: this.position.height,
      title: "Procurando atualizações",
      show: false,
      removeMenu: true,
      acceptFirstMouse: true,
      autoHideMenuBar: true,
      icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon.ico'),
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "./mainPreload.js"),
        devTools: false
      },
    });

    this.window.once("ready-to-show", () => {
      this.window.show();

      if (this.position.maximized) {
        this.window.maximize();
      }
    });

    this.handleMessages();

    this.window.loadFile(path.join(__dirname, "./app-check-update.html"));
  }

  sendDataView(message) {
    this.window.webContents.send("dataView", message);
  }

  close() {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  hide() {
    this.window.hide();
  }

  handleMessages() {
    //Ipc functions go here.
  }
}

module.exports = MainScreen;
