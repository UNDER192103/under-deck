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
const Comun = require(MAIN_DIR+"/Domain/Comun/Comun.js");
const toaster = require(MAIN_DIR+"/Domain/src/js/toaster.js");
let stylesAnimmetedC = [ 'animate__slideInDown', /*'animate__slideInLeft',*/ 'animate__slideInRight', 'animate__slideInUp' ];
let styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))]
$(".container-animated-style").addClass(styleNowstylesAnimmetedC);
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
    $(".bg-srt").addClass('bg-light').removeClass('bg-black');
    $("#c_tooltip-inner").text('');
    $(".bg-srt-modal .modal-dialog .modal-content").addClass('bg-light').removeClass('bg-black');
    $(".bg-srt-dropdown-menu").removeClass('dropdown-menu-light').removeClass('dropdown-menu-black');
    $('#bd-theme').html('<i class="bi bi-sun-fill"></i>');
    $("#c_bootbox").html(``);
    DAO.DB.set('bd_theme', 'light');
});

$("#bd-black").click(function(e) {
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
});

if(DAO.DB.get('bd_theme') == 'light'){
    $("#bd-light").click();
}
if(DAO.DB.get('bd_theme') == 'black'){
    $("#bd-black").click();
}

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
    $(`.navs-item-sm`).removeClass('active');
    $(`#nav-item-${id}`).addClass('active');

    if(localStorage.getItem('page') != id){
        $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
        stylesAnimmetedC = shuffleArray(stylesAnimmetedC);
        styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))]
        $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
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

    if( localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null){
        selectMenu(localStorage.getItem('page'));
    }

    change_list_keys_macros();
    change_list_web_pages();

    setTimeout(async ()=>{
        $("#preload-app").hide();
        $("#main-app").fadeIn(500);
        if(await DAO.DB.get('first_search_update_app') == true){
            $("#button-search-updates").click()
            await DAO.DB.set('first_search_update_app', false);
        }
    }, 100);
});

///      App ready      ///
