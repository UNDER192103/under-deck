const { app, BrowserWindow, Notification, Menu, dialog, ipcMain, protocol } = require("electron");
const { UnderDeck } = require('underdecklib');
const { exec } = require('child_process');
const path = require('path');
const fs = require("fs");
const QRCode = require('qrcode');
const { getAllInstalledSoftwareSync } = require('fetch-installed-software');
const DiscordService = require("../../Services/Discord.js");
const Commun = require("../../Communs/Commun.js");
const ServiceUnderDeck = require("../../Services/UnderDeck.js");
const { autoUpdater } = require("electron-updater");
const OverlayScreen = require("../Overlay/overlay.js");
const ObsService = require("../../Services/Obs.js");
const CloudService = require("../../Services/Cloud.js");
const ShortcutKeys = require("../../Services/ShortcutKeys.js");
const LocalServer = require("../../Services/LocalServer.js");

var robotjs;
try {
  robotjs = require('robotjs');
} catch (error) {
  console.log(error);
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

const ClientUnderDeck = new UnderDeck();
ClientUnderDeck.LanguageId = DAO.DB.get('lang_selected');

class MainScreen {
  ClientUnderDeck = ClientUnderDeck;
  overlayScreen;
  window;
  contextMenu;
  countsObsTryConect = 0;
  localServer;
  macrosService;
  ClientDiscordService;
  ClientServiceUnderDeck;
  position = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    maximized: false,
  };

  constructor() {
    this.macrosService = new ShortcutKeys();
    this.ClientDiscordService = new DiscordService();
    this.ClientServiceUnderDeck = new ServiceUnderDeck(this.ClientDiscordService, ObsService);
    this.localServer = new LocalServer(this.ClientServiceUnderDeck);
    this.overlayScreen = new OverlayScreen(this);
    this.window = new BrowserWindow({
      title: app.getName(),
      frame: false,
      autoHideMenuBar: true,
      width: this.position.width,
      height: this.position.height,
      minWidth: this.position.minWidth,
      minHeight: this.position.minHeight,
      autoHideMenuBar: true,
      icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'UDIx256.ico'),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        devTools: DAO.DB.get('devTools') === true ? true : false,
      },
    });

    this.startAllHandleMessages();
    this.startAllServices();
    this.startAllProtocols();

    this.window.once("ready-to-show", () => {
      setTimeout(() => { this.startServices(); }, 2500);
      setInterval(async () => {
        if (await DAO.DB.get('ShowMainScreen') == true) {
          await DAO.DB.set('ShowMainScreen', false);
          this.window.show();
          this.window.maximize();
        }
      }, 5000);
    });
    
    this.window.on("close", async (event) => {
      event.preventDefault();
      if (await DAO.DB.get('isMinimizeToBar') == true)
        this.window.hide();
      else
        this.CloseAllWindows();
    });
    this.ClientServiceUnderDeck.SetSendFrontDataCallback((...args) => {
      this.sendFrontData(...args);
    });

    this.ClientServiceUnderDeck.SetProcessObsEvents((...args) => {
      this.ProcessObsEvents(...args);
    });;

    this.window.maximize();
    this.window.loadFile(path.join(__dirname, "/View/app.html"));

    if (DAO.DBUSER.get('UserToken')) this.ClientUnderDeck.Auth(DAO.DBUSER.get('UserToken'));
  }

  sendFrontData(type, message) {
    this.window.webContents.send(type, message);
  }

  setMenu() {
    const menuTemplate = [
      {
        label: "Menu",
        submenu: [
          { label: 'Reload Window', click: () => { this.window.show(); this.window.reload(); } },
          { label: 'Relaunch App', click: () => { app.relaunch(); app.exit(); } },
          { label: 'Quit', click: () => { this.killProcessWinpy(async () => { await app.quit(); process.exit(); }) } },
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

  Notification(title, body, onClickMenu) {
    if (DAO.DB.get('App_notification_windows') == true) {
      new Notification({
        title: title,
        body: body,
        icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'UDIx256.ico'),
      }).on('click', (e) => {
        if (onClickMenu) onClickMenu(e);
      }).show();
    }
  }

  async CloseAllWindows() {
    this.window.close();
    this.overlayScreen.window.close();
    ipcMain.removeAllListeners();
    await app.quit();
    process.exit();
  }

  killProcessWinpy(callback) {
    this.macrosService.stop();
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
      if (callback != null)
        callback();
    })
  }

  setContextMenu() {
    this.contextMenu = Menu.buildFromTemplate([
      {
        label: app.getName(), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'app-main');
          this.window.show();
          this.window.maximize();
        }
      },
      { type: 'separator' },
      {
        label: TRANSLATOR.Get('.apps_name'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'app-main');
          this.window.show();
          this.window.maximize();
        }
      },
      {
        label: TRANSLATOR.Get('.keys_macro_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'keys-macros');
          this.window.show();
          this.window.maximize();
        }
      },
      {
        label: TRANSLATOR.Get('.web_pages_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'web-pages');
          this.window.show();
          this.window.maximize();
        }
      },
      {
        label: TRANSLATOR.Get('.obs_studio_n_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'obs-studio');
          this.window.show();
          this.window.maximize();
        }
      },
      {
        label: TRANSLATOR.Get('.settings_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'config');
          this.window.show();
          this.window.maximize();
        }
      },
      {
        label: TRANSLATOR.Get('.help_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'help');
          this.window.show();
          this.window.maximize();
        }
      },
      { type: 'separator' },
      {
        label: TRANSLATOR.Get('.relaunch_app'), type: 'normal', click: () => {
          app.relaunch();
          app.exit();
        }
      },
      {
        label: TRANSLATOR.Get('.reload_window'), type: 'normal', click: () => {
          this.window.show();
          this.window.maximize();
          this.window.reload();
        }
      },
      {
        label: TRANSLATOR.Get('.quit'), type: 'normal', click: async () => {
          this.killProcessWinpy(async () => {
            this.CloseAllWindows();
          });
        }
      }
    ]);

    APP_ICON.setToolTip(app.getName());
    APP_ICON.setContextMenu(this.contextMenu);
  }

  close() {
    this.CloseAllWindows();
  }

  hide() {
    this.window.hide();
  }

  handleMessages(type, callback) {
    ipcMain.handle(type, callback);
  }

  async SelectLanguage(lang) {
    await TRANSLATOR.SetLanguage(lang);
    this.overlayScreen.Reload();
    this.ClientUnderDeck.LanguageId = lang;
    this.setContextMenu();
  }

  startAllProtocols() {
    if (!protocol.isProtocolRegistered('sysunda')) {
      protocol.registerFileProtocol('sysunda', (request, callback) => {
        const url = request.url.substr('sysunda://'.length);
        const filePath = path.join(BASE_PATHS.UN_DATA, url);
        callback({ path: path.normalize(filePath) });
      });
    }

    if (!protocol.isProtocolRegistered('sys')) {
      protocol.registerFileProtocol('sys', (request, callback) => {
        // Remove 'sys:///' e decodifica a URL
        const url = decodeURI(request.url.substr('sys:///'.length));
        // Normaliza o caminho para o formato do sistema operacional (ex: C:\\Users\\...)
        const filePath = path.normalize(url);
        callback({ path: filePath });
      });
    }

    if (!protocol.isProtocolRegistered('sysfssrc')) {
      protocol.registerFileProtocol('sysfssrc', (request, callback) => {
        const url = request.url.substr('sysfssrc://'.length);
        const filePath = path.join(app.getAppPath(), 'Domain', 'Src', url);
        callback({ path: path.normalize(filePath) });
      });
    }

    if (!protocol.isProtocolRegistered('sysviewapp')) {
      protocol.registerFileProtocol('sysviewapp', (request, callback) => {
        const url = request.url.substr('sysviewapp://'.length);
        const filePath = path.join(__dirname, url);
        callback({ path: path.normalize(filePath) });
      });
    }

    if (!protocol.isProtocolRegistered('sysfsapp')) {
      protocol.registerFileProtocol('sysfsapp', (request, callback) => {
        const url = request.url.substr('sysfsapp://'.length);
        const filePath = path.join(app.getAppPath(), url);
        callback({ path: path.normalize(filePath) });
      });
    }

    if (!protocol.isProtocolRegistered('syspaththmes')) {
      protocol.registerFileProtocol('syspaththmes', (request, callback) => {
        const url = decodeURIComponent(request.url.substr('syspaththmes://'.length));
        const filePath = path.join(DAO.THEME_DIR, url);
        callback({ path: path.normalize(filePath) });
      });
    }
  }

  startAllHandleMessages() {

    this.handleMessages('GenerateQrcodeUrl', async (event, data) => {
      return new Promise( resolve => {
        QRCode.toDataURL(data, function (err, url) {
            if (!err) {
                resolve(url);
            }
            else {
              resolve(false)
            }
        });
      });
    });

    this.handleMessages('GetRemoveServerUrl', async (event, data) => {
      return this.ClientUnderDeck.Api.app.defaults.baseURL
    });

    this.handleMessages('OpenUrlInBrowser', async (event, url) => {
      return this.ClientServiceUnderDeck.OpenUrlInBrowser(url);
    });

    this.handleMessages('GetStatusLocalServer', async (event, data) => {
      return {
        address: this.localServer.ipAddress || await this.ClientServiceUnderDeck.GetMyIPAddress() || 'localhost',
        isStarted: this.localServer.isStarted,
        port: this.localServer.port,
      };
    });

    this.handleMessages('CommandLocalServer', async (event, data) => {
      switch (data.type) {
        case 'start':
          await DAO.DB.set('isStartLocalServer', true);
          return await this.localServer.start();
        break;

        case 'stop':
          await DAO.DB.set('isStartLocalServer', false);
          return await this.localServer.stop();
        break;

        case 'restart':
          return await this.localServer.restart();
        break;
      
        default:
          console.log(data);
          return null;
        break;
      }
    });

    this.handleMessages('RestartLocalServer', async (event, data) => {
      return await this.localServer.restart();
    });

    this.handleMessages('UpdateWebDeckData', async (event, data) => {
      return await this.ClientServiceUnderDeck.UpdateWebDeckData(data);
    });

    this.handleMessages('UpdateAppThemeAnimations', async (event, data) => {
      return await this.ClientServiceUnderDeck.UpdateAppThemeAnimations(data);
    });

    this.handleMessages('RemoveWebPage', async (event, data) => {
      return await this.ClientServiceUnderDeck.RemoveWebPage(data);
    });

    this.handleMessages('AddWebPage', async (event, data) => {
      return await this.ClientServiceUnderDeck.AddWebPage(data);
    });

    this.handleMessages('AddKeyMacro', async (event, data) => {
      return await this.ClientServiceUnderDeck.AddKeyMacro(data);
    });

    this.handleMessages('EditKeyMacro', async (event, data) => {
      return await this.ClientServiceUnderDeck.EditKeyMacro(data);
    });

    this.handleMessages('DeleteKeyMacro', async (event, data) => {
      return await this.ClientServiceUnderDeck.DeleteKeyMacro(data);
    });

    this.handleMessages('UpdateAppSettings', async (event, data) => {
      return await this.ClientServiceUnderDeck.UpdateAppSettings(data);
    });

    this.handleMessages('SetKeysOverlay', async (event, data) => {
      return await this.ClientServiceUnderDeck.SetKeysOverlay(data);
    });

    this.handleMessages('GetAllInstalledSoftwareSync', async (event, data) => {
      return await getAllInstalledSoftwareSync();
    });

    this.handleMessages('TryOpenFolderInstalledSoftware', async (event, dir) => {
      dir = dir.replace(path.basename(dir), "");
      try {
        exec(`explorer "${dir}"`);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    });

    this.handleMessages('ExecAppByUuid', async (event, uuid) => {
      return await this.ClientServiceUnderDeck.ExecutAppByUuid(uuid);
    });

    this.handleMessages('ExecSoundpadAudio', async (event, soundpadAudio) => {
      return await this.ClientServiceUnderDeck.ExecSoundPad(soundpadAudio);
    });

    this.handleMessages('UpdateObsData', async (event, dataObs) => {
      return await this.ClientServiceUnderDeck.UpdateObsData(dataObs);
    });

    this.handleMessages('UpdateUpdatesData', async (event, Data) => {
      console.log(Data);
      if (Data.AppAutoUpdate != null) {
        await DAO.DB.set('AutoUpdateApp', Data.AppAutoUpdate ? true : false);
      }
    });

    this.handleMessages('AddApp', async (event, app) => {
      return await this.ClientServiceUnderDeck.AddApp(app);
    });

    this.handleMessages('EditApp', async (event, app) => {
      return await this.ClientServiceUnderDeck.EditApp(app);
    });

    this.handleMessages('DeleteApp', async (event, app) => {
      return await this.ClientServiceUnderDeck.DeleteApp(app);
    });

    this.handleMessages('AppPath', async (event, soundpadAudio) => {
      return path.join(app.getAppPath());
    });

    this.handleMessages('SrcAppPathImg', async (event, soundpadAudio) => {
      return path.join(app.getAppPath(), 'Domain', 'src', 'img');
    });

    this.handleMessages('GetAllAppData', async (event, dt) => {
      return this.ClientServiceUnderDeck.GetAllAppData();
    });

    this.handleMessages('GetModulesList', async (event) => {
      const modulesPath = path.join(__dirname, 'View', 'modules');
      try {
        const entries = await fs.promises.readdir(modulesPath, { withFileTypes: true });
        return entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
      } catch (error) {
        console.error('Erro ao listar os módulos:', error);
        return [];
      }
    });

    this.handleMessages('SET_LANG', async (event, Lang) => {
      return this.SelectLanguage(Lang && Lang.id ? Lang.id : Lang);
    });

    this.handleMessages('SetAppTheme', async (event, Theme) => {
      return await this.ClientServiceUnderDeck.SetAppTheme(Theme);
    });

    this.handleMessages('GetAppTheme', async (event, dt) => {
      return await this.ClientServiceUnderDeck.GetAppThemes();
    });

    this.ClientUnderDeck.on('Ready', async () => {
      DAO.DBUSER.set('UserToken', this.ClientUnderDeck.User.token);
    });

    this.ClientUnderDeck.on('Logout', async () => {
      DAO.DBUSER.delete('UserToken');
    });

    this.ClientUnderDeck.on('SocketReady', async (Message) => {
      this.sendFrontData('UpdateUserData', true);
    });

    this.ClientUnderDeck.on('ClientUpdated', async () => {
      this.sendFrontData('ClientUpdated', true);
    });

    this.ClientUnderDeck.on('SocketMessage', async (Message) => {
      try {
        if (Message.object) {
          switch (Message.object.Method) {
            case 'RequestConnectionPermission':
              this.sendFrontData('UserRequestConnectionPermission', Message.object);
              break;

            case 'GetWebDeckData':
              Message.reply(await this.ClientServiceUnderDeck.ListProgramsForRemote(), Message.object.Method);
              break;

            case 'GetAppIconByUuid':
              Message.reply(await this.ClientServiceUnderDeck.GetAppIconByUuid(Message.object.Data.uuid), Message.object.Method);
              break;

            case 'GetPageIconById':
              Message.reply(await this.ClientServiceUnderDeck.GetPageIconById(Message.object.Data.id), Message.object.Method);
              break;

            case 'ExecAppByUuid':
              this.sendFrontData('ExecAppByUuid', Message.object.Data.uuid);
              break;

            case 'GetAppVolume':
              try {
                Message.reply({ volume: await this.ClientServiceUnderDeck.GetWindowsVolume() }, Message.object.Method);
              } catch (error) {
                console.log('error', error);
              }
              break;

            case 'SetAppVolume':
              try {
                if (Message.object.Data && Message.object.Data.volume) {
                  this.ClientServiceUnderDeck.SetWindowsVolume(Message.object.Data.volume);
                }
              } catch (error) {
                console.log('error', error);
              }
              break;

            default:
              console.log(Message.object)
              break;
          }
        }
      } catch (error) {
        console.log(error);
      }
    });

    this.ClientUnderDeck.Esp32MultiManager.on('data', (data) => {
      this.sendFrontData('Esp32Data', data);
    });

    this.ClientUnderDeck.Esp32MultiManager.on('disconnected', (data) => {
      this.sendFrontData('Esp32disconnected', data);
    });

    this.ClientUnderDeck.Esp32MultiManager.on('connected', (data) => {
      this.sendFrontData('Esp32Connected', data);
    });

    this.handleMessages('esp32DiscoverDevices', async (event, dt) => {
      return await this.ClientUnderDeck.Esp32MultiManager.discoverDevices();
    });

    this.handleMessages('esp32Connect', async (event, data) => {
      return await this.ClientUnderDeck.Esp32MultiManager.connect(data.path, data.info);
    });

    this.handleMessages('RequestCodeChangePassword', async (event, data) => {
      return await this.ClientUnderDeck.RequestCodeChangePassword(data.username);
    });

    this.handleMessages('ChangePassword', async (event, data) => {
      return await this.ClientUnderDeck.ChangePassword(data.clientId, data.code, data.Password, data.CPassword);
    });

    this.handleMessages('AcceptRequestConnection', async (event, data) => {
      this.ClientUnderDeck.SendSocketMessage({ to: data.From }, 'AcceptedRequestConnectionPermission');
    });

    this.handleMessages('RejectedRequestConnection', async (event, data) => {
      this.ClientUnderDeck.SendSocketMessage({ to: data.From }, 'RejectRequestConnectionPermission');
    });

    this.handleMessages('SendMsgConfirmEmail', async (event, data) => {
      return await this.ClientUnderDeck.SendMsgConfirmEmail();
    });

    this.handleMessages('UserRegister', async (event, data) => {
      return await this.ClientUnderDeck.UserRegister(data);
    });

    this.handleMessages('LogoutAccount', async (event, data) => {
      return await this.ClientUnderDeck.Logout();
    });

    this.handleMessages('UserLogin', async (event, data) => {
      let resLogin = await this.ClientUnderDeck.Login(data.username, data.password);
      if (resLogin && this.ClientUnderDeck.User) {
        return this.ClientUnderDeck.User;
      }
      return false;
    });

    this.handleMessages('RGetAccount', async (event, data) => {
      return await this.ClientUnderDeck.GetAccount();
    });

    this.handleMessages('GetPlugins', async (event, data) => {
      return await this.ClientUnderDeck.GetPlugins();
    });

    this.handleMessages('GetThemes', async (event, data) => {
      return await this.ClientUnderDeck.GetThemes();
    });

    this.handleMessages('UpdateUserStatus', async (event, data) => {
      if (data && data.id) {
        return await this.ClientUnderDeck.UpdateUser({ status: data.id });
      }
      else return null;
    });

    this.handleMessages('RevockUserPermisionThisPc', async (event, data) => {
      if (data && data.userId) {
        return await this.ClientUnderDeck.RevockUserPermisionThisPc(data.userId);
      }
      else return null;
    });

    this.handleMessages('DefineMyTheme', async (event, data) => {
      return await this.ClientUnderDeck.DefineMyTheme(data.namePlateId || null, data.backgroundId || null);
    });

    this.handleMessages('UpdateUser', async (event, data) => {
      if (typeof data == 'object') {
        return await this.ClientUnderDeck.UpdateUser(data);
      }
      else return null;
    });

    this.handleMessages('RemoveUserVatar', async (event, data) => {
      return await this.ClientUnderDeck.UpdateUser({ removeAvatar: true });
    });

    this.handleMessages('UpdateUserAvatar', async (event, data) => {
      return new Promise(async resolve => {
        if (data && data.base64) {
          const base64Content = data.base64.split(';base64,').pop();
          const buffer = Buffer.from(base64Content, 'base64');
          const blob = new Blob([buffer]);
          resolve(await this.ClientUnderDeck.ChangeAvatar(new File([blob], data.name), data.width, data.height, data.left, data.top));
        }
        else resolve(null);
      });
    });

    this.handleMessages('GetAccount', async (event, data) => {
      return this.ClientUnderDeck.User;
    });

    this.handleMessages('GetPC', async (event, data) => {
      return this.ClientUnderDeck.Pc;
    });

    this.handleMessages('ListAllUsersThisPCPermissions', async (event, data) => {
      return this.ClientUnderDeck.ListAllUsersThisPCPermissions();
    });

    this.handleMessages('RevoceAllUsersPermThisPc', async (event, data) => {
      return this.ClientUnderDeck.RevokeAllPermissionForPC();
    });

    this.handleMessages('RequestFriend', async (event, data) => {
      if (data && data.userId) {
        return this.ClientUnderDeck.SendFriendRequest(data.userId);
      }
      else return null;
    });

    this.handleMessages('ResendFriendRequest', async (event, data) => {
      if (data && data.requestId) {
        return this.ClientUnderDeck.ResendFriendRequest(data.requestId);
      }
      else return null;
    });

    this.handleMessages('AcceptFriendRequest', async (event, data) => {
      if (data && data.requestId) {
        return this.ClientUnderDeck.AcceptFriendRequest(data.requestId);
      }
      else return null;
    });

    this.handleMessages('RejectFriendRequest', async (event, data) => {
      if (data && data.requestId) {
        return this.ClientUnderDeck.RejectFriendRequest(data.requestId);
      }
      else return null;
    });

    this.handleMessages('FindUserByName', async (event, data) => {
      if (data && data.name) {
        return this.ClientUnderDeck.FindUserByName(data.name);
      }
      else return null;
    });

    this.handleMessages('UnFriend', async (event, data) => {
      if (data && data.requestId) {
        return this.ClientUnderDeck.RequestUnFriend(data.requestId);
      }
      else return null;
    });

    this.handleMessages('exec-fbt', async (event, data) => {
      this.sendFrontData('exec-fbt', data);
    });

    this.handleMessages('UpdateAppsPositions', async (event, listPositions) => {
      return await this.ClientServiceUnderDeck.UpdateAppsPositions(listPositions);
    });

    this.handleMessages('UpdateSoundPadPath', async (event, PathFile) => {
      return await this.ClientServiceUnderDeck.UpdateSoundPadPath(PathFile);
    });

    this.handleMessages('GetSoundPadPath', async () => {
      return await this.ClientServiceUnderDeck.GetSoundPadPath();
    });

    this.handleMessages('CheckSoundPadExe', async () => {
      return new Promise(async resolve => {
        let path = await this.ClientServiceUnderDeck.GetSoundPadPath();
        if (await fs.existsSync(path)) {
          exec(`${path} -v`, (e) => {
            if (e == null)
              resolve(true);
            else
              resolve(false);
          });
        }
        else
          resolve(false);
      })
    });

    this.handleMessages('GetListSoundpadAudios', async () => {
      return await this.ClientServiceUnderDeck.ListAudiosSoundPad();
    });

    this.handleMessages('SerializeSynchronizedConfig', async (event, data) => {
      return new Promise(resolve => {
        const userToken = DAO.DBUSER.get('UserToken');
        this.ClientServiceUnderDeck.SerializeSynchronizedConfig(data, async () => {
          if (userToken) this.ClientUnderDeck.Auth(userToken);
          resolve(true);
        });
      })
    });

    this.handleMessages('SerializeImportedConfig', async (event, Drt) => {
      return new Promise(resolve => {
        const userToken = DAO.DBUSER.get('UserToken');
        this.ClientServiceUnderDeck.SerializeFromLocalFile(Drt, async () => {
          if (userToken) this.ClientUnderDeck.Auth(userToken);
          resolve(true);
        });
      })
    });

    this.handleMessages('DecodeFileImportConfigs', async (event, filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          return await { drt: JSON.parse(Buffer.from(fs.readFileSync(filePath, 'utf8'), 'base64').toString('utf8')) };
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    this.handleMessages('ExportAppConfigs', async (event, data) => {
      return new Promise(async (resolve) => {
        try {
          var ___PATHDB = path.join(DAO.DB_DIR, 'UN-DATA');
          Commun.ListAllFilesInFolder(___PATHDB).then(async filesToBackup => {
            filesToBackup = filesToBackup.filter(f => !f.includes(path.join(___PATHDB, 'themes')));
            if (!data.isExportImgs) filesToBackup = filesToBackup.filter(f => f.includes('.json'));
            var files_exported = await filesToBackup.map((file) => {
              let pathFile = file.replace(___PATHDB + '\\', '');
              let splitPath = pathFile.split('\\');
              splitPath.pop();
              let fileName = pathFile.split('\\').pop();
              return {
                paths: splitPath,
                mainPath: splitPath[0],
                fileName: fileName,
                ext: path.extname(file),
                size: fs.statSync(file).size,
                data: fs.readFileSync(file, 'base64'),
              };
            });
            fs.writeFile(data.path, Buffer.from(await JSON.stringify(files_exported)).toString('base64'), (err, buf) => {
              resolve(true);
            });
          });
        } catch (error) {
          console.log(error);
          resolve(false);
        }
      });
    });

    this.handleMessages('Dialog--SelectFileToPath', async (event, dt) => {
      return new Promise(async (resolve) => {

        dialog.showSaveDialog({
          title: TRANSLATOR.Get('.save_file'),
          filters: [{ name: dt.nameFile, ext: dt.ext }],
          nameFieldLabel: dt.nameFile,
          defaultPath: path.join(app.getPath("home"), dt.nameFile),
        }).then((result) => {
          if (!result.canceled) {
            resolve(result.filePath);
          }
          else
            resolve(false);
        });
      });
    });

    this.handleMessages('Dialog--SelectFile', async (event, data) => {
      return new Promise(async (resolve) => {
        if (!Array.isArray(data.types)) data.types = [];
        dialog.showOpenDialog({
          title: TRANSLATOR.Get('.select_file'),
          properties: ['openFile'],
          filters: data.types.map(dt => ({ name: dt.nameFile, extensions: dt.ext })),
          defaultPath: path.join(app.getPath("home")),
        }).then((result) => {
          if (!result.canceled && result.filePaths.length > 0) {
            resolve(result.filePaths[0]);
          } else {
            resolve(false);
          }
        });
      });
    });

    this.handleMessages('Dialog--SaveFileToPath', async (event, dt) => {
      return new Promise(async (resolve) => {

        dialog.showSaveDialog({
          title: TRANSLATOR.Get('.save_file'),
          filters: [{ name: dt.nameFile, ext: dt.ext }],
          nameFieldLabel: dt.nameFile,
          defaultPath: path.join(app.getPath("home"), dt.nameFile),
        }).then((result) => {
          if (!result.canceled) {
            fs.writeFile(result.filePath + `.${dt.ext[0]}`, dt.data, (err, buf) => {
              resolve(result.filePath + `.${dt.ext[0]}`);
            });
          }
          else
            resolve(false);
        });
      });
    });

    this.handleMessages('ListWebDeckLocal', async (event, dt) => {
      return await this.ClientServiceUnderDeck.ListProgramsForLocal();
    });

    this.handleMessages('GET--UserData', async (event, dt) => {
      return await app.getPath('userData');
    });

    this.handleMessages('sync-user-data', async (event, dt) => {
      if (this.ClientUnderDeck.User && this.ClientUnderDeck.User.id) {
        return await this.ClientUnderDeck.CloudUploadData(await CloudService.GetDataToUpload(), (dataPercent) => {
          this.sendFrontData('sync-user-data-percent', dataPercent);
        });
      }
      else {
        return false;
      }
    });

    this.handleMessages('get-synchronized-data', async (event, dt) => {
      if (this.ClientUnderDeck.User && this.ClientUnderDeck.User.id) {
        return await this.ClientUnderDeck.GetSynchronizedData();
      }
      else {
        return false;
      }
    });

    this.handleMessages('relaunch-all-app', async (event, dt) => {
      app.relaunch();
      app.exit();
      return;
    });

    this.handleMessages('clear-synchronized-data', async (event, cloud_id) => {
      if (this.ClientUnderDeck.User && this.ClientUnderDeck.User.id) {
        return await this.ClientUnderDeck.ClearSynchronizedData();
      }
      else {
        return false;
      }
    });

    this.handleMessages('app-maxmize-force', async (event, dt) => {
      this.window.show();
      this.window.maximize();
    });

    this.handleMessages('app-minimize', async (event, dt) => {
      this.window.minimize();
    });

    this.handleMessages('app-maximize', (event, dt) => {
      if (this.window.isMaximized())
        this.window.unmaximize();
      else
        this.window.maximize();
    });

    this.handleMessages('app-close', async (event, dt) => {
      if (await DAO.DB.get('isMinimizeToBar') == true)
        this.window.hide();
      else
        this.CloseAllWindows();
    });

    this.handleMessages('get_version', (event, dt) => {
      return app.getVersion();
    });

    this.handleMessages('update_data_macros', async (event, dt) => {
      return this.macrosService.updateDataMacros();
    });

    this.handleMessages('get_combo_keys', async (event, dt) => {
      return this.macrosService.getComboKeys();
    });

    this.handleMessages('app_update_start_download', async (event, dt) => {
      return await autoUpdater.downloadUpdate();
    });

    this.handleMessages('check_app_update', async (event, dt) => {
      try {
        await autoUpdater.checkForUpdates();
      } catch (error) {
        console.log(error);
      }
      return app.getVersion();
    });

    this.handleMessages('Obs_wss_p', async (event, dt) => { return await this.ProcessObsEvents(dt); });

    this.handleMessages('Robotjs_keyTap', (event, data) => {
      try {
        if (data.key) {
          if (data.modifier) return robotjs.keyTap(data.key, data.modifier);
          return robotjs.keyTap(data.key);
        }
        return false;
      } catch (error) {
        return false;
      }
    });

    ObsService.Disconnected((res) => {
      if (ObsService.IsConnected == true) {
        this.Notification(null, TRANSLATOR.Get('.obswssdesconnectdromdss'), (e) => {
          this.window.show();
          this.window.maximize();
          this.sendFrontData('selectMenu', 'obs-studio');
        });
        ObsService.IsConnected = false;
        this.sendFrontData('Obs_wss', { is_obs_wss_p: true, desconnected: true, code: res.code, res: res });
        if (DAO.OBS.get('ObsWssStartOnApp') == true && this.countsObsTryConect < 10) {
          setTimeout(() => {
            this.countsObsTryConect++;
            Start_obs_wss(this);
          }, 5000);
        }
      }
    });

  }

  startAllServices() {
    ///////   Updater   ///////

    autoUpdater.on("update-available", (info) => {
      this.sendFrontData("AutoUpdater", {
        info: info,
        version: app.getVersion(),
        code: 1,
        msg: TRANSLATOR.Get('.newAppUpdate')
      });

      this.Notification(
        TRANSLATOR.Get('.app_update_text'),
        TRANSLATOR.Get('.newAppUpdate')
      );

    });

    let onNotifyWinDownloadUpdate = true;
    autoUpdater.on('download-progress', (info) => {

      this.sendFrontData("AutoUpdater", {
        info: info,
        version: app.getVersion(),
        code: 2,
        msg: TRANSLATOR.Get('.update_in_download_progress')
      });

      if (onNotifyWinDownloadUpdate == true) {
        onNotifyWinDownloadUpdate = false;

        this.Notification(
          TRANSLATOR.Get('.app_update_text'),
          TRANSLATOR.Get('.update_in_download_progress')
        );
      }

    });

    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {

      if (DAO.DB.get('AutoUpdateApp') == true) {
        this.Notification(
          TRANSLATOR.Get('.app_update_text'),
          TRANSLATOR.Get('.updateds')
        );

        this.sendFrontData("AutoUpdater", {
          event: event,
          releaseNotes: releaseNotes,
          releaseName: releaseName,
          version: app.getVersion(),
          code: 3,
          msg: TRANSLATOR.Get('.updateds')
        });

        setTimeout(() => {
          this.macrosService.stop();
          autoUpdater.quitAndInstall(false, true);
          this.CloseAllWindows();
        }, 5000);
      }
      else {
        this.sendFrontData("AutoUpdater", {
          event: event,
          releaseNotes: releaseNotes,
          releaseName: releaseName,
          version: app.getVersion(),
          code: 3,
          msg: TRANSLATOR.Get('.download_update_finish_text'),
        });

        const dialogOpts = {
          type: 'info',
          buttons: [TRANSLATOR.Get('.update_later'), TRANSLATOR.Get('.update_and_restart')],
          title: TRANSLATOR.Get('.application_update'),
          message: process.platform === 'win32' ? releaseNotes : releaseName,
          detail: TRANSLATOR.Get('.newversionhasbeendownloaded_msg')
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
          if (returnValue.response == 1) {
            this.macrosService.stop();
            autoUpdater.quitAndInstall(false, true);
            this.CloseAllWindows();
          }
          else {
            this.sendFrontData("AutoUpdater", {
              event: event,
              releaseNotes: releaseNotes,
              releaseName: releaseName,
              version: app.getVersion(),
              code: 4,
              msg: TRANSLATOR.Get('.the_application_will_be_updated_when_the_application_was_closed'),
            });
          }
        });
      }

    });

    autoUpdater.on("update-not-available", (info) => { ///Not update

      this.sendFrontData("AutoUpdater", {
        info: info,
        version: app.getVersion(),
        code: 0,
        msg: `${TRANSLATOR.Get('.taiaitlastv')}: ${app.getVersion()}!`
      });

    });

    autoUpdater.on("error", async info => { ///Error

      if (info.toString().includes('net::ERR_NAME_NOT_RESOLVED')) {
        this.sendFrontData("AutoUpdater", {
          info: info,
          version: app.getVersion(),
          code: -2,
          msg: TRANSLATOR.Get('.erronetupdatetheapp')
        });
      }
      else {
        this.sendFrontData("AutoUpdater", {
          info: info,
          version: app.getVersion(),
          code: -1,
          msg: TRANSLATOR.Get('.erroupdatetheapp')
        });
      }

    });

    ///////   Updater   ///////
  }

  ProcessObsEvents(dt) {
    if (dt.stage == 'is_started') {
      return ObsService.IsConnected;
    }
    else if (dt.stage == 'Status') {
      this.sendFrontData('Obs_wss', {
        is_obs_wss_p: true,
        stage: 'Status',
        connected: ObsService.IsConnected,
        notify: dt.notify,
        code: null,
        res: null
      });
    }
    else if (dt.stage == 'Disconnect') {
      if (ObsService.IsConnected == true) {
        this.countsObsTryConect = 20;
        ObsService.Disconnect();
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          connected: ObsService.IsConnected,
          notify: dt.notify,
          code: null,
          res: null
        });
      }
    }
    else if (dt.stage == 'Connect') {
      if (ObsService.IsConnected == false) {
        this.countsObsTryConect = 0;
        Start_obs_wss(this);
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'select_scene') {
      if (ObsService.IsConnected == true) {
        ObsService.SelectScene(dt.sceneName).then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            connected: ObsService.IsConnected,
            notify: false,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'MuteInputAudio') {
      if (ObsService.IsConnected == true) {
        ObsService.MuteInput(dt.inputUuid, dt.inputMuted).then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'StartStream') {
      if (ObsService.IsConnected == true) {
        ObsService.StartStream().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'StopStream') {
      if (ObsService.IsConnected == true) {
        ObsService.StopStream().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'ToggleStream') {
      if (ObsService.IsConnected == true) {
        ObsService.ToggleStream().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'StartRecord') {
      if (ObsService.IsConnected == true) {
        ObsService.StartRecord().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'StopRecord') {
      if (ObsService.IsConnected == true) {
        ObsService.StopRecord().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'ToggleRecordPause') {
      if (ObsService.IsConnected == true) {
        ObsService.ToggleRecordPause().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'PauseRecord') {
      if (ObsService.IsConnected == true) {
        ObsService.PauseRecord().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'ResumeRecord') {
      if (ObsService.IsConnected == true) {
        ObsService.ResumeRecord().then(res => {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: res
          });
        })
          .catch(err => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              is_erro: true,
              err: err,
              code: err.code
            });
          })
      }
      else {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: dt.stage,
          notify: dt.notify,
          connected: ObsService.IsConnected,
          res: null
        });
      }
    }
    else if (dt.stage == 'get_information_obs') {
      return new Promise(async resolve => {
        if (ObsService.IsConnected == true) {
          var DTORTO = {
            is_obs_wss_p: true,
            connected: ObsService.IsConnected,
            stage: dt.stage,
            notify: dt.notify,
            response: {
              is_erro: false,
              code: null,
              err: null
            },
            data: {
              scenes: null,
              audios: null
            }
          };
          ObsService.ListAllScenes().then(listScenes => {
            DTORTO.data.scenes = listScenes;
            ObsService.GetInputList().then(listInputs => {
              DTORTO.data.audios = listInputs;
              resolve(DTORTO);
            })
              .catch(err => {
                DTORTO.is_erro = true;
                DTORTO.err = err;
                DTORTO.code = err.code;
                resolve(DTORTO);
              });
          })
            .catch(err => {
              DTORTO.is_erro = true;
              DTORTO.err = err;
              DTORTO.code = err.code;
              resolve(DTORTO);
            })
        }
        else {
          resolve({
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: ObsService.IsConnected,
            res: null
          });
        }
      });
    }
  }

  startServices() {
    if (DAO.OBS.get('ObsWssStartOnApp') == true) {
      Start_obs_wss(this);
    }
    this.macrosService.callBack((data) => {
      try {
        this.ClientServiceUnderDeck.ExecMacro(data.macro);
      } catch (error) {
        console.log(error);
      }
    });
    this.macrosService.setCallBackOverlay(() => {
      this.overlayScreen.toggle();
    });
    this.macrosService.updateDataMacros();
    if (DAO.DB.get('isStartLocalServer') == true) {
      this.localServer.start();
    }
  }
}

function Start_obs_wss(screen) {
  if (ObsService.IsConnected != true) {
    var Ip_OBS = DAO.OBS.get('Ip_wss_obs');
    var Port_OBS = DAO.OBS.get('Port_wss_obs');
    var Pass_OBS = DAO.OBS.get('Pass_wss_obs');
    if (Ip_OBS != null && Port_OBS != null) {
      ObsService.Connect(Ip_OBS, Port_OBS, Pass_OBS).then(async (res) => {
        ObsService.IsConnected = true;
        screen.Notification(null, TRANSLATOR.Get('.obswssconneted'), (e) => {
          screen.window.show();
          screen.window.maximize();
          screen.sendFrontData('selectMenu', 'obs-studio');
        });
        screen.sendFrontData('Obs_wss', { connected_sucess: true, connected: true, res: res });
      })
        .catch((err) => {
          console.log(err);
          ObsService.IsConnected = false;
          screen.sendFrontData('Obs_wss', { is_erro: true, err_connection: true, err: err, code: err.code });
        });
    }
    else {
      screen.sendFrontData('Obs_wss', { is_invalid: true, err: null, code: null });
    }
  }
}

module.exports = MainScreen;