const path = require('path');
const fs = require("fs");
const { app } = require('electron');
const _MAIN_DIR = __dirname.split('Repository')[0];
const packageJson = require(_MAIN_DIR+"/package.json");
const Jsoning = require("jsoning");
const dir_appdata_un_data = path.join(path.join(process.env.APPDATA, packageJson.productName), 'UN-DATA');

var _all  = require(_MAIN_DIR + 'Domain/Model/DB_model.js');

_all.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
_all.OBS = new Jsoning(dir_appdata_un_data + "/DB/OBS.json");
_all.WEBDECK = new Jsoning(dir_appdata_un_data + "/DB/WEBDECK.json");
_all.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
_all.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
_all.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
_all.DB_DIR = path.join(process.env.APPDATA, packageJson.productName);

_all.GetDataNow = async ()=>{
    _all.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
    _all.OBS = new Jsoning(dir_appdata_un_data + "/DB/OBS.json");
    _all.WEBDECK = new Jsoning(dir_appdata_un_data + "/DB/WEBDECK.json");
    _all.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
    _all.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
    _all.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
    _all.List_programs = await _all.ProgramsExe.get('list_programs');
    _all.Macro_lis = await _all.List_macros.get('macros');
    _all.USER = _all.DB.get('user');
    return _all;
}

module.exports = _all;