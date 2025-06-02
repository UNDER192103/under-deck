const langs = {};
let dirLangs = __dirname.split('Domain')[0] + 'languages';
var files = require('fs').readdirSync(dirLangs);
for (var i in files) {
    var fileDir = dirLangs + '\\' + files[i];
    if (!require('fs').statSync(fileDir).isDirectory()) {
        let _d = require(fileDir);
        if(_d && _d.id && _d.name && _d.flag != null && _d.data && _d.data.length > 250){
            langs[_d.id] = _d;
        }
        else{
            console.log(`Invalid language file: ${fileDir}`);
        }
    }
}
var DAO = require("../../Repository/DB.js");
var _lang = DAO.DB.get('lang_selected'), isOk = false;
if(_lang == null)
    _lang = 'en_us';

function getNameTd(idBusca){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null)
        _lang = 'en_us';
    var tr = langs[_lang].data ? langs[_lang].data.filter(L => L.id == idBusca)[0] : null;
    if(tr)
        return tr.text
    else
        return idBusca;
}

function getList(){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null)
        _lang = 'en_us';

    return langs[_lang].data;
}

module.exports = {
    getNameTd,
    getList,
}