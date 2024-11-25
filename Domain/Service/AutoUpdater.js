const { app, Notification, dialog } = require('electron');
const { autoUpdater, AppUpdater } = require("electron-updater");
const Screen_update = require("../Screens/Updater/mainScreen.js");
const translator = require("../Comun/Translator_app.js");
const path = require('path');
var DAO = require("../../Repository/DB.js");
var one_notify = false;

var Window_update;

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
//

const CreateWindow = (appIcon)=>{
    Window_update = new Screen_update(appIcon);
    Window_update.window.once("ready-to-show", () => {
        CheckUpdate();
    });
}

const CheckUpdate = async () =>{
    autoUpdater.checkForUpdates();
}

const Update_available = ()=>{
    autoUpdater.on("update-available", (info) => {
        Window_update.sendDataView("dataView", {
            version: app.getVersion(),
            status: 1,
            msg: translator.getNameTd('.auiapwftdtc')
        });

        if(DAO.DB.get('App_notification_windows') == true){
            new Notification({
                body: translator.getNameTd('.auiapwftdtc'),
                icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico')
            }).show();
        }

        let pth = autoUpdater.downloadUpdate();
    });
}

autoUpdater.on('download-progress', (info) =>{
    if(one_notify == false){
        one_notify = true;
        Window_update.sendDataView("dataView", {
            version: app.getVersion(),
            status: 1,
            msg: translator.getNameTd('.update_in_download_progress')
        });
    
        if(DAO.DB.get('App_notification_windows') == true){
            new Notification({
                body: translator.getNameTd('.update_in_download_progress'),
                icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico')
            }).show();
        }
    }
});

const Update_not_available = (callback)=>{
    autoUpdater.on("update-not-available", (info) => {
        Window_update.sendDataView("dataView", {
            version: app.getVersion(),
            status: 2,
            msg: `${translator.getNameTd('.taiaitlastv')}: ${app.getVersion()}!`
        });

        setTimeout(()=>{
            callback();
            try {
                Window_update.close();
            } catch (error) { }
        }, 5000);
    });
}

const Update_downloaded = (callback)=>{
    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
        if(DAO.DB.get('App_notification_windows') == true){
            new Notification({
                body: translator.getNameTd('.updateds'),
                icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico')
            }).show();
        }

        if(DAO.DB.get('AutoUpdateApp') == true){
            Window_update.sendDataView("dataView", {
                version: app.getVersion(),
                status: 3,
                msg: translator.getNameTd('.updateds')
            });

            setTimeout(()=>{
                try {
                    Window_update.close();
                    autoUpdater.quitAndInstall(false, true);
                } catch (error) {
                    callback();
                }
            }, 5000);
        }
        else{
            const dialogOpts = {
                type: 'info',
                buttons: [translator.getNameTd('.update_later'), translator.getNameTd('.update_and_restart')],
                title: translator.getNameTd('.application_update'),
                message: process.platform === 'win32' ? releaseNotes : releaseName,
                detail: translator.getNameTd('.newversionhasbeendownloaded_msg')
            };
            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response == 1)
                    autoUpdater.quitAndInstall(false, true)
                else
                    callback();
            });
        }
        
    });
}

const Error = (callback)=>{
    autoUpdater.on("error", (info) => {
        Window_update.sendDataView("dataView", {
            version: app.getVersion(),
            status: 0,
            msg: translator.getNameTd('.erroupdatetheapp')
        });
        
        setTimeout(()=>{
            callback();
            try {
                Window_update.close();
            } catch (error) {  }
        }, 10000);
    });
}

module.exports = {
    CreateWindow,
    CheckUpdate,
    Update_available,
    Update_not_available,
    Update_downloaded,
    Error,
}