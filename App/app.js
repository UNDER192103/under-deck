const { app, BrowserWindow, session } = require('electron');
const AutoLaunch = require('auto-launch');
const Validations = require('../Domain/Communs/Validations.js');
const Screen_App = require("../Domain/Views/App/app.js");
var autoLaunch = new AutoLaunch({ name: app.getName(), path: app.getPath('exe') });
autoLaunch.enable();

app.commandLine.appendSwitch('disable-features', 'SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('enable-features', 'SameSiteDefaultChecksMethodRigorously');

Validations.CheckIsAppRunning().then(async () => {
    await Validations.SetDBDefaultValues();
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      if (details.responseHeaders && details.responseHeaders['set-cookie']) {
        details.responseHeaders['set-cookie'] = details.responseHeaders['set-cookie'].map(cookie => {
          let modifiedCookie = cookie.replace(/;\s*SameSite=\w+/gi, '');
          if (!modifiedCookie.includes('SameSite=')) {
            modifiedCookie += '; SameSite=None';
          }
          if (!modifiedCookie.includes('Secure')) {
            modifiedCookie += '; Secure';
          }
          return modifiedCookie;
        });
      }
      callback({ responseHeaders: details.responseHeaders });
    });
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