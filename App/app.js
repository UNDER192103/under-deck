const path = require('path');
const { app, BrowserWindow, Tray } = require('electron');
const Validations = require('../Domain/Communs/Validations.js');
const Screen_App = require("../Domain/Views/App/app.js");
Validations.CheckIsAppRunning().then(async () => {
    await Validations.SetDBDefaultValues();
    if (BrowserWindow.getAllWindows().length == 0) createWindowApp();
});


function createWindowApp() {
    if (APP_SCREN != null) return;

    APP_HANDLEMESSAGES('APP_PATH', () => {
      return app.getAppPath();
    });

    APP_HANDLEMESSAGES('LANG_GET', (event, index) => {
      return TRANSLATOR.Get(index);
    });

    APP_HANDLEMESSAGES('LANG_LIST', () => {
      return TRANSLATOR.GetLang();
    });

    APP_HANDLEMESSAGES('LIST_LANGS', () => {
      return TRANSLATOR.GetListLanguages();
    });

    APP_HANDLEMESSAGES('new_window', (event, dt) => {
      if (dt != null && dt.name != null) {
        SCREENSCONTRUCTOR.New(dt);
        return true;
      }
      return false;
    });
    
    APP_HANDLEMESSAGES('close_window', (event, dt) => {
      if (dt != null && dt.name != null) {
        SCREENSCONTRUCTOR.Close(dt.name);
        return true;
      }
      return false;
    });

    APP_SCREN = new Screen_App();
    APP_ICON.on('double-click', function (e) {
      if (APP_SCREN.window.isVisible()) {
        APP_SCREN.window.hide();
      } else {
        APP_SCREN.window.show();
        APP_SCREN.window.maximize();
      }
    });

    APP_HANDLEMESSAGES('SELECT_LANG', async (event, id_lang) => {
      return await APP_SCREN.SelectLanguage(id_lang);
    });
    
    APP_SCREN.setContextMenu();
}

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin') {
    await Validations.killProcessWinpy();
    app.quit();
    process.exit();
  }
});