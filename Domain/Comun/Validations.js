const { exec } = require('child_process');
const { app } = require('electron');
var DAO = require("../../Repository/DB.js");

const DB_default_values = async (callback) => {
    await DAO.DB.set('ShowMainScreen', null);
    await DAO.DB.set("select_folder", null);
    await DAO.DB.set("select_file", null);

    if(DAO.DB.get('server_port') == null)
        DAO.DB.set('server_port', 3000);

    if(DAO.DB.get('bd_theme') == null)
        DAO.DB.set('bd_theme', 'light');

    if(DAO.DB.get('keyEvent') == null)
        await DAO.DB.set('keyEvent', true);
    
    if(DAO.OBS.get('ObsWssStartOnApp') == null)
        await DAO.OBS.set('ObsWssStartOnApp', false);

    if(DAO.OBS.get('AutoUpdateApp') == null)
        await DAO.OBS.set('AutoUpdateApp', false);
    
    if(DAO.DB.get('App_notification_windows') == null)
        DAO.DB.set('App_notification_windows', true);
    callback();
}

function killProcessWinpy(callback) {
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
      if(callback != null)
        callback();
    })
}

async function CheckIsAppRunning(callback) {
    try {
        const isRunning = app.requestSingleInstanceLock()
        if(isRunning){
            callback();
        }
        else {
            await DAO.DB.set('ShowMainScreen', true);
            app.quit();
        }
    } catch (error) {
        callback();
    }
}

module.exports = {
    CheckIsAppRunning,
    DB_default_values,
    killProcessWinpy,
}