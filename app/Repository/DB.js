const path = require('path');
const fs = require("fs");
const _MAIN_DIR = __dirname.split('Repository')[0];
const packageJson = require(_MAIN_DIR+"/package.json");
const Jsoning = require("jsoning");

var dir_appdata_un = path.join(process.env.APPDATA, packageJson.name);
var dir_appdata_un_data = path.join(dir_appdata_un, 'UN-DATA');

var _all  = require(_MAIN_DIR + 'Domain/Model/DB_model.js');

_all.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
_all.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
_all.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
_all.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
_all.DB_DIR = dir_appdata_un;

_all.GetDataNow = async ()=>{
    _all.DB = new Jsoning(dir_appdata_un_data + "/DB/DB.json");
    _all.Opens_windows = new Jsoning(dir_appdata_un_data + "/DB/Opens_windows.json");
    _all.List_macros = new Jsoning(dir_appdata_un_data + "/DB/Macros.json");
    _all.ProgramsExe = new Jsoning(dir_appdata_un_data + "/DB/ProgramsExe.json");
    _all.List_programs = await _all.ProgramsExe.get('list_programs');
    _all.Macro_lis = await _all.List_macros.get('macros');
    return _all;
}

module.exports = _all;