const { exec } = require('child_process');
const { app } = require('electron');
var DAO = require("../../Repository/DB.js");

const DB_default_values = async (callback) => {
    await DAO.DB.set('ShowMainScreen', null);
    await DAO.DB.set("select_folder", null);
    await DAO.DB.set("select_file", null);

    if (await DAO.DB.get('isFirstStart') == null)
        await DAO.DB.set('isFirstStart', true);

    if (await DAO.DB.get('isNotValidFirstSearchUpdateApp') == null)
        await DAO.DB.set('isNotValidFirstSearchUpdateApp', true);

    if (await DAO.DB.get('isNotValidFirstSearchUpdateApp') != false)
        await DAO.DB.set('first_search_update_app', true);

    if (await DAO.DB.get('server_port') == null)
        await DAO.DB.set('server_port', 3000);

    if (await DAO.DB.get('isEnableAnimations') == null)
        await DAO.DB.set('isEnableAnimations', true);

    if (await DAO.DB.get('animation') == null)
        await DAO.DB.set('animation', 'random');

    if (await DAO.DB.get('modelAnimation') == null)
        await DAO.DB.set('modelAnimation', 'random');

    if (await DAO.DB.get('bd_theme') == null)
        await DAO.DB.set('bd_theme', 'light');

    if (await DAO.DB.get('keyEvent') == null)
        await DAO.DB.set('keyEvent', true);

    if (await DAO.OBS.get('ObsWssStartOnApp') == null)
        await DAO.OBS.set('ObsWssStartOnApp', false);

    if (await DAO.OBS.get('AutoUpdateApp') == null)
        await DAO.OBS.set('AutoUpdateApp', false);

    if (await DAO.DB.get('App_notification_windows') == null)
        await DAO.DB.set('App_notification_windows', true);

    if (await DAO.DB.get('exe-background') == null)
        await DAO.DB.set('exe-background', '#370179');

    if (await DAO.DB.get('exe-color-text') == null)
        await DAO.DB.set('exe-color-text', 'white');

    if (await DAO.DB.get('isEnableAnimationsHover') == null)
        await DAO.DB.set('isEnableAnimationsHover', true);

    if (await DAO.DB.get('isMinimizeToBar') == null)
        await DAO.DB.set('isMinimizeToBar', true);

    if (await DAO.THEMES.get('local') == null)
        await DAO.THEMES.set('local', []);

    if (await DAO.THEMES.get('remote') == null)
        await DAO.THEMES.set('remote', []);

    callback();
}

function killProcessWinpy(callback) {
    exec(`taskkill /IM winpy.exe /F`, (err, exit, stErr) => {
        if (callback != null)
            callback();
    })
}

async function CheckIsAppRunning(callback) {
    try {
        const isRunning = app.requestSingleInstanceLock()
        if (isRunning) {
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