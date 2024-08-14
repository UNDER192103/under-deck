const { app, BrowserWindow, Menu, MenuItem, Tray, ipcMain, ipcRenderer, globalShortcut } = require("electron");
const { exec } = require('child_process');
const path = require("path");
const MAIN_DIR = path.dirname(require.main.filename);
const translator = require(path.join(MAIN_DIR, 'Domain', 'Comun', 'Translator_app.js'));
var DAO = require(path.join(MAIN_DIR, 'Repository', 'DB.js'));

var window;

class MainScreen {
  window;
  appIcon;
  contextMenu;

  position = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 300,
    maximized: false,
  };

  constructor(packageJson) {
    window = this.window;
    this.window = new BrowserWindow({
      title: packageJson.productName,
      width: this.position.width,
      height: this.position.height,
      minWidth: this.position.minWidth,
      minHeight: this.position.minHeight,
      autoHideMenuBar: true,
      icon: path.join(MAIN_DIR, 'Domain', 'src', 'img', 'under-icon.ico'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, "./preload.js"),
        devTools: true
      },
    });
  
    this.appIcon = new Tray(path.join(MAIN_DIR, '/Domain/src/img/under-icon.ico'));

    this.window.maximize();
    this.window.loadFile(path.join(__dirname, "./app.html"));
  }

  sendFrontData(type, message) {
    this.window.webContents.send(type, message);
  }

  setMenu() {
    const menuTemplate = [
      {
        label: "Menu",
        submenu: [
          {label: 'Reload Window', click(){ this.window.show(); this.window.reload(); } },
          {label: 'Relaunch App', click(){ app.relaunch(); app.exit(); }},
          {label: 'Quit', click(){ this.killProcessWinpy(async ()=>{ await app.quit(); process.exit(); }) } },
        ]
      },
      {
        label: 'View',
        role: 'viewMenu',
      }
    ]
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  }

  killProcessWinpy(callback) {
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
      if(callback != null)
        callback();
    })
  }

  setContextMenu(window) {
    window.contextMenu = Menu.buildFromTemplate([
      { label: translator.getNameTd('.apps_name'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 1);
          window.window.show();
          window.window.maximize();
        }
      },
      { label: translator.getNameTd('.keys_macro_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 2);
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.web_pages_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 3);
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.settings_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 4);
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.help_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 5);
        window.window.show();
        window.window.maximize();
        }
      },
      { type: 'separator' },
      { label: 'Under Deck', type: 'normal', click: () => {
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.relaunch_app'), type: 'normal', click: () => {
          app.relaunch();
          app.exit();
        }
      },
      { label: translator.getNameTd('.reload_window'), type: 'normal', click: () => {
        window.window.show();
        window.window.maximize();
        window.window.reload();
        }
      },
      { label: translator.getNameTd('.quit'), type: 'normal', click: async () => {
          killProcessWinpy(async ()=>{
            await app.quit();
            process.exit();
          });
        }
      }
    ]);
    
    window.appIcon.setToolTip('Under Deck');
    window.appIcon.setContextMenu(window.contextMenu);
  }

  close() {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  hide() {
    this.window.hide();
  }

  handleMessages(type, callback) {
    ipcMain.handle(type, callback)
  }

  startServices(){

  }
}

function killProcessWinpy(callback) {
  exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
    if(callback != null)
      callback();
  })
}

module.exports = MainScreen;
