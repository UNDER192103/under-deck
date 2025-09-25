const { app } = require('electron');
const path = require('path');
const fs = require("fs");
const PathAppData = app.getPath('userData');
const BasePathAppData = path.join(PathAppData, 'UN-DATA');
const CheckAppDependencies = require('./AppDependencies.js');
var LD_appdata = [ BasePathAppData, path.join(BasePathAppData, 'DB'), path.join(BasePathAppData, 'icons-exe'), path.join(BasePathAppData, 'icons-webpages'), path.join(BasePathAppData, 'Themes'), path.join(BasePathAppData, 'Languages'), path.join(BasePathAppData, 'Plugins') ];
var LD_appdata_db = [ path.join(BasePathAppData, 'DB', 'DB.json'), path.join(BasePathAppData, 'DB', 'DBUSER.json'), path.join(BasePathAppData, 'DB', 'OBS.json'), path.join(BasePathAppData, 'DB', 'CLOUD.json'), path.join(BasePathAppData, 'DB', 'DISCORD.json'), path.join(BasePathAppData, 'DB', 'WEBDECK.json'), path.join(BasePathAppData, 'DB', 'THEMES.json'), path.join(BasePathAppData, 'DB', 'Opens_windows.json'), path.join(BasePathAppData, 'DB', 'Macros.json'), path.join(BasePathAppData, 'DB', 'ProgramsExe.json') ];

const CheckFoldersUNDB = async () => {
    return new Promise(async (resolve) => {
        for (let index = 0; index < LD_appdata.length; index++) {
            if (!await fs.existsSync(LD_appdata[index])) {
                await fs.mkdirSync(LD_appdata[index]);
            }
        }
        resolve();
    });
}

const CheckFIlesUNDB = async () => {
    return new Promise(async (resolve) => {
        for (let index = 0; index < LD_appdata_db.length; index++) {
            if (!await fs.existsSync(LD_appdata_db[index])) await fs.writeFileSync(LD_appdata_db[index], "{}");
        }
        resolve();
    });
}

const CheckEssentialFiles = async () => {
    return new Promise(async (resolve) => {
        await CheckAppDependencies();
        await CheckFoldersUNDB();
        await CheckFIlesUNDB();
        resolve();
    });
}


module.exports = {
    CheckEssentialFiles
}