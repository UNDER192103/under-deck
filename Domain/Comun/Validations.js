const { exec } = require('child_process');
const { app } = require('electron');
var DAO = require("../../Repository/DB.js");

const DB_default_values = async (callback) => {
    await DAO.DB.set('ShowMainScreen', null);
    await DAO.DB.set("select_folder", null);
    await DAO.DB.set("select_file", null);

    if(await DAO.DB.get('isFirstStart') == null)
        await DAO.DB.set('isFirstStart', true);
    
    if(await DAO.DB.get('isNotValidFirstSearchUpdateApp') == null)
        await DAO.DB.set('isNotValidFirstSearchUpdateApp', true);

    if(await DAO.DB.get('isNotValidFirstSearchUpdateApp') != false)
        await DAO.DB.set('first_search_update_app', true);

    if(DAO.DB.get('server_port') == null)
        await DAO.DB.set('server_port', 3000);

    if(DAO.DB.get('isEnableAnimations') == null)
        await DAO.DB.set('isEnableAnimations', true);

    if(DAO.DB.get('animation') == null)
        await DAO.DB.set('animation', 'random');

    if(DAO.DB.get('modelAnimation') == null)
        await DAO.DB.set('modelAnimation', 'random');

    if(DAO.DB.get('bd_theme') == null)
        await DAO.DB.set('bd_theme', 'light');

    if(DAO.DB.get('keyEvent') == null)
        await DAO.DB.set('keyEvent', true);
    
    if(DAO.OBS.get('ObsWssStartOnApp') == null)
        await DAO.OBS.set('ObsWssStartOnApp', false);

    if(DAO.OBS.get('AutoUpdateApp') == null)
        await DAO.OBS.set('AutoUpdateApp', false);
    
    if(DAO.DB.get('App_notification_windows') == null)
        await DAO.DB.set('App_notification_windows', true);

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