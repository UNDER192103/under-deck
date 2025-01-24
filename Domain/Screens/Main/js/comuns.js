///      Constants      ///
const Electron = require('electron');
const MAIN_DIR = __dirname.split('\\Domain')[0];
const _dirname = MAIN_DIR;
const path = require('path');
const Jsoning = require("jsoning");
const ip = require("ip");
const fs = require("fs");
const fsPromises = require('fs').promises;
const { exec } = require('child_process');
const QRCode = require('qrcode');
const {getAllInstalledSoftwareSync} = require('fetch-installed-software');
const { title } = require('process');
const Comun = require(MAIN_DIR+"/Domain/Comun/Comun.js");
const toaster = require(MAIN_DIR+"/Domain/src/js/toaster.js");
///      Constants      ///

///      Variables      ///

var GNDATA = {
    server_port: null,
}
var DAO = require(MAIN_DIR+"/Repository/DB.js"),
keyEvent = require(MAIN_DIR+'/Domain/Service/KeyMacros.js'),
localServer = require(MAIN_DIR+'/Domain/Service/Server.js'),
list_routs = null,
old_sbs_scene_selected = null,
_list_installed_software = [],
add_app = {type_exec: null},
radio_select_name_file = null,
im_list = false,
radio_select_file_dir = null,
radio_select_file_info = null,
editExeNow = null,
step_paApp = 1,
tempBlockSelecMenu = false,
typingTimer,
doneTypingInterval = 1000,
OBS_TEMP_DATA = {
    scenes: null,
    audios: null
};

///      Variables      ///

///      Pre-load values      ///

DAO.Server_port = DAO.DB.get('server_port');
DAO.List_programs = DAO.ProgramsExe.get('list_programs');
document.getElementById('key-macro').checked = DAO.DB.get('keyEvent');
document.getElementById('notifications_on_windows').checked = DAO.DB.get('App_notification_windows');
document.getElementById('autoupdateonestart').checked = DAO.DB.get('AutoUpdateApp');
document.getElementById('isNotValidFirstSearchUpdateApp').checked = DAO.DB.get('isNotValidFirstSearchUpdateApp');
document.getElementById('obs-checkbox-start').checked = DAO.OBS.get('ObsWssStartOnApp');
GNDATA.server_port = DAO.DB.get('server_port');
$('#port-local-server').val(GNDATA.server_port);
$('#local-server-adress-acess-url').val(`http://${ip.address("public", "ipv4")}:${GNDATA.server_port}`);

///      Pre-load values      ///

///      Load theme      ///

$("#bd-light").click(function(e) {
    selectTheme('light');
});

$("#bd-black").click(function(e) {
    selectTheme('black');
});

selectTheme(DAO.DB.get('bd_theme'));

///      Load theme      ///


///      Pre load funcions      ///

$(document).keyup((res) => {
    if(res.originalEvent.key == "F5"){
        location.reload();
    }
});

const load_custom_files = async ()=>{
    try {
        var past_js = MAIN_DIR+"\\Domain\\src\\js\\custom_js";
        var list_js = await Comun.listAllFilesInFolder(past_js);
        list_js.forEach(file_dir => {
            if(file_dir.includes(".js") == true){
                $.getScript(file_dir, function() {
                    console.log(`JS File custom: ${path.basename(file_dir)}, is loaded sucess`);
                });
            }
        });
    } catch (error) { console.log(error) };

    try {
        var past_js = MAIN_DIR+"\\Domain\\src\\css\\custom_css";
        var list_js = await Comun.listAllFilesInFolder(past_js);
        list_js.forEach(file_dir => {
            if(file_dir.includes(".css") == true){
                $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file_dir) );
                console.log(`CSS custom: ${path.basename(file_dir)}, is loaded sucess`);
            }
        });
    } catch (error) { console.log(error) };
}
load_custom_files();

function startExe(id){
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var data = list_programs.filter(b => b._id == id)[0];
    Comun.exec_program(data, data.type_exec);
}

function clearEditExe(){ editExeNow = null};

async function openIpUrlWeb(){ exec(`start http://${ip.address("public", "ipv4")}:${await DAO.DB.get('server_port')}`) };

const clear_modal_webpage = () => {
    $("#name_webpage").val("");
    $("#url_webpage").val("https://");
}

