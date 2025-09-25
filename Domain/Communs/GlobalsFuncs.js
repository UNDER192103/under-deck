const { app, ipcMain, Tray } = require('electron');
const path = require('path');

app.setAppUserModelId(app.getName());
Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    }
});

//DataBase
var _DAO = require("../../Repository/DB.js");
Object.defineProperty(global, 'DAO', {
  value: _DAO,
  writable: true, // Prevents reassignment
  configurable: true, // Prevents deletion or modification of attributes
});

//Translator
var _TRANSLATOR = require('./Translator.js');
Object.defineProperty(global, 'TRANSLATOR', {
  value: _TRANSLATOR,
  writable: true,
  configurable: true,
});

//ScreensContructor
var _SCREENSCONTRUCTOR = require('./ScreensConstructor.js');
Object.defineProperty(global, 'SCREENSCONTRUCTOR', {
  value: _SCREENSCONTRUCTOR,
  writable: true,
  configurable: true,
});


//ScreensContructor
const _APP_HANDLEMESSAGES = (type, callback) => { ipcMain.handle(type, callback) };
Object.defineProperty(global, 'APP_HANDLEMESSAGES', {
  value: _APP_HANDLEMESSAGES,
  writable: true,
  configurable: true,
});

//Defaults 
Object.defineProperty(global, 'APP_ICON', {
  value: new Tray(path.join(app.getAppPath(), 'Domain', 'Src', 'img', 'UDIx256.ico')),
  writable: true,
  configurable: true,
});
Object.defineProperty(global, 'APP_SCREN', {
  value: null,
  writable: true,
  configurable: true,
});

const PathAppData = app.getPath('userData');
const BasePathAppData = path.join(PathAppData, 'UN-DATA');

Object.defineProperty(global, 'BASE_PATHS', {
  value: {
    UN_DATA: BasePathAppData,
    DB: path.join(BasePathAppData, 'DB'),
    ICONS_EXE: path.join(BasePathAppData, 'icons-exe'),
    ICONS_WEBPAGES: path.join(BasePathAppData, 'icons-webpages'),
    THEMES: path.join(BasePathAppData, 'Themes'),
    LANGUAGES: path.join(BasePathAppData, 'Languages'),
    PLUGINS: path.join(BasePathAppData, 'Plugins'),
  },
  writable: true,
  configurable: true,
});