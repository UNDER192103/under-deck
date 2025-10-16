const { buffer } = require('stream/consumers');

function shuffleArray(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function startExe(id) {
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var data = list_programs.filter(b => b._id == id)[0];
    exec_program(data, data.type_exec);
}


function getMyIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        if (devName.includes('Ethernet') || devName.includes('Wi-Fi') || devName.includes('Wi Fi') || devName.includes('WiFi')) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

function truncate(str, len) {
    return str.replace(new RegExp('(.{' + len + '}).*'), '$1...');
}

function getElmByParentsClass(elem, _class, callback) {
    let el = $($(elem).parent()[0]);
    if (el.hasClass(_class)) {
        callback(el);
    }
    else {
        getElmByParentsClass(el, _class, callback);
    }
}

async function checkPreferredLanguage(callback) {
    let themeNow = await DAO.DB.get('bd_theme');
    bootbox.confirm(
        {
            title: `<span class="preferredlanguage">${getNameTd('.preferredlanguage')}</span>`,
            message: `
            <div class="select mb-3">
                <label class="form-check-label select_language_text">${getNameTd('.select_language_text')}:</label>
                <div class="input-group">
                    <div class="input-group-text p-1">
                       <img class="icone-selected-lang m-1" src="${LangData.icon}">
                    </div>
                    <select class="form-select s-languages">
                       ${
                        Object.keys(langs).map(e => {
                            return `<option ${LangData.id == langs[e].id ? 'selected' : ''} value="${langs[e].id}">${langs[e].name}</option>`;
                        }).join('')
                       }
                    </select>
                </div>
            </div>

            <div class="select mb-3">
                <label class="form-check-label themes_text" for="s-themes">${getNameTd('.themes_text')}:</label>
                <select class="form-select s-themes USLT">
                    <option ${themeNow == "light" ? 'selected' : ''} value="light" class="TLight_text">${getNameTd('.TLight_text')}</option>
                    <option ${themeNow == "black" ? 'selected' : ''} value="black" class="TOLEDBLACK_text">${getNameTd('.TOLEDBLACK_text')}</option>
                    <option ${themeNow == "light-sakura" ? 'selected' : ''} value="light-sakura" class="TSakura_text">${getNameTd('.TSakura_text')}</option>
                    ${
                        DAO.ThemesData.list.map(item => {
                            return `<option ${DAO.DB.get('bd_theme') == item.tid ? 'selected' : ''} class="RDM" value="${item.tid}">${item.name}</option>`;
                        })
                    }
                </select>
            </div>
            `,
            buttons: {
                cancel: {
                    label: getNameTd('.ignore_text'),
                    className: "btn-secondary ignore_text"
                },
                confirm: {
                    className: "btn-primary next_icon_text",
                    label: getNameTd('.next_icon_text')
                }
            },
            callback: function (result) {
                callback();
            }
        }
    );
}

async function processeApressentationApp() {
    await DAO.DB.set('isFirstStart', true);
    checkPreferredLanguage(() => {

        bootbox.confirm(
            {
                message: `<h3>${getNameTd('.doyouwanttolearnhowtousetheapplication')}</h3>`,
                buttons: {
                    cancel: {
                        label: getNameTd('.no'),
                        className: "btn-danger"
                    },
                    confirm: {
                        label: getNameTd('.yes')
                    }
                },
                callback: function (result) {
                    if (result) {
                        step_paApp = 1;
                        apressentationSteps();
                    }
                    else {
                        DAO.DB.set('isFirstStart', false);
                    }
                }
            }
        );

    });
}

async function apressentationSteps() {
    tempBlockSelecMenu = false;
    await $('.popover').popover('dispose');
    $("#bnt_modal_add_app").prop('disabled', false);
    $('.modal .button[data-bs-dismiss="modal"]').prop('disabled', false);
    $('.modal').modal('hide');
    $('.modal *').prop('disabled', false);
    $("#button-add-macro").prop('disabled', false);
    $("#button-add-webpage").prop('disabled', false);
    $(".container-obs-studio *").prop('disabled', false);
    $(".container-config *").prop('disabled', false);
    $("#s-languages").prop('disabled', false);
    $("#local-server-adress-acess-url").prop('disabled', false);
    $("#s-themes").prop('disabled', false);
    $("#button-search-updates").prop('disabled', false);
    $(`.nav li[data-id="help"]`).prop('disabled', false);
    $("#local-path-soundpad").prop('disabled', false);

    let elem;

    switch (step_paApp) {
        case 1:
            await selectMenu('app-main');
            tempBlockSelecMenu = true;
            elem = $("#bnt_modal_add_app");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="apps_name_icon">${getNameTd('.apps_name_icon')}</span>`,
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide1">
                        ${getNameTd('.quickguide1')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 2:
            await selectMenu('app-main');
            tempBlockSelecMenu = true;
            $('.modal button[data-bs-dismiss="modal"]').prop('disabled', true);
            $('.modal *').prop('disabled', true);
            $("#bnt_modal_add_app").click();

            elem = $("#bnt-select-type-add-app");
            elem.popover({
                html: true,
                title: `<span class="apps_name_icon">${getNameTd('.apps_name_icon')}</span>`,
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide2">
                        ${getNameTd('.quickguide2')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 500);
            break;

        case 3:
            await selectMenu('webunderdeck');
            tempBlockSelecMenu = true;
            elem = $("#local-server-adress-acess-url");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="webdeck_text_icon">${getNameTd('.webdeck_text_icon')}</span>`,
                placement: 'bottom',
                content: `
                    <div class="row m-0">
                        <div class="m-0 mb-3 p-0 quickguide7">
                            ${getNameTd('.quickguide7')}
                        </div>
                        <div class="m-0 p-0">
                            <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                            <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                        </div>
                    </div>
                    `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 4:
            await selectMenu('keys-macros');
            tempBlockSelecMenu = true;
            elem = $("#button-add-macro");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="keys_macro_text_icon">${getNameTd('.keys_macro_text_icon')}</span>`,
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide3">
                        ${getNameTd('.quickguide3')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 5:
            await selectMenu('web-pages');
            tempBlockSelecMenu = true;
            elem = $("#button-add-webpage");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="web_pages_text_icon">${getNameTd('.web_pages_text_icon')}</span>`,
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide4">
                        ${getNameTd('.quickguide4')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 6:
            await selectMenu('appearance');
            tempBlockSelecMenu = true;
            elem = $("#s-themes");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="settings_text_icon">${getNameTd('.settings_text_icon')}</span>`,
                placement: 'bottom',
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide8">
                        ${getNameTd('.quickguide8')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 7:
            await selectMenu('config');
            tempBlockSelecMenu = true;
            elem = $("#s-languages");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="settings_text_icon">${getNameTd('.settings_text_icon')}</span>`,
                placement: 'bottom',
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide6">
                        ${getNameTd('.quickguide6')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 8:
            await selectMenu('discord');
            tempBlockSelecMenu = true;
            elem = $("#button-login-discord-rpc");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<div class="discord_icon_text"><i class="bi bi-discord"></i> ${getNameTd('.discord_text')}</div>`,
                placement: 'bottom',
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide7">
                        ${getNameTd('.quickguide8Discord')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 9:
            await selectMenu('soundpad');
            tempBlockSelecMenu = true;
            elem = $("#local-path-soundpad");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<div class="keys_macro_text_icon"><i class="bi bi-mic-fill"></i> ${getNameTd('.soundpad_icon')}</div>`,
                content: `
                        <div class="row m-0">
                            <div class="m-0 mb-3 p-0 quickguide3">
                                ${getNameTd('.quickguide3R')}
                            </div>
                            <div class="m-0 p-0">
                                <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                                <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                            </div>
                        </div>
                        `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 10:
            await selectMenu('obs-studio');
            tempBlockSelecMenu = true;
            elem = $("#obs-wss-password");
            $(".container-obs-studio *").prop('disabled', true);
            elem.popover({
                html: true,
                title: `<div class="obs_studio_n_text_icon">${getNameTd('.obs_studio_n_text_icon')}</div>`,
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide5">
                        ${getNameTd('.quickguide5')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 11:
            await selectMenu('updates');
            tempBlockSelecMenu = true;
            elem = $("#button-search-updates");
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="updates_text_icon">${getNameTd('.updates_text_icon')}</span>`,
                placement: 'bottom',
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide9">
                        ${getNameTd('.quickguide9')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        case 12:
            await selectMenu('help');
            tempBlockSelecMenu = true;
            elem = $(`.nav li[data-id="help"]`);
            elem.prop('disabled', true);
            elem.popover({
                html: true,
                title: `<span class="help_text_icon">${getNameTd('.help_text_icon')}</span>`,
                placement: 'bottom',
                content: `
                <div class="row m-0">
                    <div class="m-0 mb-3 p-0 quickguide10">
                        ${getNameTd('.quickguide10')}
                    </div>
                    <div class="m-0 p-0">
                        <a class="btn btn-secondary btn-xs float-start back_step_paapp back_icon_text" type="button">${getNameTd('.back_icon_text')}</a>
                        <a class="btn btn-primary btn-xs float-end next_step_paapp next_icon_text" type="button">${getNameTd('.next_icon_text')}</a>
                    </div>
                </div>
                `,
            });

            setTimeout(() => {
                elem.popover('show');
            }, 1000);
            break;

        default:
            await DAO.DB.set('isFirstStart', false);
            bootbox.alert(`<h5>${getNameTd('.quickguideFinish')}</h5>`);
            break;
    }
}

function getParent(elem) {
    return $($(elem).parent()[0]);
}



const GetDataListProgramsForLocalHost = async () => {
    await DAO.GetDataNow();
    if (!app_un.version)
        app_un.version = await BACKEND.Send('get_version');
    let exe_background = await DAO.WEBDECK.get('exe-background');
    let exe_color_text = await DAO.WEBDECK.get('exe-color-text');
    let data = {
        css: `:root {
            ${exe_background ? `--backgound-exe-item: ${exe_background};` : ""}
            ${exe_color_text ? `--color-exe-item: ${exe_color_text};` : ""}
        }`,
        windows: {
            volume: await loudness.getVolume(),
        },
        app: {
            version: app_un.version,
        },
        web: {
            formatView: await DAO.WEBDECK.get('format_view'),
            formatListView: await DAO.WEBDECK.get('format_list_view'),
            pages: DAO.WEBDECKDATA.pages,
        },
        programs: DAO.List_programs ? DAO.List_programs : [],
    }
    return data;
}

const GetDataListProgramsForWebSocket = async () => {
    await DAO.GetDataNow();
    if (!app_un.version)
        app_un.version = await BACKEND.Send('get_version');
    let exe_background = await DAO.WEBDECK.get('exe-background');
    let exe_color_text = await DAO.WEBDECK.get('exe-color-text');
    let data = {
        css: `:root {
            ${exe_background ? `--backgound-exe-item: ${exe_background};` : ""}
            ${exe_color_text ? `--color-exe-item: ${exe_color_text};` : ""}
        }`,
        windows: {
            volume: await loudness.getVolume(),
        },
        app: {
            version: app_un.version,
        },
        web: {
            formatView: await DAO.WEBDECK.get('format_view'),
            formatListView: await DAO.WEBDECK.get('format_list_view'),
            pages: DAO.WEBDECKDATA.pages,
        },
        programs: await FormatListProgramsToWS(await DAO.ProgramsExe.get('list_programs')),
    }
    return data;
}

var FormTListCRT = { list: new Array(), listPrograms: new Array() };
const FormatListProgramsToWS = async (List) => {
    if(!List) List = [];
    if (JSON.stringify(FormTListCRT.list) != JSON.stringify(List)) {
        FormTListCRT.list = DAO.ProgramsExe.get('list_programs');
        FormTListCRT.listPrograms = await List.map(element => {
            let split = element.iconCustom.split('\\');
            element.iconCustom = split[split.length - 1];
            return element;
        });
    }

    return FormTListCRT.listPrograms;
}

const getBase64ByDir = async (DIR) => {
    return new Promise((resolve) => {
        fs.readFile(DIR, "base64", function (err, buffer) {
            if (err) {
                resolve('');
            } else {
                resolve("data:image;base64," + buffer);
            }
        });
    })
}

const b64toBlob = (base64) => fetch(base64).then(res => res.blob());
const B_are_you_sure = async () => {
    return new Promise((resolve) => {
        bootbox.confirm({
            message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
            buttons: {
                confirm: {
                    label: '<i class="bi bi-check2"></i> ' + getNameTd('.yes'),
                    className: 'btn-success yes'
                },
                cancel: {
                    label: '<i class="bi bi-x-lg"></i> ' + getNameTd('.no'),
                    className: 'btn-danger not'
                }
            },
            callback: resolve
        });
    })

}

function clearEditExe() { editExeNow = null };

async function openIpUrlWeb() { exec(`start http://${getMyIPAddress()}:${await DAO.DB.get('server_port')}`) };

const clear_modal_webpage = () => {
    $("#name_webpage").val("");
    $("#url_webpage").val("https://");
}

const open_file_brosewr = (id) => {
    var item = _list_installed_software.filter(f => f.id_for_select == id)[0];
    if (item) {
        var dir = item.DisplayIcon.replace(path.basename(item.DisplayIcon), "");
        try {
            exec(`explorer "${dir}"`);
        } catch (error) {
            console.log(error);
        }
    }
}

const change_list_web_pages = async () => {
    let footableListWebPages = await $(".list-web-pages").data('footable');
    await footableListWebPages.removeRow($(".list-web-pages tbody tr"));
    var list_webpages = await DAO.DB.get("web_page_saved");
    if (list_webpages != null && list_webpages.length > 0) {
        list_webpages.forEach(async item => {
            await add_im_list_webpages(item);
            if (item == list_webpages[list_webpages.length - 1]) {
                setTimeout(() => {
                    $('.list-web-pages').footable().trigger('footable_resize');
                }, 100);
            }
        });
    }
}

async function SetCustomTheme(theme, isPreloadd = false) {
    if (theme) {
        if (theme.isLocal == true) {
            if (theme.type == "VIDEO") {
                $("#custom-theme-stylesheet").attr('href', path.join(DAO.THEME_DIR, theme.css));
                $("#theme-bckI video source").attr('src', path.join(DAO.THEME_DIR, theme.uri));
            }
            else {
                $("#custom-theme-stylesheet").attr('href', path.join(DAO.THEME_DIR, theme.css));
                $("#theme-bckI img").attr('src', theme.uri_bck);
            }
        }
        else {
            if (theme.type == "VIDEO") {
                $("#custom-theme-stylesheet").attr('href', theme.uri_css);
                $("#theme-bckI video source").attr('src', theme.uri_bck);
            }
            else {
                $("#custom-theme-stylesheet").attr('href', theme.uri_css);
                $("#theme-bckI img").attr('src', theme.uri_bck);
            }
        }

        if (theme.type == "VIDEO") {
            $("#theme-bckI img").attr('src', '').hide();
            $("#theme-bckI video").show().get(0).load();
            $("#theme-bckI").show();
        }
        else {
            $("#theme-bckI img").show();
            $("#theme-bckI video").hide().get(0).load();
            $("#theme-bckI").show();
        }
    }
    else {
        $("#custom-theme-stylesheet").attr('href', '');
        $("#theme-bckI video source").attr('src', '');
        $("#theme-bckI img").attr('src', '').hide();
        $("#theme-bckI video").get(0).load();
        $("#theme-bckI").hide();
    }

}

async function loadThemesOptions(isPreloadd = false) {
    let themesLocal = await DAO.THEMES.get('local');
    let themesRemote = await DAO.THEMES.get('remote');
    if (themesLocal == null) {
        themesLocal = [];
        await DAO.THEMES.set('local', themesLocal);
    }
    if (themesRemote == null) {
        themesRemote = [];
        await DAO.THEMES.set('remote', themesRemote);
    }
    DAO.ThemesData.list = themesLocal.concat(themesRemote);
    $(".s-themes option.RDM").remove();
    if (DAO.ThemesData.list.length > 0) {
        let themeNow = await DAO.DB.get('bd_theme');
        DAO.ThemesData.list.forEach(item => {
            $(".s-themes").append(`<option ${themeNow == item.tid ? 'selected' : ''} class="RDM" value="${item.tid}">${item.name}</option>`);
            if (themeNow == item.tid && isPreloadd == true) {
                SetCustomTheme(item, isPreloadd);
            }
        });
    }

    selectTheme(DAO.DB.get('bd_theme'), true);
}

async function selectTheme(id, isPreloadd = false) {
    $("body").removeClass().addClass('full-page');
    let isOTheme = DAO.ThemesData.list.find(item => item.tid == id);
    $(".btn-apply-themeD.isDownloaded").show('slow');
    if (isOTheme) {
        if (!isPreloadd) {
            SetCustomTheme(isOTheme, isPreloadd);
        }
        $(".btn-apply-themeD#" + isOTheme.tid).hide('slow');
        $("body").addClass('theme-' + isOTheme.class);
    }
    else {
        SetCustomTheme(null, isPreloadd);
        $("body").addClass('theme-' + id);
    }
    await DAO.DB.set('bd_theme', id);

    let isEnb = DAO.DB.get('isEnableAnimationsHover');
    if (isEnb == "true" || isEnb == true) {
        $("body").addClass('enb-animations');
    }
    else {
        $("body").removeClass('enb-animations');
    }

    $(`#s-themes option[value="${id}"]`).prop('selected', true);
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

async function ModalGetImagem(permitNull = false, callback, defaultImage = null) {
    if (defaultImage == null) {
        defaultImage = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
    }
    bootbox.dialog({
        title: getNameTd('.select_image'),
        message: `
            <div class="row">
             <div class="col-md-12">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-md-3 control-label icon_text_expc_1" for="logo">${getNameTd('.icon_text_expc_1')}</label>
                        <div class="col-md-4 m-auto">
                         <img src="${typeof defaultImage === 'object' && defaultImage.size ? await convertImageToBase64(defaultImage) : defaultImage}" name="customImgTemplet" class="customImgTemplet" />
                        </div>
                        <span class="Select_an_image_text">${getNameTd('.Select_an_image_text')}</span>
                        <input type="file" class="form-control" id="input_customImgTemplet" aria-label="Upload"
                         accept=".jpeg, .gif, .png, .gif">
                   </div>
                </form>
             </div>
            </div>
        `,
        buttons: {
            danger: {
                label: getNameTd('.cancel_icon_text'),
                className: "btn btn-danger"
            },
            success: {
                label: getNameTd('.submit_icon'),
                className: "btn btn-success",
                callback: function () {
                    if ($("#input_customImgTemplet")[0].files[0]){
                        let file = $("#input_customImgTemplet")[0].files[0];
                        callback(file);
                    }
                    else if (permitNull == true) {
                        callback(null, defaultImage);
                    }
                    else {
                        toaster.danger(getNameTd('.invalid_image_text'));
                        ModalGetImagem(permitNull, callback, defaultImage);
                    }
                }
            }
        }
    });
}

const save_icon_app_file = async (data_img, name, callback) => {
    if (data_img) {
        var dirCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe', `${name.replace('.', '-')}-${data_img.name}`);
        if (fs.existsSync(dirCopy) == false) {
            const buffer = Buffer.from(await data_img.arrayBuffer());
            fs.writeFile(dirCopy, buffer, (err) => {
                callback(dirCopy);
            })
        }
        else
            callback(dirCopy);
    } else {
        callback(null);
    }
};

const save_copy_default_icon_PageWebDeck_file = async (dir, id, callback) => {
    if (dir) {
        var dirToCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages', `${id.replace('.', '-')}-${dir.split(/(\\|\/)/g).pop()}`);
        fs.copyFile(dir, dirToCopy, (err) => {
            callback(dirToCopy);
        });
    } else {
        callback(null);
    }
};

const save_icon_PageWebDeckNF = async (file, id, callback) => {
    if (file) {
        if(file && file.name){
            let ext = file.name.split('.').pop();
            var dirSave = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages', `${id.replace('.', '-')}-${uuidv4()}.${ext}`);
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFile(dirSave, buffer, (err) => {
                callback(dirSave);
            });
        }
        else{
            callback(null);
        }
    } else {
        callback(null);
    }
};

const save_icon_PageWebDeckBF = async (page, callback) => {
    if (page.icon) {
        if(page.icon && page.icon.name){
            let ext = page.icon.name.split('.').pop();
            var dirSave = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages', `${page.id.replace('.', '-')}-${uuidv4()}.${ext}`);
            const buffer = Buffer.from(await page.icon.arrayBuffer());
            fs.writeFile(dirSave, buffer, (err) => {
                callback(dirSave);
            });
        }
        else{
            callback(null);
        }
    } else {
        callback(null);
    }
};

async function listAllFilesInFolder(diretorio, arquivos) {

    if (!arquivos)
        arquivos = [];

    let listaDeArquivos = await fs.promises.readdir(diretorio);
    for (let k in listaDeArquivos) {
        let stat = await fs.promises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await listAllFilesInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '\\' + listaDeArquivos[k]);
    }

    return arquivos;

}

async function listAllFoldersInFolder(diretorio, arquivos) {

    if (!arquivos)
        arquivos = [];

    let listaDeArquivos = await fs.promises.readdir(diretorio);
    for (let k in listaDeArquivos) {
        let stat = await fs.promises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else if (stat.isDirectory() && diretorio.includes("node_modules") == true) {
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        }
        else {
            if (!diretorio.includes("node_modules")) {
                if (await arquivos.filter(file => file == diretorio)[0] == null)
                    arquivos.push(diretorio);
            }
        }
    }

    return arquivos;

}

async function ListAllFilesInFolder(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '\\' + files[i];
        if (fs.statSync(name).isDirectory()) {
            await ListAllFilesInFolder(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

const Get_file_name = async (filePath) => {
    return new Promise(async resolve => {
        const filePaths = filePath => [].concat(filePath);
        filePaths(filePath).forEach(element => {
            resolve(`${path.basename(element, path.extname(element))}`);
        });
    });
}

const get_icon_by_exe = async (exe, dir) => {
    try {
        await icon.extract(exe, dir, "png");
        var name_f = await Get_file_name(exe);
        return `${dir}${name_f}.png`;
    } catch (error) {
        return null;
    }
};

var rand = function () {
    return Math.random().toString(32).substr(2); // remove `0.`
};

var token = function () {
    return rand() + rand() + rand() + rand(); // to make it longer
};

const exec_program = async (data, type = null) => {
    try {
        if (data != null) {
            if (type == null) {
                if (data.type_exec != null)
                    type = data.type_exec;
                else
                    type = "exe";
            }

            let name = data.name;
            if (data.nameCustom != null)
                name = data.nameCustom;

            if (type == "discord") {
                if (DiscordControler.isConnected) {
                    if (data.path == "toggle-mute-unmute-mic") {
                        DiscordControler.ToggleMute();
                    }
                    else if (data.path == "toggle-mute-unmute-audio") {
                        DiscordControler.ToggleDeafen();
                    }
                    else if (data.path == "mute-mic") {
                        DiscordControler.Mute();
                    }
                    else if (data.path == "unmute-mic") {
                        DiscordControler.UnMute();
                    }
                    else if (data.path == "mute-audio") {
                        DiscordControler.Deafen();
                    }
                    else if (data.path == "unmute-audio") {
                        DiscordControler.UnDeafen();
                    }
                    else {
                        console.log(data.path);
                    }
                }
                else {
                    toaster.danger(getNameTd('.This_action_cannot_be_performed_because_the_Discord_integration_is_not_connected_please_check_if_it_is_connected'))
                }
            }
            else if (type == "exe") {
                console.log(`App: ${name} Iniciado!`)
                exec(`"${data.path}"`, () => { });
            }
            else if (type == "web_page") {
                console.log(`Pagina web aberta, Nome: ${name} Iniciado!`)
                exec(`start "" "${data.path}"`, () => { });
            }
            else if (type == "cmd") {
                console.log(`Comando executado, Nome: ${name} Iniciado!`)
                exec(`${data.path}`, () => { });
            }
            else if (type == 'audio') {
                var audio_token = await token();
                $("#audios_instaces").append(`
                    <audio id="${audio_token}-player" class="hidden" controls='false'>
                        <source id="${audio_token}-src" src="${data.path}">
                    </audio>
                `);
                try {
                    var instace_audio = $(`#${audio_token}-player`)[0];
                    await instace_audio.load();
                    $(`#${audio_token}-player`).on('ended', function () {
                        $(`#${audio_token}-player`).remove();
                    });
                    instace_audio.play();
                } catch (error) {
                    $(`#${audio_token}-player`).remove();
                }
            }
            else if (type == "obs_wss") {
                if (data.obsOption == 'scene')
                    await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', sceneName: data.scene.sceneName, id: data.scene.sceneUuid });
                else if (data.obsOption == "audioinput_mute" && data.audioInput != null) {
                    if (DAO.OBS.get(`input_muted-${data.audioInput.inputUuid}`) == true) {
                        await DAO.OBS.set(`input_muted-${data.audioInput.inputUuid}`, null);
                        await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', notify: false, inputMuted: false, inputName: data.audioInput.inputName, inputUuid: data.audioInput.inputUuid });
                    }
                    else {
                        await DAO.OBS.set(`input_muted-${data.audioInput.inputUuid}`, true);
                        await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', notify: false, inputMuted: true, inputName: data.audioInput.inputName, inputUuid: data.audioInput.inputUuid });
                    }
                }
                else {
                    BACKEND.Send('Obs_wss_p', { stage: data.obsOption, notify: false });
                }
            }
            else if (type == "soundpad_audio") {
                if (ListSoundPad.length > 0) {
                     if(data.hash == 'DoPlayCurrentSoundAgain'){
                        exec_soundpad(pathSoundPadExe, 'DoPlayCurrentSoundAgain()');
                    }
                    else if(data.hash == 'DoStopSound'){
                        exec_soundpad(pathSoundPadExe, 'DoStopSound()');
                    }
                    else if(data.hash == 'DoTogglePause'){
                        exec_soundpad(pathSoundPadExe, 'DoTogglePause()');
                    }
                    else{
                        let soundP = ListSoundPad.filter(f => f.hash == data.hash)[0];
                        if (soundP) {
                            exec_soundpad(pathSoundPadExe, `DoPlaySound(${soundP.index})`);
                        }
                    }
                }

            }
            else if(type == "options_os"){
                await BACKEND.Send('Robotjs_keyTap', {key: data.path}).the(console.log);
            }
            else {

            }
        }
    } catch (error) {

    }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file); // This reads the file as a data URL (Base64 encoded)
  });
}

const exec_soundpad = async (pathSoundPad, command) => {
    if (await fs.existsSync(pathSoundPad)) exec(`${pathSoundPad} -rc ${command}`, (e) => { });
}