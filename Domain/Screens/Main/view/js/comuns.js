///      Constants      ///
const Electron = require('electron');
const MAIN_DIR = __dirname.split('\\Domain')[0];
const _dirname = MAIN_DIR;
const path = require('path');
const Jsoning = require("jsoning");
const fs = require("fs");
const fsPromises = fs.promises;
const axios = require('axios');
const { exec } = require('child_process');
const QRCode = require('qrcode');
const { getAllInstalledSoftwareSync } = require('fetch-installed-software');
const { title, contextIsolated } = require('process');
const loudness = require("loudness");
const { version } = require('os');
const Comun = require(MAIN_DIR + "/Domain/Comun/Comun.js");
const toaster = require(MAIN_DIR + "/Domain/src/js/toaster.js");
///      Constants      ///

///      Variables      ///

var GNDATA = {
    server_port: null,
}

var API = require(MAIN_DIR + "/Repository/Api.js");
var DAO = require(MAIN_DIR + "/Repository/DB.js"),
    localServer = require('./Service/Server.js'),
    mac = null,
    list_routs = null,
    old_sbs_scene_selected = null,
    _list_installed_software = [],
    add_app = { type_exec: null },
    radio_select_name_file = null,
    im_list = false,
    radio_select_file_dir = null,
    radio_select_file_info = null,
    editExeNow = null,
    step_paApp = 1,
    tempBlockSelecMenu = false,
    typingTimer,
    doneTypingInterval = 1000,
    listAllThemes = [],
    app_un = {
        version: null,
        isMuted: false
    },
    OBS_TEMP_DATA = {
        scenes: null,
        audios: null
    };

///      Variables      ///

///      Pre-load values      ///
///      Load theme      ///
loadThemesOptions(true);
///      Load theme      ///

document.getElementById('key-macro').checked = DAO.DB.get('keyEvent');
document.getElementById('notifications_on_windows').checked = DAO.DB.get('App_notification_windows');
document.getElementById('isMinimizeToBar').checked = DAO.DB.get('isMinimizeToBar');
document.getElementById('autoupdateonestart').checked = DAO.DB.get('AutoUpdateApp');
document.getElementById('isNotValidFirstSearchUpdateApp').checked = DAO.DB.get('isNotValidFirstSearchUpdateApp');
GNDATA.server_port = DAO.DB.get('server_port');
$('#port-local-server').val(GNDATA.server_port);
$('#local-server-adress-acess-url').val(`http://${getMyIPAddress()}:${GNDATA.server_port}`);

///      Pre-load values      ///


///      Pre load funcions      ///

$(document).keyup((res) => {
    if (res.originalEvent.key == "F5") {
        location.reload();
    }
});

const b64toBlob = (base64) =>
    fetch(base64).then(res => res.blob());

const load_custom_files = async () => {
    try {
        var paths_js_C = path.join(DAO.DB_DIR, 'UN-DATA', 'custom_js');
        if (fs.existsSync(paths_js_C)) {
            var list_path_js_c = await Comun.listAllFilesInFolder(paths_js_C);
            list_path_js_c.forEach(file_dir => {
                if (file_dir.includes(".js") == true) {
                    $.getScript(file_dir, function () {
                        console.log(`JS File custom: ${path.basename(file_dir)}, is loaded sucess`);
                    });
                }
            });
        }
    } catch (error) { console.log(error) };

    try {
        var paths_css_C = path.join(DAO.DB_DIR, 'UN-DATA', 'custom_css');
        if (fs.existsSync(paths_css_C)) {
            var list_path_css_c = await Comun.listAllFilesInFolder(paths_css_C);
            list_path_css_c.forEach(file_dir => {
                if (file_dir.includes(".css") == true) {
                    $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', file_dir));
                    console.log(`CSS custom: ${path.basename(file_dir)}, is loaded sucess`);
                }
            });
        }
    } catch (error) { console.log(error) };
}
load_custom_files();

