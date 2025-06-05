const { app, BrowserWindow, Notification, Menu, dialog, MenuItem, Tray, ipcMain, ipcRenderer, globalShortcut } = require("electron");
const { exec } = require('child_process');
const path = require('path');
const fs = require("fs");
const translator = require(path.join(app.getAppPath(), 'Domain', 'Comun', 'Translator_app.js'));
var DAO = require(path.join(app.getAppPath(), 'Repository', 'DB.js'));
const { autoUpdater, AppUpdater } = require("electron-updater");
const ObsService = require("../../Service/Obs");
const CloudService = require("../../Service/Cloud");
const ShortcutKeys = require("../../Service/ShortcutKeys");
const PACKGEJSON = require("../../../package.json");
const macrosService = new ShortcutKeys();

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

class MainScreen {
  window;
  appIcon;
  contextMenu;
  ObsWebSocketStarted = false;

  position = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    maximized: false,
  };

  constructor(appIcon) {
    this.appIcon = appIcon;
    this.window = new BrowserWindow({
      title: app.getName(),
      frame: false,
      autoHideMenuBar: true,
      width: this.position.width,
      height: this.position.height,
      minWidth: this.position.minWidth,
      minHeight: this.position.minHeight,
      autoHideMenuBar: true,
      icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, "./preload.js"),
        devTools: PACKGEJSON.status == 'dev' ? true : false,
      },
    });

    this.startAllHandleMessages();
    this.startAllServices();

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
          { label: 'Reload Window', click() { this.window.show(); this.window.reload(); } },
          { label: 'Relaunch App', click() { app.relaunch(); app.exit(); } },
          { label: 'Quit', click() { this.killProcessWinpy(async () => { await app.quit(); process.exit(); }) } },
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
        icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      }).on('click', (e) => {
        if (onClickMenu) onClickMenu(e);
      }).show();
    }
  }

  killProcessWinpy(callback) {
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
      if (callback != null)
        callback();
    })
  }

  setContextMenu(window) {
    window.contextMenu = Menu.buildFromTemplate([
      {
        label: app.getName(), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'app-main');
          window.window.show();
          window.window.maximize();
        }
      },
      { type: 'separator' },
      {
        label: translator.getNameTd('.apps_name'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'app-main');
          window.window.show();
          window.window.maximize();
        }
      },
      {
        label: translator.getNameTd('.keys_macro_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'keys-macros');
          window.window.show();
          window.window.maximize();
        }
      },
      {
        label: translator.getNameTd('.web_pages_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'web-pages');
          window.window.show();
          window.window.maximize();
        }
      },
      {
        label: translator.getNameTd('.obs_studio_n_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'obs-studio');
          window.window.show();
          window.window.maximize();
        }
      },
      {
        label: translator.getNameTd('.settings_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'config');
          window.window.show();
          window.window.maximize();
        }
      },
      {
        label: translator.getNameTd('.help_text'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'help');
          window.window.show();
          window.window.maximize();
        }
      },
      { type: 'separator' },
      {
        label: translator.getNameTd('.relaunch_app'), type: 'normal', click: () => {
          app.relaunch();
          app.exit();
        }
      },
      {
        label: translator.getNameTd('.reload_window'), type: 'normal', click: () => {
          window.window.show();
          window.window.maximize();
          window.window.reload();
        }
      },
      {
        label: translator.getNameTd('.quit'), type: 'normal', click: async () => {
          killProcessWinpy(async () => {
            await app.quit();
            process.exit();
          });
        }
      }
    ]);

    window.appIcon.setToolTip(app.getName());
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
    ipcMain.handle(type, callback);
  }

  startAllHandleMessages() {
    this.handleMessages('Dialog--SaveFileToPath', async (event, dt) => {
      return new Promise(async (resolve) => {

        dialog.showSaveDialog({
          title: translator.getNameTd('.save_file'),
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

    this.handleMessages('GET--UserData', async (event, dt) => {
      return await app.getPath('userData');
    });

    this.handleMessages('sync-user-data', async (event, dt) => {
      let USER = await DAO.DBUSER.get('user');
      if (USER && USER.client_id) {
        return await CloudService.SyncUserData(USER, await DAO.DB.get('lang_selected'));
      }
      else {
        return false;
      }
    });

    this.handleMessages('get-synchronized-data', async (event, dt) => {
      let USER = await DAO.DBUSER.get('user');
      if (USER && USER.client_id) {
        return await CloudService.GETSynchronizedData(USER, await DAO.DB.get('lang_selected'));
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
      let USER = await DAO.DBUSER.get('user');
      if (USER && USER.client_id) {
        return await CloudService.ClearCloudSynchronized(USER, await DAO.DB.get('lang_selected'), cloud_id);
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
        this.window.close();
    });

    this.handleMessages('get_version', (event, dt) => {
      return app.getVersion();
    });

    this.handleMessages('update_data_macros', async (event, dt) => {
      return macrosService.updateDataMacros();
    });

    this.handleMessages('get_combo_keys', async (event, dt) => {
      return macrosService.getComboKeys();
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

    this.handleMessages('Obs_wss_p', (event, dt) => {
      if (dt.stage == 'is_started') {
        return this.ObsWebSocketStarted;
      }
      else if (dt.stage == 'Status') {
        this.sendFrontData('Obs_wss', {
          is_obs_wss_p: true,
          stage: 'Status',
          connected: this.ObsWebSocketStarted,
          notify: dt.notify,
          code: null,
          res: null
        });
      }
      else if (dt.stage == 'Disconnect') {
        if (this.ObsWebSocketStarted == true)
          ObsService.Disconnect();
        else {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            connected: this.ObsWebSocketStarted,
            notify: dt.notify,
            code: null,
            res: null
          });
        }
      }
      else if (dt.stage == 'Connect') {
        if (this.ObsWebSocketStarted == false)
          Start_obs_wss(this);
        else {
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'select_scene') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.SelectScene(dt.sceneName).then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'MuteInputAudio') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.MuteInput(dt.inputUuid, dt.inputMuted).then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'StartStream') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.StartStream().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'StopStream') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.StopStream().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'ToggleStream') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.ToggleStream().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'StartRecord') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.StartRecord().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'StopRecord') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.StopRecord().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'ToggleRecordPause') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.ToggleRecordPause().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'PauseRecord') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.PauseRecord().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'ResumeRecord') {
        if (this.ObsWebSocketStarted == true) {
          ObsService.ResumeRecord().then(res => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
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
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if (dt.stage == 'get_information_obs') {
        return new Promise(async resolve => {
          if (this.ObsWebSocketStarted == true) {
            var DTORTO = {
              is_obs_wss_p: true,
              connected: this.ObsWebSocketStarted,
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
              connected: this.ObsWebSocketStarted,
              res: null
            });
          }
        });
      }
    });

    ObsService.Disconnected((res) => {
      if (this.ObsWebSocketStarted == true) {
        this.Notification(null, translator.getNameTd('.obswssdesconnectdromdss'), (e) => {
          this.window.show();
          this.window.maximize();
          this.sendFrontData('selectMenu', 'obs-studio');
        });
        this.ObsWebSocketStarted = false;
        this.sendFrontData('Obs_wss', { is_obs_wss_p: true, desconnected: true, code: res.code, res: res });
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
        msg: translator.getNameTd('.newAppUpdate')
      });

      this.Notification(
        translator.getNameTd('.app_update_text'),
        translator.getNameTd('.newAppUpdate')
      );

    });

    let onNotifyWinDownloadUpdate = true;
    autoUpdater.on('download-progress', (info) => { ///Donloading Update

      this.sendFrontData("AutoUpdater", {
        info: info,
        version: app.getVersion(),
        code: 2,
        msg: translator.getNameTd('.update_in_download_progress')
      });

      if (onNotifyWinDownloadUpdate == true) {
        onNotifyWinDownloadUpdate = false;

        this.Notification(
          translator.getNameTd('.app_update_text'),
          translator.getNameTd('.update_in_download_progress')
        );
      }

    });

    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => { ///Has ben downloaded Update

      if (DAO.DB.get('AutoUpdateApp') == true) {
        this.Notification(
          translator.getNameTd('.app_update_text'),
          translator.getNameTd('.updateds')
        );

        this.sendFrontData("AutoUpdater", {
          event: event,
          releaseNotes: releaseNotes,
          releaseName: releaseName,
          version: app.getVersion(),
          code: 3,
          msg: translator.getNameTd('.updateds')
        });

        setTimeout(() => {
          macrosService.stop();
          autoUpdater.quitAndInstall(false, true);
        }, 5000);
      }
      else {
        this.sendFrontData("AutoUpdater", {
          event: event,
          releaseNotes: releaseNotes,
          releaseName: releaseName,
          version: app.getVersion(),
          code: 3,
          msg: translator.getNameTd('.download_update_finish_text'),
        });

        const dialogOpts = {
          type: 'info',
          buttons: [translator.getNameTd('.update_later'), translator.getNameTd('.update_and_restart')],
          title: translator.getNameTd('.application_update'),
          message: process.platform === 'win32' ? releaseNotes : releaseName,
          detail: translator.getNameTd('.newversionhasbeendownloaded_msg')
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
          if (returnValue.response == 1) {
            macrosService.stop();
            autoUpdater.quitAndInstall(false, true);
          }
          else {
            this.sendFrontData("AutoUpdater", {
              event: event,
              releaseNotes: releaseNotes,
              releaseName: releaseName,
              version: app.getVersion(),
              code: 4,
              msg: translator.getNameTd('.the_application_will_be_updated_when_the_application_was_closed'),
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
        msg: `${translator.getNameTd('.taiaitlastv')}: ${app.getVersion()}!`
      });

    });

    autoUpdater.on("error", async info => { ///Error

      if (info.toString().includes('net::ERR_NAME_NOT_RESOLVED')) {
        this.sendFrontData("AutoUpdater", {
          info: info,
          version: app.getVersion(),
          code: -2,
          msg: translator.getNameTd('.erronetupdatetheapp')
        });
      }
      else {
        this.sendFrontData("AutoUpdater", {
          info: info,
          version: app.getVersion(),
          code: -1,
          msg: translator.getNameTd('.erroupdatetheapp')
        });
      }

    });

    ///////   Updater   ///////
  }

  startServices() {
    if (DAO.OBS.get('ObsWssStartOnApp') == true) {
      Start_obs_wss(this);
    }
    macrosService.callBack((data) => {
      try {
        this.sendFrontData("ExecMacro", data);
      } catch (error) {
        console.log(error);
      }
    });
    macrosService.updateDataMacros();
  }
}

function Start_obs_wss(screen) {
  if (screen.ObsWebSocketStarted != true) {
    var Ip_OBS = DAO.OBS.get('Ip_wss_obs');
    var Port_OBS = DAO.OBS.get('Port_wss_obs');
    var Pass_OBS = DAO.OBS.get('Pass_wss_obs');
    if (Ip_OBS != null && Port_OBS != null) {
      ObsService.Connect(Ip_OBS, Port_OBS, Pass_OBS).then(async (res) => {
        screen.ObsWebSocketStarted = true;
        screen.Notification(null, translator.getNameTd('.obswssconneted'), (e) => {
          screen.window.show();
          screen.window.maximize();
          screen.sendFrontData('selectMenu', 'obs-studio');
        });

        screen.sendFrontData('Obs_wss', { connected_sucess: true, connected: true, res: res });
      })
        .catch((err) => {
          screen.ObsWebSocketStarted = false;
          screen.sendFrontData('Obs_wss', { is_erro: true, err_connection: true, err: err, code: err.code });
        });
    }
    else {
      screen.sendFrontData('Obs_wss', { is_invalid: true, err: null, code: null });
    }
  }
}

function killProcessWinpy(callback) {
  macrosService.stop();
  exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
    if (callback != null)
      callback();
  })
}

module.exports = MainScreen;
