const { app, BrowserWindow, Notification, Menu, MenuItem, Tray, ipcMain, ipcRenderer, globalShortcut } = require("electron");
const { exec } = require('child_process');
const path = require("path");
const translator = require(path.join(app.getAppPath(), 'Domain', 'Comun', 'Translator_app.js'));
var DAO = require(path.join(app.getAppPath(), 'Repository', 'DB.js'));
const ObsService = require("../../Service/Obs");

class MainScreen {
  window;
  appIcon;
  contextMenu;
  ObsWebSocketStarted = false;

  position = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    maximized: false,
  };

  constructor() {
    this.window = new BrowserWindow({
      title: app.getName(),
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
        devTools: false
      },
    });

    this.startAllHandleMessages();

    this.window.once("ready-to-show", () => {
      setTimeout(()=>{ this.startServices(); }, 2500);
    });
  
    this.appIcon = new Tray(path.join(app.getAppPath(), '/Domain/src/img/under-icon-256x.ico'));
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

  Notification(title, body, onClickMenu) {
    if(DAO.DB.get('App_notification_windows') == true){
      new Notification({
        title: title,
        body: body,
        icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      }).on('click', (e)=>{
        if(onClickMenu) onClickMenu(e);
      }).show();
    }
  }

  killProcessWinpy(callback) {
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
      if(callback != null)
        callback();
    })
  }

  setContextMenu(window) {
    window.contextMenu = Menu.buildFromTemplate([
      { label: app.getName(), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'app-main');
        window.window.show();
        window.window.maximize();
        }
      },
      { type: 'separator' },
      { label: translator.getNameTd('.apps_name'), type: 'normal', click: () => {
          this.sendFrontData('selectMenu', 'app-main');
          window.window.show();
          window.window.maximize();
        }
      },
      { label: translator.getNameTd('.keys_macro_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'keys-macros');
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.web_pages_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'web-pages');
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.obs_studio_n_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'obs-studio');
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.settings_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'config');
        window.window.show();
        window.window.maximize();
        }
      },
      { label: translator.getNameTd('.help_text'), type: 'normal', click: () => {
        this.sendFrontData('selectMenu', 'help');
        window.window.show();
        window.window.maximize();
        }
      },
      { type: 'separator' },
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

  startAllHandleMessages(){

    this.handleMessages('Obs_wss_p', (event, dt)=>{
      if(dt.stage == 'is_started'){
        return this.ObsWebSocketStarted;
      }
      else if(dt.stage == 'Status'){
        this.sendFrontData('Obs_wss', {is_obs_wss_p: true,
          stage: 'Status',
          connected: this.ObsWebSocketStarted,
          notify: dt.notify,
          code: null,
          res: null
        });
      }
      else if(dt.stage == 'Disconnect'){
        if(this.ObsWebSocketStarted == true)
          ObsService.Disconnect();
        else{
          this.sendFrontData('Obs_wss', {is_obs_wss_p: true,
            stage: dt.stage,
            connected: this.ObsWebSocketStarted,
            notify: dt.notify,
            code: null,
            res: null
          });
        }
      }
      else if(dt.stage == 'Connect'){
        if(this.ObsWebSocketStarted == false)
          Start_obs_wss(this);
        else{
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if(dt.stage == 'list_all_scenes'){
        if(this.ObsWebSocketStarted == true){
          ObsService.ListAllScenes().then(list => {
            this.sendFrontData('Obs_wss', {
              is_obs_wss_p: true,
              stage: dt.stage,
              notify: dt.notify,
              connected: this.ObsWebSocketStarted,
              res: list
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
        else{
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if(dt.stage == 'select_scene'){
        if(this.ObsWebSocketStarted == true){
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
        else{
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if(dt.stage == 'StartStream'){
        if(this.ObsWebSocketStarted == true){
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
        else{
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
      else if(dt.stage == 'StopStream'){
        if(this.ObsWebSocketStarted == true){
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
        else{
          this.sendFrontData('Obs_wss', {
            is_obs_wss_p: true,
            stage: dt.stage,
            notify: dt.notify,
            connected: this.ObsWebSocketStarted,
            res: null
          });
        }
      }
    });

    ObsService.Disconnected((res)=>{
      if(this.ObsWebSocketStarted == true){
        this.Notification(null, translator.getNameTd('.obswssdesconnectdromdss'), (e)=>{
          this.window.show();
          this.window.maximize();
          this.sendFrontData('selectMenu', 'obs-studio');
        });
        this.ObsWebSocketStarted = false;
        this.sendFrontData('Obs_wss', {is_obs_wss_p: true, desconnected: true, code: res.code,res: res});
      }
    });

  }

  startServices(){
    if(DAO.OBS.get('ObsWssStartOnApp') == true)
      Start_obs_wss(this);
  }
}

function Start_obs_wss(screen) {
  if(screen.ObsWebSocketStarted != true){
    var Ip_OBS = DAO.OBS.get('Ip_wss_obs');
    var Port_OBS = DAO.OBS.get('Port_wss_obs');
    var Pass_OBS = DAO.OBS.get('Pass_wss_obs');
    if(Ip_OBS != null && Port_OBS != null){
      ObsService.Connect(Ip_OBS, Port_OBS, Pass_OBS).then((res)=>{
        screen.ObsWebSocketStarted = true;
        screen.Notification(null, translator.getNameTd('.obswssconneted'), (e)=>{
          screen.window.show();
          screen.window.maximize();
          screen.sendFrontData('selectMenu', 'obs-studio');
        });
        screen.sendFrontData('Obs_wss', {connected_sucess: true, connected: true, res: res});
      })
      .catch((err)=>{
        screen.ObsWebSocketStarted = false;
        screen.sendFrontData('Obs_wss', {is_erro: true, err_connection: true, err: err, code: err.code});
      });
    }
    else{
      screen.sendFrontData('Obs_wss', {is_invalid: true, err: null, code: null});
    }
  }
}

function killProcessWinpy(callback) {
  exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
    if(callback != null)
      callback();
  })
}

module.exports = MainScreen;
