const langs = require(__dirname.split('Domain')[0]+'Domain/src/system_tray/langs.js');
var DAO = require(__dirname.split('Domain')[0]+"Repository/DB.js");
var _lang = DAO.DB.get('lang_selected'), isOk = false;
if(_lang == null)
    _lang = 'en_us';

function getNameTd(idBusca){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null)
        _lang = 'en_us';
    var tr = langs[_lang].dt.list_td.filter(L => L.id == idBusca)[0];
    if(tr)
        return tr.text
    else
        return idBusca;
}

module.exports = {
    getNameTd,
}