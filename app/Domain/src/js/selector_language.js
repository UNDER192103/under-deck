
const langs = require(__dirname.split('Domain')[0]+'Domain/src/system_tray/langs.js');
var DAO = require("../../../Repository/DB.js");
var _lang = DAO.DB.get('lang_selected'), isOk = false;
selec_lang(_lang);

async function selec_lang(id_lang){
    if(id_lang == null)
        id_lang = langs.en_us.id;
    _lang = id_lang;
    await changeLang(langs[id_lang].dt.list_td);
    $(".icone-selected-lang").attr("src", langs[id_lang].icon);
    $(".text-lang-selected").text(langs[id_lang].name);
    DAO.DB.set('lang_selected', id_lang)
    if(!isOk)
        isOk = true;
    else{
        changeAppsHtml();
        change_list_keys_macros();
    }
}

async function changeLang(list){
    list.forEach(item => {
        $(item.id)[item.type](item.text);
    });
};

function getNameTd(idBusca){
    var tr = langs[_lang].dt.list_td.filter(L => L.id == idBusca)[0];
    if(tr)
        return tr.text
    else
    return idBusca;
}