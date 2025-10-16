var langs = {};
const { app } = require('electron');
const path = require('path');
var _lang = DAO.DB.get('lang_selected');
if(_lang == null) _lang = 'en_us';

function Get(idBusca){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null || !langs[_lang])
        _lang = 'en_us';
    var tr = langs[_lang].data ? langs[_lang].data.filter(L => L.id == idBusca)[0] : null;
    if(tr)
        return tr.text
    else
        return idBusca;
}

function GetList(){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null || !langs[_lang]) _lang = 'en_us';
    return langs[_lang].data;
}

function GetLang(){
    _lang = DAO.DB.get('lang_selected');
    if(_lang == null || !langs[_lang]) _lang = 'en_us';
    return langs[_lang];
}

async function SetLanguage(lang){
    await UpdateListLanguages();
    if(lang == null || !langs[lang]) lang = 'en_us';
    await DAO.DB.set('lang_selected', lang);
}

const UpdateListLanguages = () => {
    return new Promise((resolve) => {
        langs = {};
        let dirLangs = __dirname.split('Domain')[0] + 'languages';
        var filesLApp = require('fs').readdirSync(dirLangs);
        for (var i in filesLApp) {
            var fileDir = path.join(dirLangs, filesLApp[i]);
            if (!require('fs').statSync(fileDir).isDirectory()) {
                const modulePath = require.resolve(fileDir);
                if(require.cache[modulePath]) delete require.cache[modulePath];
                let _d = require(fileDir);
                if(_d && _d.id && _d.name && _d.flag != null && _d.data && _d.data.length > 250){
                    langs[_d.id] = _d;
                }
                else{
                    console.log(`Invalid language file: ${fileDir}`);
                }
            }
        }

        var LanguagesPathAppData = path.join(app.getPath('userData'), 'UN-DATA', 'Languages');
        var filesLAppData = require('fs').readdirSync(LanguagesPathAppData);
        for (var i in filesLAppData) {
            var fileDir = path.join(LanguagesPathAppData, filesLAppData[i]);
            if (!require('fs').statSync(fileDir).isDirectory()) {
                const modulePath = require.resolve(fileDir);
                if(require.cache[modulePath]) delete require.cache[modulePath];
                let _d = require(fileDir);
                if(_d && _d.id && _d.name && _d.flag != null && _d.data && _d.data.length > 250){
                    if(!langs[_d.id]) langs[_d.id] = _d;
                }
                else{
                    console.log(`Invalid language file: ${fileDir}`);
                }
            }
        }
        resolve(langs);
    });
}
UpdateListLanguages();

module.exports = {
    UpdateListLanguages,
    Get,
    SetLanguage,
    GetList,
    GetLang,
    GetListLanguages: UpdateListLanguages
}