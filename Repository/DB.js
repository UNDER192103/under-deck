const path = require('path');
const packageJson = require('../package.json');
const Jsoning = require("jsoning");
const DIRAPPDATUNDB = path.join(path.join(process.env.APPDATA, packageJson.productName), 'UN-DATA');
var _all = require('../Domain/Models/DB.js');

class DBCLASS {
    constructor() {
        Object.keys(_all).forEach(key => {
            this[key] = _all[key];
        });

        this.DB = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DB.json"));
        this.DBUSER = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DBUSER.json"));
        this.CLOUD = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "CLOUD.json"));
        this.DISCORD = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DISCORD.json"));
        this.OBS = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "OBS.json"));
        this.WEBDECK = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "WEBDECK.json"));
        this.THEMES = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "THEMES.json"));
        this.Opens_windows = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "Opens_windows.json"));
        this.List_macros = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "Macros.json"));
        this.ProgramsExe = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "ProgramsExe.json"));
        this.DB_DIR = path.join(process.env.APPDATA, packageJson.productName);
        this.THEME_DIR = path.join(process.env.APPDATA, packageJson.productName, 'UN-DATA', 'themes');
        this.GetData();
    }

    async GetDataNow() {
        this.DB = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DB.json"));
        this.DBUSER = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DBUSER.json"));
        this.CLOUD = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "CLOUD.json"));
        this.DISCORD = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "DISCORD.json"));
        this.OBS = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "OBS.json"));
        this.WEBDECK = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "WEBDECK.json"));
        this.THEMES = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "THEMES.json"));
        this.Opens_windows = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "Opens_windows.json"));
        this.List_macros = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "Macros.json"));
        this.ProgramsExe = new Jsoning(path.join(DIRAPPDATUNDB, "DB", "ProgramsExe.json"));
        return this;
    }

    async GetData() {
        this.List_programs = await this.ProgramsExe.get('list_programs');
        this.Macro_lis = await this.List_macros.get('macros');
        this.USER = this.DBUSER.get('user');
        if (!this.USER) {
            let oldDBU = await this.DB.get('user');
            if (oldDBU) {
                this.USER = oldDBU;
                await this.DBUSER.set('user', oldDBU);
                await this.DB.set('user', null);
                await this.DB.set('user_pc', null);
            }
        }
        this.PC = this.DBUSER.get('user_pc');
        let themesLocal = await this.THEMES.get('local');
        let themesRemote = await this.THEMES.get('remote');
        this.WEBDECKDATA.formatView = await this.WEBDECK.get('format_view');
        this.WEBDECKDATA.pages = await this.WEBDECK.get('pages');
        this.WEBDECKDATA.formatListView = await this.WEBDECK.get('format_list_view');
        if (themesLocal)
            this.ThemesData.list = themesLocal.concat(themesRemote);
        return this;
    }
}

module.exports = new DBCLASS();