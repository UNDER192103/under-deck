const CheckAppDependencies = require('./Domain/Comun/AppDependencies.js');
const { app } = require('electron');
const path = require('path');
const fs = require("fs");
const PathAppData = app.getPath('userData');
const BasePathAppData = path.join(PathAppData, 'UN-DATA');

var LD_appdata = [
    BasePathAppData,
    path.join(BasePathAppData, 'DB'),
    path.join(BasePathAppData, 'icons-exe'),
    path.join(BasePathAppData, 'icons-webpages'),
    path.join(BasePathAppData, 'themes'),
    path.join(BasePathAppData, 'Languages'),
];

var LD_appdata_db = [
    path.join(BasePathAppData, 'DB', 'DB.json'),
    path.join(BasePathAppData, 'DB', 'DBUSER.json'),
    path.join(BasePathAppData, 'DB', 'OBS.json'),
    path.join(BasePathAppData, 'DB', 'CLOUD.json'),
    path.join(BasePathAppData, 'DB', 'DISCORD.json'),
    path.join(BasePathAppData, 'DB', 'WEBDECK.json'),
    path.join(BasePathAppData, 'DB', 'THEMES.json'),
    path.join(BasePathAppData, 'DB', 'Opens_windows.json'),
    path.join(BasePathAppData, 'DB', 'Macros.json'),
    path.join(BasePathAppData, 'DB', 'ProgramsExe.json'),
];

const check_folders_data_UN = async (callback) => {
    for (let index = 0; index < LD_appdata.length; index++) {
        if (!await fs.existsSync(LD_appdata[index])) {
            await fs.mkdirSync(LD_appdata[index]);
        }
    }
    callback();
}

const check_folder_data_UN_DB = async (list, callback, count = 0) => {
    if (list[count] != null) {
        if (!await fs.existsSync(list[count])) {
            fs.writeFile(list[count], "{}", function (err) {
                if (err) {
                    //console.log(err);
                }

                return check_folder_data_UN_DB(list, callback, count + 1);
            });
        }
        else {
            check_folder_data_UN_DB(list, callback, count + 1)
        }
    }
    else {
        callback();
    }
}

app.whenReady().then(() => {
    CheckAppDependencies(() => {
        check_folders_data_UN(() => {
            check_folder_data_UN_DB(LD_appdata_db, () => {
                const Validations = require('./Domain/Comun/Validations.js');
                Validations.CheckIsAppRunning(() => {
                    require("./App/app.js");
                })
            });
        });
    });
});