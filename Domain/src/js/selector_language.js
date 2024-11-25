
const langs = require(__dirname.split('Domain')[0]+'Repository/language/langs.js');
var DAO = require(__dirname.split('Domain')[0]+"Repository/DB.js");
var _lang = DAO.DB.get('lang_selected'), isOk = false;
selec_lang(_lang);

$.each(langs, (lang_id) => {
    $(`.dir-icon-${lang_id}`).attr('src', langs[lang_id].icon);
});

async function selec_lang(id_lang, is_update_back = false){
    if(id_lang == null)
        id_lang = langs.en_us.id;
    _lang = id_lang;
    await changeLang(langs[id_lang].dt.list_td);
    $(".icone-selected-lang").attr("src", langs[id_lang].icon);
    $(".text-lang-selected").text(langs[id_lang].name);
    await DAO.DB.set('lang_selected', id_lang);
    if(!isOk)
        isOk = true;
    else{
        changeAppsHtml();
        change_list_keys_macros();
    }

    if(is_update_back){
        await BACKEND.Update_lang(id_lang);
    }
}

async function changeLang(list){
    list.forEach(item => {
        if(item.type == "tooltip_t"){
            try {
                $(item.id).tooltip('dispose')
            } catch (error) { }

            $(item.id).attr("title", item.text).tooltip();
        }
        else{
            if(item.css != null)
                $(item.id)[item.type](item.text).css(item.css);
            else
                $(item.id)[item.type](item.text);
        }
    });
};

function getNameTd(idBusca){
    var tr = langs[_lang].dt.list_td.filter(L => L.id == idBusca)[0];
    if(tr)
        return tr.text
    else
        return idBusca;
}