const path = require('path');
const Electron = require('electron');
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
const APP_PATH = __dirname.split('\\Domain')[0];
var API = require(APP_PATH + "/Repository/Api.js");
var DAO = require(APP_PATH + "/Repository/DB.js");
var localServer = require('./Service/Server.js');
var DiscordControler = require('./Service/DiscordControler.js');
const toaster = require(APP_PATH + "/Domain/src/js/toaster.js");

var stylesAnimmetedC = ['animate__slideInDown','animate__slideInRight', 'animate__slideInUp'];
var styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
var listThemesToDownload = [], tempBlockSelecMenu = false;
var animations = { config: { duration: 1000, delay: 0 }, list: require(APP_PATH + "/Domain/Src/animations-list.json").list };

var  mac = null,
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

$(document).keyup((res) => {
    if (res.originalEvent.key == "F5") {
        location.reload();
    }
});

loadThemesOptions(true);
$('#port-local-server').val(DAO.DB.get('server_port'));
$('#local-server-adress-acess-url').val(`http://${getMyIPAddress()}:${DAO.DB.get('server_port')}`);

$(document).ready(async () => {
    try {
        app_un.isMuted = await loudness.getMuted();
    } catch (error) {
        console.log(error);
    }

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

    $(document).on('change', '#input_customImgTemplet', async (e) => {
        if ($("#input_customImgTemplet")[0].files[0]) $(".customImgTemplet").attr('src', await convertImageToBase64($("#input_customImgTemplet")[0].files[0]));
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
        selec_lang($(this).val());
    });

    $(document).on('click', '.back_step_paapp', function (e) {
        step_paApp--;
        apressentationSteps();
    });

    $(document).on('click', '.next_step_paapp', function (e) {
        step_paApp++;
        apressentationSteps();
    });

    changeAppsHtml();
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