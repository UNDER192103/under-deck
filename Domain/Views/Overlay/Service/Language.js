var LangData = null, _lang = null;

configLang();

function configLang() {
    $(".s-languages").html('');
    BACKEND.Send('LANG_LIST').then((Lang) => {
        $(".icone-selected-lang").attr("src", Lang.icon);
        $(".text-lang-selected").text(Lang.name);
        $(`.s-languages option[value="${Lang.id}"]`).prop('selected', true);
        LangData = Lang;
        _lang = Lang.id;
        ChangeLangElements(Lang.data);
    }); 

    BACKEND.Send('LIST_LANGS').then((Langs) => {
        $.each(Langs, (lang_id) => {
            let lang = Langs[lang_id];
            $(".s-languages").append(`<option value="${lang.id}" ${lang.id === _lang ? 'selected': ''}>${lang.name}</option>`);
            $(`.dir-icon-${lang_id}`).attr('src', lang.icon);
        });
    });   
}

async function selec_lang(id_lang) {
    $("body").modalLoading('show', false);
    await BACKEND.Send("SELECT_LANG", id_lang).then(async () => {
        $("body").modalLoading('hide', false);
        await configLang();
        await DAO.DB.set('checkLanguage', null);
    });
}

async function ChangeLangElements(list) {
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
    var tr = LangData.data.filter(L => L.id == idBusca)[0];
    if (tr)
        return tr.text
    else
        return idBusca;
}