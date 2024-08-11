const _MAIN_DIR = __dirname.split('Repository')[0];
const Jsoning = require("jsoning");

var _all  = require(_MAIN_DIR + 'Domain/Model/DB_model.js');

_all.DB = new Jsoning(_MAIN_DIR + "Repository/DB/DB.json");
_all.Opens_windows = new Jsoning(_MAIN_DIR + "Repository/DB/Opens_windows.json");
_all.List_macros = new Jsoning(_MAIN_DIR + "Repository/DB/Macros.json");
_all.ProgramsExe = new Jsoning(_MAIN_DIR + "Repository/DB/ProgramsExe.json");

_all.GetDataNow = async ()=>{
    _all.DB = new Jsoning(_MAIN_DIR + "Repository/DB/DB.json");
    _all.Opens_windows = new Jsoning(_MAIN_DIR + "Repository/DB/Opens_windows.json");
    _all.List_macros = new Jsoning(_MAIN_DIR + "Repository/DB/Macros.json");
    _all.ProgramsExe = new Jsoning(_MAIN_DIR + "Repository/DB/ProgramsExe.json");
    _all.List_programs = await _all.ProgramsExe.get('list_programs');
    _all.Macro_lis = await _all.List_macros.get('macros');
    return _all;
}

module.exports = _all;