const open_file_brosewr = (id)=>{
    var item = _list_installed_software.filter(f => f.id_for_select == id)[0];
    if(item){
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
    if(list_webpages != null && list_webpages.length > 0){
        list_webpages.forEach(item => {
            add_im_list_webpages(item);
        });
    }
}

function shuffleArray(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

async function selectMenu(id, uC = false){
    if(tempBlockSelecMenu == true) return;
    $(`.navs-item-sm`).removeClass('active');
    $(`#nav-item-${id}`).addClass('active');

    if(localStorage.getItem('page') != id){
        if(DAO.DB.get('isEnableAnimations') == true){
            if(DAO.DB.get('modelAnimation') == 'random' || DAO.DB.get('animation') == 'random'){
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                stylesAnimmetedC = shuffleArray(stylesAnimmetedC);
                styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
            else{
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                styleNowstylesAnimmetedC = DAO.DB.get('animation');
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
        }
    }

    var _page_selected = "";

    if(id == 'app-main'){
        changeAppsHtml();
        _page_selected = `.container-home`;
    }
    else if(id == 'keys-macros'){
        if(uC)
            await change_list_keys_macros();
        _page_selected = `.container-kys-macros`;
    }
    else if(id == 'web-pages'){
        if(uC)
            await change_list_web_pages();
        _page_selected = `.container-web-pages`;
    }
    else if(id == 'obs-studio'){
        _page_selected = `.container-obs-studio`;
    }
    else if(id == 'config'){
        _page_selected = `.container-config`;
    }
    else if(id == 'updates'){
        _page_selected = `.container-updates`;
    }
    else if(id == 'help'){
        _page_selected = `.container-helper`;
    }

    if(await localStorage.getItem('page') != id || !uC){
        $(`.container-hide-control`).removeClass('hidden').hide();
        $(_page_selected).removeClass('hidden').fadeIn(500);
    }

    localStorage.setItem('page', id);
    $(".toastify .toast-close").click();
};


async function selectTheme(id){
    switch (id) {

        case 'black':
            $(".bg-card-srt").addClass('bg-dark text-light');
            $(".bg-srt").addClass('bg-black').removeClass('bg-light');
            $("#c_tooltip-inner").text('.tooltip-inner{color: black !important;background-color: white !important;}');
            $(".bg-srt-modal .modal-dialog .modal-content").addClass('bg-black').removeClass('bg-light');
            $(".bg-srt-dropdown-menu").addClass('dropdown-menu-black').removeClass('dropdown-menu-light');
            $('#bd-theme').html('<i class="bi bi-moon-stars-fill"></i>');
            $("#c_bootbox").html(`
                .modal-content > * {
                   background-color: black;
                   color: white;
                }
                .modal-body, .modal-header, .modal-footer, .modal-header {
                   border: var(--bs-modal-border-width) solid rgb(255 255 255) !important;
                }
                .modal-body{
                   border-bottom-left-radius: 5px;
                   border-bottom-right-radius: 5px;
                }
                .bootbox-close-button.close.btn-close {
                   background-color: #e30909;
                }
            `);
            DAO.DB.set('bd_theme', 'black');
        break;

        case 'light':
            $(".bg-card-srt").removeClass('bg-dark text-light');
            $(".bg-srt").addClass('bg-light').removeClass('bg-black');
            $("#c_tooltip-inner").text('');
            $(".bg-srt-modal .modal-dialog .modal-content").addClass('bg-light').removeClass('bg-black');
            $(".bg-srt-dropdown-menu").removeClass('dropdown-menu-light').removeClass('dropdown-menu-black');
            $('#bd-theme').html('<i class="bi bi-sun-fill"></i>');
            $("#c_bootbox").html(``);
            DAO.DB.set('bd_theme', 'light');
        break
    
        default:
            selectTheme('light');
        break;
    }
    $(`#s-themes option[value="${id}"]`).prop('selected', true);
}
///      Pre load funcions      ///



///      App ready      //

$(document).ready(async () => {
    await BACKEND.Send('Obs_wss_p', {stage: 'Status'});
    
    await $('.footable').footable();
    $( ".list_apps" ).sortable({
        stop: change_position_list,
    });
    $( ".list_apps" ).disableSelection();

    $('button[data-toggle="collapse"]').click((e)=>{
        var id = $(e.target).attr("aria-controls");
        $(`#${id}`).collapse('toggle');
    });

    $('#translate_de').keyup(function() {
        clearTimeout(typingTimer);
        if ($('#translate_de').val) {
          typingTimer = setTimeout(tranlate, doneTypingInterval);
        }
    });

    $(document).on('change', '.s-themes',function(e){
        e.preventDefault();
        selectTheme($(this).val());
    });
    $(document).on('change', '.s-languages', function(e){
        e.preventDefault();
        selec_lang($(this).val(), true);
    });

    $(document).on('click', '.back_step_paapp', function(e){
        step_paApp--;
        apressentationSteps();
    });

    $(document).on('click', '.next_step_paapp', function(e){
        step_paApp++;
        apressentationSteps();
    });

    if( localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null){
        selectMenu(localStorage.getItem('page'));
    }

    change_list_keys_macros();
    change_list_web_pages();

    setTimeout(async ()=>{
        $("#preload-app").hide();
        $("#main-app").fadeIn(500);
        if(await DAO.DB.get('isFirstStart') != true){
            if(await DAO.DB.get('first_search_update_app') == true){
                $("#button-search-updates").click()
                await DAO.DB.set('first_search_update_app', false);
            }
        }
        else{
            processeApressentationApp();
        }
    }, 100);
});

///      App ready      ///

async function checkPreferredLanguage(callback){

    bootbox.confirm(
        {
            title: `<span class="preferredlanguage">${getNameTd('.preferredlanguage')}</span>`,
            message: `
            <div class="select mb-3">
                <label class="form-check-label select_language_text">${getNameTd('.select_language_text')}:</label>
                <div class="input-group">
                    <div class="input-group-text p-1">
                       <img class="icone-selected-lang m-1" src="">
                    </div>
                    <select class="form-select s-languages">
                       <option value="en_us">English</option>
                       <option value="pt_br">Português Brasileiro</option>
                    </select>
                </div>
            </div>

            <div class="select mb-3">
                <label class="form-check-label theme_text" for="s-themes">${getNameTd('.theme_text')}:</label>
                <select class="form-select s-themes">
                    <option value="light">Light</option>
                    <option value="black">Dark</option>
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
            callback: function(result){ 
              callback();
            }
        }
    );
    $(`.s-languages option[value="${_lang}"]`).prop('selected', true);
    $(`.s-themes option[value="${await DAO.DB.get('bd_theme')}"]`).prop('selected', true);
    $(".icone-selected-lang").attr("src", langs[_lang].icon);
}

async function processeApressentationApp() {
    await DAO.DB.set('isFirstStart', true);
    checkPreferredLanguage(()=>{

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
                callback: function(result){ 
                    if(result){
                        step_paApp = 1;
                        apressentationSteps();
                    }
                    else{
                        DAO.DB.set('isFirstStart', false);
                        if(DAO.DB.get('first_search_update_app') == true){
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
    $('.modal button[data-bs-dismiss="modal"]').prop('disabled', false).click();
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

    let elem;

    switch (step_paApp) {
        case 1:
            await selectMenu('app-main');
            tempBlockSelecMenu = true;
            elem = $("#bnt_modal_add_app");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
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
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 500);
        break;

        case 3:
            await selectMenu('keys-macros');
            tempBlockSelecMenu = true;
            elem = $("#button-add-macro");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 4:
            await selectMenu('web-pages');
            tempBlockSelecMenu = true;
            elem = $("#button-add-webpage");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 5:
            await selectMenu('obs-studio');
            tempBlockSelecMenu = true;
            elem = $("#obs-wss-password");
            $(".container-obs-studio *").prop('disabled', true);
            elem.popover({
                html : true,
                title: `<span class="obs_studio_n_text_icon">${getNameTd('.obs_studio_n_text_icon')}</span>`,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 6:
            await selectMenu('config');
            tempBlockSelecMenu = true;
            elem = $("#s-languages");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 7:
            await selectMenu('config');
            tempBlockSelecMenu = true;
            elem = $("#local-server-adress-acess-url");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
                title: `<span class="settings_text_icon">${getNameTd('.settings_text_icon')}</span>`,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 8:
            await selectMenu('config');
            tempBlockSelecMenu = true;
            elem = $("#s-themes");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 9:
            await selectMenu('updates');
            tempBlockSelecMenu = true;
            elem = $("#button-search-updates");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;

        case 10:
            await selectMenu('help');
            tempBlockSelecMenu = true;
            elem = $("#nav-item-help");
            elem.prop('disabled', true);
            elem.popover({
                html : true,
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

            setTimeout(()=>{
                elem.popover('show');
            }, 1000);
        break;
    
        default:
            await DAO.DB.set('isFirstStart', false);
            bootbox.alert(`<h5>${getNameTd('.quickguideFinish')}</h5>`);
        break;
    }
}
