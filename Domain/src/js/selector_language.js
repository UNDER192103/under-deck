var langs = {};
var PACKAGE = require(__dirname.split('Domain')[0] + "package.json");
var DAO = require(__dirname.split('Domain')[0] + "Repository/DB.js");
var _lang = DAO.DB.get('lang_selected'),
isOk = false,
loopIntervalUpdate = null,
pathAppData = path.join(process.env.APPDATA, PACKAGE.productName);

LAllLangs().then((_l) => {
    langs = _l;
    selec_lang(_lang, DAO.DB.get('checkLanguage'));
    $.each(langs, (lang_id) => {
        let lang = langs[lang_id];
        $(".s-languages").append(`<option value="${lang_id}">${lang.name}</option>`);
        $(`.dir-icon-${lang_id}`).attr('src', lang.icon);
    });
});

async function selec_lang(id_lang, is_update_back = false) {
    if (is_update_back == null) is_update_back = false;
    if (id_lang == null || !langs[id_lang]) id_lang = langs.en_us.id;
    _lang = id_lang;
    let lang = langs[_lang];
    await changeLang(lang.data);
    $(".icone-selected-lang").attr("src", lang.icon);
    $(".text-lang-selected").text(lang.name);
    await DAO.DB.set('lang_selected', id_lang);
    if (!isOk)
        isOk = true;
    else {
        changeAppsHtml();
        change_list_keys_macros();
    }
    if (is_update_back) {
        await BACKEND.Update_lang(id_lang);
        await DAO.DB.set('checkLanguage', null);
        loopIntervalUpdate = setInterval(() => {
            if (conn && conn.readyState == 1) {
                clearInterval(loopIntervalUpdate);
                webSocketClient.send(
                    webSocketClient.ToJson(
                        {
                            method: 'config-lang',
                            lang: id_lang
                        }
                    )
                );
            }
        }, 1000);
    }

    $(`.s-languages option[value="${id_lang}"]`).prop('selected', true);
}

async function changeLang(list) {
    list.forEach(item => {
        if (item.type == "tooltip_t") {
            try {
                $(item.id).tooltip('dispose')
            } catch (error) { }

            $(item.id).attr("title", item.text).tooltip();
        }
        else {
            if (item.css != null)
                $(item.id)[item.type](item.text).css(item.css);
            else
                $(item.id)[item.type](item.text);
        }
    });
};

function getNameTd(idBusca) {
    var tr = langs[_lang].data.filter(L => L.id == idBusca)[0];
    if (tr)
        return tr.text
    else
        return idBusca;
}

async function ListByFolder(folder) {
    var data = data || {};
    var files = require('fs').readdirSync(folder);
    for (var i in files) {
        var fileDir = folder + '\\' + files[i];
        if (!require('fs').statSync(fileDir).isDirectory()) {
            let _d = require(fileDir);
            if(_d && _d.id && _d.name && _d.flag != null && _d.data && _d.data.length > 250){
                data[_d.id] = _d;
            }
            else{
                console.log(`Invalid language file: ${fileDir}`);
            }
        }
    }
    return data;
}

async function LAllLangs() {
    let dir1 = __dirname.split('Domain')[0] + 'Languages';
    let listFApp = await ListByFolder(dir1);
    let listLAppData = await ListByFolder(path.join(pathAppData, "UN-DATA", "Languages"));
    Object.keys(listLAppData).forEach(item => {
        if(!listFApp[item]) listFApp[item] = listLAppData[item];
    });
    return listFApp;
}