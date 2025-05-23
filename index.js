const CheckAppDependencies = require('./Domain/Comun/AppDependencies.js');
const { app } = require('electron');
const path = require('path');
const fs = require("fs");
const BasePath = app.getPath('userData');
const BasePathData = path.join(BasePath, 'UN-DATA');
const BasePathDataDB = path.join(BasePathData, 'DB');
const BasePathDataIcons = path.join(BasePathData, 'icons-exe');
const BasePathDataIconsWebPages = path.join(BasePathData, 'icons-webpages');
const BasePathDataThemes = path.join(BasePathData, 'themes');

const check_folders_data_UN = async (callback) => {
    if (!await fs.existsSync(BasePath)) {
        await fs.mkdirSync(BasePath);
    }
    if (!await fs.existsSync(BasePathData)) {
        await fs.mkdirSync(BasePathData);
        await fs.mkdirSync(BasePathDataDB);
        await fs.mkdirSync(BasePathDataIcons);
        await fs.mkdirSync(BasePathDataIconsWebPages);
        await fs.mkdirSync(BasePathDataThemes);
    }
    else {
        if (!await fs.existsSync(BasePathDataDB)) {
            await fs.mkdirSync(BasePathDataDB);
        }
        if (!await fs.existsSync(BasePathDataIcons)) {
            await fs.mkdirSync(BasePathDataIcons);
        }
        if (!await fs.existsSync(BasePathDataIconsWebPages)) {
            await fs.mkdirSync(BasePathDataIconsWebPages);
        }
        if (!await fs.existsSync(BasePathDataThemes)) {
            await fs.mkdirSync(BasePathDataThemes);
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

var list_dirs = [
    BasePathDataDB + "\\DB.json",
    BasePathDataDB + "\\DBUSER.json",
    BasePathDataDB + "\\OBS.json",
    BasePathDataDB + "\\CLOUD.json",
    BasePathDataDB + "\\DISCORD.json",
    BasePathDataDB + "\\WEBDECK.json",
    BasePathDataDB + "\\THEMES.json",
    BasePathDataDB + "\\Opens_windows.json",
    BasePathDataDB + "\\Macros.json",
    BasePathDataDB + "\\ProgramsExe.json",
];

app.whenReady().then(() => {
    CheckAppDependencies(() => {
        check_folders_data_UN(() => {
            check_folder_data_UN_DB(list_dirs, () => {
                const Validations = require('./Domain/Comun/Validations.js');
                Validations.CheckIsAppRunning(() => {
                    require("./App/app.js");
                })
            });
        });
    });
});