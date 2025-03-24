const path = require('path');
const fs = require("fs");
const { app } = require('electron');
const _MAIN_DIR = __dirname.split('Repository')[0];
const packageJson = require(_MAIN_DIR + "/package.json");
const Jsoning = require("jsoning");
const dir_appdata_un_data = path.join(path.join(process.env.APPDATA, packageJson.productName), 'UN-DATA');
var _all = require(_MAIN_DIR + 'Domain/Model/DB_model.js');

class DBCLASS {
    constructor() {
        Object.keys(_all).forEach(key => {
            this[key] = _all[key];
        });

        this.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
        this.DISCORD = new Jsoning(dir_appdata_un_data + "/DB/DISCORD.json");
        this.OBS = new Jsoning(dir_appdata_un_data + "/DB/OBS.json");
        this.WEBDECK = new Jsoning(dir_appdata_un_data + "/DB/WEBDECK.json");
        this.THEMES = new Jsoning(dir_appdata_un_data + "/DB/THEMES.json");
        this.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
        this.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
        this.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
        this.DB_DIR = path.join(process.env.APPDATA, packageJson.productName);
        this.THEME_DIR = path.join(process.env.APPDATA, packageJson.productName, 'UN-DATA', 'themes');
    }

    async GetDataNow() {
        this.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
        this.DISCORD = new Jsoning(dir_appdata_un_data + "/DB/DISCORD.json");
        this.OBS = new Jsoning(dir_appdata_un_data + "/DB/OBS.json");
        this.WEBDECK = new Jsoning(dir_appdata_un_data + "/DB/WEBDECK.json");
        this.THEMES = new Jsoning(dir_appdata_un_data + "/DB/THEMES.json");
        this.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
        this.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
        this.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
        this.List_programs = await this.ProgramsExe.get('list_programs');
        this.Macro_lis = await this.List_macros.get('macros');
        this.USER = this.DB.get('user');
        this.PC = this.DB.get('user_pc');
        let themesLocal = await this.THEMES.get('local');
        let themesRemote = await this.THEMES.get('remote');
        this.ThemesData.list = themesLocal.concat(themesRemote);
        return this;
    }
}

module.exports = new DBCLASS();