function startExe(id) {
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var data = list_programs.filter(b => b._id == id)[0];
    Comun.exec_program(data, data.type_exec);
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

function shuffleArray(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

async function selectMenu(id, uC = false) {
    if (tempBlockSelecMenu == true) return;
    $(`.navs-item-sm`).removeClass('active');
    $(`#nav-item-${id}`).addClass('active');

    if (localStorage.getItem('page') != id) {
        if (DAO.DB.get('isEnableAnimations') == true) {
            if (DAO.DB.get('modelAnimation') == 'random' || DAO.DB.get('animation') == 'random') {
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                stylesAnimmetedC = shuffleArray(stylesAnimmetedC);
                styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
            else {
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                styleNowstylesAnimmetedC = DAO.DB.get('animation');
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
        }
    }

    var _page_selected = "";

    if (id == 'app-main') {
        changeAppsHtml();
        _page_selected = `.container-home`;
    }
    else if (id == 'webunderdeck') {
        changeAppsHtml();
        _page_selected = `.container-webunderdeck`;
    }
    else if (id == 'soundpad') {
        changeAppsHtml();
        _page_selected = `.container-soundpad`;
    }
    else if (id == 'keys-macros') {
        if (uC)
            await change_list_keys_macros();
        _page_selected = `.container-kys-macros`;
    }
    else if (id == 'web-pages') {
        if (uC)
            await change_list_web_pages();
        _page_selected = `.container-web-pages`;
    }
    else if (id == 'obs-studio') {
        _page_selected = `.container-obs-studio`;
    }
    else if (id == 'config') {
        _page_selected = `.container-config`;
    }
    else if (id == 'discord') {
        _page_selected = `.container-discord`;
    }
    else if (id == 'updates') {
        _page_selected = `.container-updates`;
    }
    else if (id == 'report') {
        _page_selected = `.container-report`;
    }
    else if (id == 'help') {
        _page_selected = `.container-helper`;
    }
    else if (id == 'appearance') {
        _page_selected = `.container-appearance`;
    }

    if (await localStorage.getItem('page') != id || !uC) {
        $(`.container-hide-control`).removeClass('hidden').hide();
        $(_page_selected).removeClass('hidden').fadeIn(500);
    }

    localStorage.setItem('page', id);
    $(".toastify .toast-close").click();
};

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
    $(".s-themes").append(``);
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

function ModalGetImagem(permitNull = false, callback, defaultImage = null) {
    if (defaultImage == null) {
        defaultImage = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");
    }
    bootbox.dialog({
        title: getNameTd('.select_image'),
        message: `
            <div class="row">
             <div class="col-md-12">
                <form class="form-horizontal">
                    <div class="form-group">
                        <label class="col-md-3 control-label icon_text_expc_1" for="logo">${getNameTd('.icon_text_expc_1')}</label>
                        <div class="col-md-4">
                         <img src="${defaultImage}" name="customImgTemplet" class="customImgTemplet" />
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
                    if ($("#input_customImgTemplet")[0].files[0])
                        callback($("#input_customImgTemplet")[0].files[0]);
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
            fs.copyFile(data_img.path, dirCopy, (err) => {
                callback(dirCopy);
            })
        }
        else
            callback(dirCopy);
    } else {
        callback(null);
    }
};

const save_icon_PageWebDeck_file = async (pathFile, id, callback) => {
    if (pathFile) {
        var dirCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages', `${id.replace('.', '-')}-${pathFile.split(/(\\|\/)/g).pop()}`);
        if (fs.existsSync(dirCopy) == false) {
            fs.copyFile(pathFile, dirCopy, (err) => {
                callback(dirCopy);
            });
        }
        else
            callback(dirCopy);
    } else {
        callback(null);
    }
};
///      Pre load funcions      ///

///      App ready      //

$(document).ready(async () => {

    await BACKEND.Send('Obs_wss_p', { stage: 'Status' });
    try {
        app_un.isMuted = await loudness.getMuted();
    } catch (error) {
        console.log(error);
    }

    $('.desable_texting_input').on('keydown', function (event) {
        //event.preventDefault();
        if (event.ctrlKey == true && event.keyCode == 67) {
            console.log(event.keyCode)
        }
        else {
            return false
        }
    });

    $(".input_select_all").on("click", function () {
        $(this).select();
    });

    $(document).on('click', '.CSALLDPM', function (e) {
        e.preventDefault();
        $("body").click();
    });

    $(document).on('click', '.view-password', function (e) {
        e.preventDefault();
        let input = $(getParent(e.currentTarget).find('input')[0]);
        if (input.attr('type') != 'password') {
            $(e.currentTarget).html('<i class="bi bi-eye-fill"></i>')
            input.attr('type', 'password');
        }
        else {
            $(e.currentTarget).html('<i class="bi bi-eye-slash-fill"></i>')
            input.attr('type', 'text');
        }
    });

    $(document).on('change', '#input_customImgTemplet', (e) => {
        if ($("#input_customImgTemplet")[0].files[0])
            $(".customImgTemplet").attr('src', ($("#input_customImgTemplet")[0].files[0].path));
    });


    await $('.footable').footable();

    $('button[data-toggle="collapse"]').click((e) => {
        var id = $(e.target).attr("aria-controls");
        $(`#${id}`).collapse('toggle');
    });

    $('#translate_de').keyup(function () {
        clearTimeout(typingTimer);
        if ($('#translate_de').val) {
            typingTimer = setTimeout(tranlate, doneTypingInterval);
        }
    });

    $(document).on('change', '.s-themes', function (e) {
        e.preventDefault();
        selectTheme($(this).val());
    });

    $(document).on('change', '.s-languages', function (e) {
        e.preventDefault();
        selec_lang($(this).val(), true);
    });

    $(document).on('click', '.back_step_paapp', function (e) {
        step_paApp--;
        apressentationSteps();
    });

    $(document).on('click', '.next_step_paapp', function (e) {
        step_paApp++;
        apressentationSteps();
    });

    if (localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null) {
        selectMenu(localStorage.getItem('page'));
    }

    change_list_keys_macros();
    change_list_web_pages();

    setTimeout(async () => {
        $("#preload-app").fadeOut(250);
        $("#main-app").fadeIn(500);
        if (await DAO.DB.get('isFirstStart') != true) {
            if (await DAO.DB.get('first_search_update_app') == true) {
                $("#button-search-updates").click()
                await DAO.DB.set('first_search_update_app', false);
            }
        }
        else {
            processeApressentationApp();
        }
    }, 100);
});

///      App ready      ///

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
                       <img class="icone-selected-lang m-1" src="${langs[_lang].icon}">
                    </div>
                    <select class="form-select s-languages">
                       ${
                        Object.keys(langs).map(e => {
                            return `<option ${_lang == langs[e].id ? 'selected' : ''} value="${langs[e].id}">${langs[e].name}</option>`;
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
                        if (DAO.DB.get('first_search_update_app') == true) {
                            $("#button-search-updates").click()
                            DAO.DB.set('first_search_update_app', false);
                        }
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
    $("#nav-item-help").prop('disabled', false);
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
            elem = $("#nav-item-help");
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

function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
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

function truncate(str, len) {
    return str.replace(new RegExp('(.{' + len + '}).*'), '$1...');
}