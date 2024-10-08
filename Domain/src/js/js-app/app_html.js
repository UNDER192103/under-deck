const MAIN_DIR = __dirname.split('\\Domain')[0];
const _dirname = MAIN_DIR;
const path = require('path');
const Jsoning = require("jsoning");
const fs = require("fs");
const fsPromises = require('fs').promises;
const { exec } = require('child_process');
const QRCode = require('qrcode');
const {getAllInstalledSoftwareSync} = require('fetch-installed-software');

var DAO = require(MAIN_DIR+"/Repository/DB.js");
const Comun = require(MAIN_DIR+"/Domain/Comun/Comun.js");
const toaster = require(MAIN_DIR+"/Domain/src/js/toaster.js");
var keyEvent = require(MAIN_DIR+'/Domain/Service/KeyMacros.js');
var localServer = require(MAIN_DIR+'/Domain/Service/Server.js');

var ip = require("ip");
var old_sbs_scene_selected = null;
var list_routs = null,
is_hiden_menu = false,
_list_installed_software = [],
add_app = {type_exec: null},
radio_select_name_file = null,
im_list = false,
radio_select_file_dir = null,
radio_select_file_info = null,
file_selected_to_editor = null;

DAO.Server_port = DAO.DB.get('server_port');

$("#bd-light").click(function(e) {
    $(".bg-srt").addClass('bg-light').removeClass('bg-black');
    $("#c_tooltip-inner").text('');
    $(".bg-srt-modal .modal-dialog .modal-content").addClass('bg-light').removeClass('bg-black');
    $(".bg-srt-dropdown-menu").removeClass('dropdown-menu-light').removeClass('dropdown-menu-black');
    $('#bd-theme').html('<i class="bi bi-sun-fill"></i>');
    DAO.DB.set('bd_theme', 'light');
});

$("#bd-black").click(function(e) {
    $(".bg-srt").addClass('bg-black').removeClass('bg-light');
    $("#c_tooltip-inner").text('.tooltip-inner{color: black !important;background-color: white !important;}');
    $(".bg-srt-modal .modal-dialog .modal-content").addClass('bg-black').removeClass('bg-light');
    $(".bg-srt-dropdown-menu").addClass('dropdown-menu-black').removeClass('dropdown-menu-light');
    $('#bd-theme').html('<i class="bi bi-moon-stars-fill"></i>');
    DAO.DB.set('bd_theme', 'black');
});

if(DAO.DB.get('bd_theme') == 'light'){
    $("#bd-light").click();
}
if(DAO.DB.get('bd_theme') == 'black'){
    $("#bd-black").click();
}

DAO.List_programs = DAO.ProgramsExe.get('list_programs');

changeAppsHtml();

document.getElementById('key-macro').checked = DAO.DB.get('keyEvent');
document.getElementById('notifications_on_windows').checked = DAO.DB.get('App_notification_windows');
document.getElementById('autoupdateonestart').checked = DAO.DB.get('AutoUpdateApp');
document.getElementById('obs-checkbox-start').checked = DAO.OBS.get('ObsWssStartOnApp');


var port = DAO.DB.get('server_port');

$('#port-local-server').val(port);
$('#local-server-adress-acess-url').val(`http://${ip.address("public", "ipv4")}:${port}`);

localServer.start_server(DAO.DB.get('isStartLocalServer'), (r, list)=>{
    console.log(r);
    list_routs = list;
});

$(document).keyup((res) => {
    if(res.originalEvent.key == "F5"){
        location.reload();
    }
});

$(document).ready(async function(){
    await BACKEND.Send('Obs_wss_p', {stage: 'Status'});
    
    $('.footable').footable();
    $( ".list_apps" ).sortable({
        stop: change_position_list,
    });
    $( ".list_apps" ).disableSelection();

    $('button[data-toggle="collapse"]').click((e)=>{
        var id = $(e.target).attr("aria-controls");
        $(`#${id}`).collapse('toggle');
    });

    var list_webpages = await DAO.DB.get("web_page_saved");
    if(list_webpages != null && list_webpages.length > 0){
        list_webpages.forEach(item => {
            add_im_list_webpages(item);
        });
    }

    var typingTimer;
    var doneTypingInterval = 1000;

    if(DAO.OBS.get('Port_wss_obs') != null)
        $("#obs-wss-port").val(DAO.OBS.get('Port_wss_obs'));
    if(DAO.OBS.get('Ip_wss_obs') != null)
        $("#obs-wss-ip").val(DAO.OBS.get('Ip_wss_obs'));
    if(DAO.OBS.get('Pass_wss_obs') != null)
        $("#obs-wss-password").val(DAO.OBS.get('Pass_wss_obs'));

    $('#translate_de').keyup(function() {
      clearTimeout(typingTimer);
      if ($('#translate_de').val) {
        typingTimer = setTimeout(tranlate, doneTypingInterval);
      }
    });

    $('#port-local-server').keypress(function () {
        var maxLength = $(this).val().length;
        if (maxLength >= 4) {
            return false;
        }
    });


    if( localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null)
        selectMenu(localStorage.getItem('page'));

    $('#key-macro').click(function(){
        let isCheck =  document.getElementById('key-macro').checked;
        keyEvent.startStopKeysEvents(isCheck);
        DAO.DB.set('keyEvent', isCheck);
    });

    $('#notifications_on_windows').click(function(){
        let isCheck =  document.getElementById('notifications_on_windows').checked;
        DAO.DB.set('App_notification_windows', isCheck);
    });

    $('#autoupdateonestart').click(function(){
        let isCheck =  document.getElementById('autoupdateonestart').checked;
        DAO.DB.set('AutoUpdateApp', isCheck);
    });

    $("#btn-update-list-scenes-obs").click(()=>{
        if(old_sbs_scene_selected == $("#name-custom-obs-scene").val())
            $("#name-custom-obs-scene").val('');
        old_sbs_scene_selected = null;
        toaster.warning(getNameTd(".listing_the_scenes_please_wait"), 5000);
        BACKEND.Send('Obs_wss_p', {stage: 'list_all_scenes'});
    });

    $("#btn-update-list-audio-input-obs").click(()=>{
        if(old_sbs_scene_selected == $("#name-custom-obs-scene").val())
            $("#name-custom-obs-scene").val('');
        old_sbs_scene_selected = null;
        toaster.warning(getNameTd(".listing_the_audio_inputs_please_wait"), 5000);
        BACKEND.Send('Obs_wss_p', {stage: 'list_all_audio_inputs'});
    });

    $('#select-obs-scene').change(function(){
        var name_scene = $(`#sl-${$(this).val()}`).text();
        $("#select-obs-options").val('');
        $('#select-audios-inputs').val('');
        if($("#name-custom-obs-scene").val().length == 0 || old_sbs_scene_selected == $("#name-custom-obs-scene").val()){
            $("#name-custom-obs-scene").val(name_scene);
            old_sbs_scene_selected = name_scene;
        }
    });

    $('#select-audios-inputs').change(function(){
        var name_input_audio = $(`#ai-${$(this).val()}`).text();
        $("#select-obs-options").val('');
        $("#select-obs-scene").val('');
        if($("#name-custom-obs-scene").val().length == 0 || old_sbs_scene_selected == $("#name-custom-obs-scene").val()){
            $("#name-custom-obs-scene").val(name_input_audio);
            old_sbs_scene_selected = name_input_audio;
        }
    });

    $('#select-obs-options').change(function(){
        var name_action = $(`#sl-${$(this).val()}`).text();
        if($("#name-custom-obs-scene").val().length == 0 || old_sbs_scene_selected == $("#name-custom-obs-scene").val()){
            $("#name-custom-obs-scene").val(name_action);
            old_sbs_scene_selected = name_action;
        }
        $("#select-obs-scene").val('');
        $('#select-audios-inputs').val('');
    });

    $('#obs-checkbox-start').click(async function(){
        let isCheck =  document.getElementById('obs-checkbox-start').checked;
        await DAO.OBS.set('ObsWssStartOnApp', isCheck);
    });

    $('#button-obs-wss-s-s').click(async function(){
        if(await BACKEND.Send('Obs_wss_p', {stage: 'is_started'}) != true)
            await BACKEND.Send('Obs_wss_p', {stage: 'Connect'});
        else
            await BACKEND.Send('Obs_wss_p', {stage: 'Disconnect'});
    });

    $('#btn-save-osb-port').click(async function(){
        var port = $("#obs-wss-port").val();
        var ip = $("#obs-wss-ip").val();
        if(ip.length > 7 && port.length > 0){
            await DAO.OBS.set('Port_wss_obs', parseInt(port));
            await DAO.OBS.set('Ip_wss_obs', ip);
            toaster.success(getNameTd('.sucess-save-port-or-ip'));
            await BACKEND.Send('Obs_wss_p', {stage: 'Disconnect'});
            $("#btn-save-osb-port").prop("disabled",true);
            $("#btn-save-osb-password").prop("disabled",true);
            $('#button-obs-wss-s-s').prop("disabled",true);
            setTimeout(async ()=>{
                $('#button-obs-wss-s-s').prop("disabled",false);
                $("#btn-save-osb-password").prop("disabled",false);
                $("#btn-save-osb-port").prop("disabled",false);
                await BACKEND.Send('Obs_wss_p', {stage: 'Connect'});
            }, 3000);
        }
        else{
            toaster.danger(getNameTd('.invalid-port-or-ip'));
        }
    });

    $('#btn-save-osb-password').click(async function(){
        var pass = $("#obs-wss-password").val();
        await DAO.OBS.set('Pass_wss_obs', pass);
        toaster.success(getNameTd('.sucess-save-obs-password'));
        await BACKEND.Send('Obs_wss_p', {stage: 'Disconnect'});
        $("#btn-save-osb-port").prop("disabled",true);
        $("#btn-save-osb-password").prop("disabled",true);
        $('#button-obs-wss-s-s').prop("disabled",true);
        setTimeout(async ()=>{
            $('#button-obs-wss-s-s').prop("disabled",false);
            $("#btn-save-osb-port").prop("disabled",false);
            $("#btn-save-osb-password").prop("disabled",false);
            await BACKEND.Send('Obs_wss_p', {stage: 'Connect'});
        }, 3000);
    });

    $('#btn-port-local-server').click(async function(){
        var port = $('#port-local-server').val();
        if(port.length == 4 && !isNaN(port)){
            $('.alert-por-local-server-modal').addClass('hidden');
            await DAO.DB.set('server_port', port);
            $('#local-server-adress-acess-url').val(`http://${ip.address("public", "ipv4")}:${DAO.DB.get('server_port')}`);
            toaster.success(getNameTd(".s_s_text"))
            if(DAO.DB.get('isStartLocalServer')){
                setTimeout(()=>{location.reload()}, 700);
            }
        }
        else{
            $('.alert-por-local-server-modal').text(getNameTd(".t_p_m_c_4_n_text")).removeClass('hidden');
        }
    });

    $('#button-start-local-server').click(async function(){
        if(DAO.DB.get('isStartLocalServer') == true){
            $('#button-start-local-server').text(getNameTd(".start_text"))
                .removeClass('btn-danger')
                .addClass('btn-success')
                .addClass('hover-pulse-grean')
                .removeClass('hover-pulse-red');
            await DAO.DB.set('isStartLocalServer', false);
            setTimeout(()=>{location.reload();}, 250);
        }
        else{
            $('#button-start-local-server').text(getNameTd(".stop_text")).addClass('btn-danger').removeClass('btn-success')
            .removeClass('hover-pulse-grean')
            .addClass('hover-pulse-red');
            DAO.DB.set('isStartLocalServer', true);
            localServer.start_server(true, (r)=>{
                console.log(r)
            })
        }
    });

    if(DAO.DB.get('isStartLocalServer') == true)
        $('#button-start-local-server').text(getNameTd(".stop_text"))
            .addClass('btn-danger')
            .removeClass('btn-success')
            .removeClass('hover-pulse-grean')
            .addClass('hover-pulse-red');

    else 
        $('#button-start-local-server').text(getNameTd(".start_text"))
            .addClass('btn-success')
            .removeClass('btn-danger')
            .addClass('hover-pulse-grean')
            .removeClass('hover-pulse-red');

    
    $('#input-app-exec').change(async () => {
        $('.alert-add-app').text("").addClass('hidden');
        if($("#name-exe-modal-1").val().length == 0){
            var executable = $('#input-app-exec')[0].files[0];
            if(executable != null)
                $("#name-exe-modal-1").val(executable.name.split(".")[0])
            else
                $("#name-exe-modal-1").val("");
        }
    });

    $('#input-app-audio').change(async () => {
        $('.alert-add-app').text("").addClass('hidden');
        if($("#name-exe-modal-1").val().length == 0){
            var executable = $('#input-app-audio')[0].files[0];
            if(executable != null)
                $("#name-audio-modal-1").val(executable.name.split(".")[0])
            else
                $("#name-audio-modal-1").val("");
        }
    });

    setTimeout(()=>{
        $("#preload-app").hide();
        $("#main-app").fadeIn(500);
    }, 0)
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

const open_webpage = async (id, name, url) => {
    await BACKEND.New_window({name: name, url: url});
}

const delet_web_page = async (id) => {
    var list_webpages = await DAO.DB.get("web_page_saved");
    var new_list = list_webpages.filter(f => f.id != id);
    await DAO.DB.set("web_page_saved", new_list);
    $(`#wb_page_${id}`).remove();
}

const add_im_list_webpages = (item) => {
    $("#list-web-pages").append(`
    <tr class="hover-color-primary" id="wb_page_${item.id}" title="${item.name}">
        <td>${item.id}</td>
        <td><button type="button" class="btn btn-sm btn-primary" onclick="open_webpage(${item.id}, '${item.name.replaceAll(" ", "_")}', '${item.url}')"><i class="bi bi-link-45deg"></i></button></td>
        <td><img src="https://www.google.com/s2/favicons?domain=${item.url}"></td>
        <td>${item.name}</td>
        <td>${item.url}</td>
        <td>${item.status}</td>
        <td>
            <button type="button" onclick="delet_web_page(${item.id})" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`);
    $(`#wb_page_${item.id}`).dblclick(function(){
        open_webpage(item.id, item.name.replaceAll(" ", "_"), item.url);
    });
}

const getQrCodeIpUrlWeb = async () => {
    QRCode.toDataURL(`http://${ip.address("public", "ipv4")}:${DAO.DB.get('server_port')}`, function (err, url) {
        if(!err){
            $("#url-qr-code-modal").attr("src", url);
        }
        else{
            setTimeout(()=>{
                $("#close_modal_qr_code").click();
            }, 500)
        }
    })
}

async function clear_add_app(){
    $("#inputs-add-exe").addClass("hidden");
    $("#inputs-add-audio-input").addClass("hidden");
    $("#inputs-add-web-page-url").addClass("hidden");
    $("#inputs-add-cmd-input").addClass("hidden");
    $("#obs-add-app-t").addClass("hidden");
    $('#bnt-select-type-add-app').text(getNameTd(".select_text"));
    $('.alert-add-app').text("").addClass('hidden');
    $("#name-exe-modal-1").val("");
    $("#name-exe-modal-2").val("");
    $("#name-exe-modal-3").val("");
    $("#name-audio-modal-1").val("");
    $("#url-add-app").val("");
    $("#cmd-add-app").val("");
    $("#input-app-audio").val('');
    $("#icon-audio-add-app-1").val('');
    $("#name-custom-obs-scene").val("");
    $('#icon-obs-add-app-5').val("");
    $("#select-obs-scene").val('');
    $('#select-audios-inputs').val('');
    $("#select-obs-options").val('')
    old_sbs_scene_selected = null;
    add_app.type_exec = null;
    _list_installed_software = [];
    radio_select_name_file = null;
    im_list = false;
    radio_select_file_dir = null;
    radio_select_file_info = null;
    $("#list_software").html("");
    $($("#list_installed_software").find('.card-content-spinner')[0]).show('slow');
    $("#list_installed_software").collapse('hide');
}

async function add_new_app(){
    $('.alert-add-app').text("").addClass('hidden');
    var icon = null;
    var nameCustom = "";
    if(add_app.type_exec == "audio"){
        var executable = $('#input-app-audio')[0].files[0];
        icon = $('#icon-audio-add-app-1')[0].files[0];
        nameCustom = $("#name-audio-modal-1").val();
        if(executable == null){
            toaster.warning(getNameTd(".p_s_a_audio_text"));
            $('.alert-add-app').text(getNameTd(".p_s_a_audio_text")).removeClass('hidden');
            $('#input-app-audio').focus();
            return;
        }
        if(executable == null && radio_select_file_dir != null){
            executable = {
                lastModified: radio_select_file_info.mtime,
                lastModifiedDate: radio_select_file_info.mtime,
                name: path.basename(radio_select_file_dir),
                path: radio_select_file_dir,
                size: radio_select_file_info.size,
                type: "application/x-msdownload",
                webkitRelativePath: '',
            };
        }
        else if(!executable.type.includes('audio/')){
            toaster.warning(getNameTd(".file_not_accepted"));
            $('.alert-add-app').text(getNameTd(".file_not_accepted")).removeClass('hidden');
            $("#name-audio-modal-1").val('');
            $('#input-app-audio').val('');
            $('#input-app-audio').focus();
            return;
        }
        add_app_for_file(executable, icon, nameCustom);
    }
    else if(add_app.type_exec == "exe"){
        var executable = $('#input-app-exec')[0].files[0];
        icon = $('#icon-exe-add-app-1')[0].files[0];
        nameCustom = $("#name-exe-modal-1").val();
        if(executable == null && radio_select_file_info == null){
            toaster.warning(getNameTd(".p_s_a_e_text"));
            $('.alert-add-app').text(getNameTd(".p_s_a_e_text")).removeClass('hidden');
            $('#input-app-exec').focus();
            return;
        }
        if(executable == null && radio_select_file_dir != null){
            executable = {
                lastModified: radio_select_file_info.mtime,
                lastModifiedDate: radio_select_file_info.mtime,
                name: path.basename(radio_select_file_dir),
                path: radio_select_file_dir,
                size: radio_select_file_info.size,
                type: "application/x-msdownload",
                webkitRelativePath: '',
            };
        }
        else if(!executable.type.includes('application/')){
            toaster.warning(getNameTd(".file_not_accepted"));
            $('.alert-add-app').text(getNameTd(".file_not_accepted")).removeClass('hidden');
            $("#name-exe-modal-1").val('');
            $('#input-app-exec').val('');
            $('#input-app-exec').focus();
            return;
        }
        add_app_for_file(executable, icon, nameCustom);
    }
    else if(add_app.type_exec == "web_page"){
        if($("#name-exe-modal-2").val().length == 0){
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-exe-modal-2').focus();
            return;
        }
        if($("#url-add-app").val().length == 0){
            toaster.warning(getNameTd(".requere_url_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_url_add_app")).removeClass('hidden');
            $('#url-add-app').focus();
            return;
        }
        icon = $('#icon-exe-add-app-2')[0].files[0];
        nameCustom = $("#name-exe-modal-2").val();
        let url = $("#url-add-app").val();
        add_app_for_web_page(url, icon, nameCustom)
    }
    else if(add_app.type_exec == "cmd"){
        if($("#name-exe-modal-3").val().length == 0){
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-exe-modal-3').focus();
            return;
        }
        if($("#cmd-add-app").val().length == 0){
            toaster.warning(getNameTd(".requere_cmd_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_cmd_add_app")).removeClass('hidden');
            $('#cmd-add-app').focus();
            return;
        }
        icon = $('#icon-exe-add-app-3')[0].files[0];
        nameCustom = $("#name-exe-modal-3").val();
        let cmd = $("#cmd-add-app").val();
        add_app_for_cmd(cmd, icon, nameCustom);
    }
    else if(add_app.type_exec == 'obs_wss'){
        icon = $('#icon-obs-add-app-5')[0].files[0];
        nameCustom = $("#name-custom-obs-scene").val();
        var id_obs_scene = $('#select-obs-scene').val();
        var id_obs_input_audio = $("#select-audios-inputs").val();
        if(nameCustom.length == 0){
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-exe-modal-3').focus();
            return;
        }
        if(DAO.OBS.get('data_scenes') != null && DAO.OBS.get('data_scenes').scenes.length > 0){
            var scene = DAO.OBS.get('data_scenes').scenes.filter(f => f.sceneUuid == id_obs_scene)[0];
            var input_audio = DAO.OBS.get('data_audios_inputs').inputs.filter(f => f.inputUuid == id_obs_input_audio)[0];
            if(scene != null){
                add_app_obs_option_scene(scene, icon, nameCustom, false);
            }
            else if(input_audio != null){
                add_app_obs_option_input_audio(input_audio, icon, nameCustom, false);
            }
            else if($('#select-obs-options').val() == "StartStream" || $('#select-obs-options').val() == "StopStream"){
                add_app_obs_options($('#select-obs-options').val(), icon, nameCustom, true);
            }
            else{
                toaster.danger(getNameTd('.pls_select_obs_scene'));
                $('.alert-add-app').text(getNameTd(".pls_select_obs_scene")).removeClass('hidden');
            }
        }
        else if($('#select-obs-options').val() == "StartStream" || $('#select-obs-options').val() == "StopStream"){
            add_app_obs_options($('#select-obs-options').val(), icon, nameCustom, true);
        }
        else{
            toaster.danger(getNameTd('.pls_update_list_scene'));
            $('.alert-add-app').text(getNameTd(".pls_update_list_scene")).removeClass('hidden');
        }
    }
    else{
        toaster.danger(getNameTd('.err_select_type_add_text'));
    }
}

const add_app_obs_options = async (typeOption, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == nameCustom)
                isFileSaved = true;
            else if(item.obsOption == typeOption)
                isFileSaved = true;
        });
    }

    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon)=>{
            if(dir_icon == null)
                dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");

            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: null, obsOption: typeOption, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        })
    }
    else{
        toaster.warning(getNameTd(".this_is_scene_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_scene_already_registered")).removeClass('hidden');
    }
}

const add_app_obs_option_scene = async (scene, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == nameCustom)
                isFileSaved = true;
            else if(item.scene == scene || item.scene != null && item.scene.sceneUuid == scene.sceneUuid)
                isFileSaved = true;
        });
    }
    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon)=>{
            if(dir_icon == null)
                dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");

            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: scene, obsOption: 'scene', type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        })
    }
    else{
        toaster.warning(getNameTd(".this_is_scene_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_scene_already_registered")).removeClass('hidden');
    }
}

const add_app_obs_option_input_audio = async (audio_input, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == nameCustom)
                isFileSaved = true;
            else if(item.scene == audio_input || item.audioInput != null && item.audioInput.inputUuid == audio_input.inputUuid)
                isFileSaved = true;
        });
    }
    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon)=>{
            if(dir_icon == null)
                dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");

            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: null, audioInput: audio_input, obsOption: 'audioinput_mute', type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        })
    }
    else{
        toaster.warning(getNameTd(".this_is_inputaudio_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_inputaudio_already_registered")).removeClass('hidden');
    }
}

const add_app_for_cmd = async (cmd, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == nameCustom)
                isFileSaved = true;
            else if(item.path == cmd)
                isFileSaved = true;
        });
    }
    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;
        save_icon_app_file(icon, nameCustom, async (dir_icon)=>{
            if(dir_icon == null)
                dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");
            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: cmd, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        })
    }
    else{
        toaster.warning(getNameTd(".this_is_cmd_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_cmd_already_registered")).removeClass('hidden');
    }
}

const add_app_for_web_page = async (url, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == nameCustom)
                isFileSaved = true;
            else if(item.path == url)
                isFileSaved = true;
        });
    }
    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon)=>{
            if(dir_icon == null){
                dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");
            }
            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: url, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        })
    }
    else{
        toaster.warning(getNameTd(".this_is_web_page_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_web_page_already_registered")).removeClass('hidden');
    }
}

const add_app_for_file = async (file, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if(filesSaved != null){
        await filesSaved.forEach(item => {
            if(item.name == file.name)
                isFileSaved = true;
        });
    }

    if(!isFileSaved){
        var _idItem = null;
        var positon_rl = 1;
        if(filesSaved != null && filesSaved.length > 0){
            if(filesSaved.length > 1){
                var iret = filesSaved.sort( compare__id ).pop();
                _idItem = iret._id+1;
            }
            else
                _idItem = filesSaved[0]._id+1;

            var lra = await filesSaved.sort( compare_positon_l );
            positon_rl = lra[lra.length-1].positon_l+1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, file.name, async (dir_icon)=>{
            let icon_but_exe = null;
            if(dir_icon == null){
                icon_but_exe = await Comun.get_icon_by_exe(file.path, path.join(DAO.DB_DIR, '\\UN-DATA\\icons-exe\\'));
                if(icon_but_exe != null)
                    dir_icon = icon_but_exe;
                else
                    dir_icon = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");
            }
            var item = {_id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: file.lastModified, lastModifiedDate: file.lastModifiedDate, name: file.name, nameCustom: nameCustom, path: file.path, scene: null, obsOption: null, type: file.type, size: file.size, iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            if(icon_but_exe != null){
                item.iconCustom = path.join(MAIN_DIR, "/Domain/src/img/underbot_logo.png");
                setTimeout(()=>{
                    $(`#col-exe-id-${_idItem} img`).attr("src", icon_but_exe);
                }, 3000);
            }
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
        });
    }
    else{
        if(file.type.includes('audio/') == true){
            toaster.warning(getNameTd(".this_is_audio_already_registered"));
            $('.alert-add-app').text(getNameTd(".this_is_audio_already_registered")).removeClass('hidden');
        }
        else{
            toaster.warning(getNameTd(".t_e_i_a_r_text"));
            $('.alert-add-app').text(getNameTd(".t_e_i_a_r_text")).removeClass('hidden');
        }
    }
}

function compare_positon_l( a, b ) {
    if ( a.positon_l < b.positon_l ){
      return -1;
    }
    if ( a.positon_l > b.positon_l ){
      return 1;
    }
    return 0;
}

function compare__id( a, b ) {
    if ( a._id < b._id ){
      return -1;
    }
    if ( a._id > b._id ){
      return 1;
    }
    return 0;
}

const save_icon_app_file = async (data_img, name, callback) => {
    if(data_img){
        var dirCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe', `${name.replace('.','-')}-${data_img.name}`);
        if(fs.existsSync(dirCopy) == false){
            fs.copyFile(data_img.path, dirCopy, (err) => {
                callback(dirCopy);
            })
        }
        else
            callback(dirCopy);
    }else{
        callback(null);
    }
};

async function select_type_add_app(type, id, text_type, id_remove_hidden){
    $('.alert-add-app').html(``).addClass('hidden');
    $("#inputs-add-audio-input").addClass("hidden");
    $("#name-audio-modal-1").val("");
    $("#input-app-audio").val('');
    $("#icon-audio-add-app-1").val('');
    $("#select-obs-scene").val('');
    $('#select-audios-inputs').val('');
    $("#inputs-add-exe").addClass("hidden");
    $("#inputs-add-web-page-url").addClass("hidden");
    $("#inputs-add-cmd-input").addClass("hidden");
    $("#obs-add-app-t").addClass("hidden");
    $("#name-exe-modal-1").val("");
    $("#name-exe-modal-2").val("");
    $("#name-exe-modal-3").val("");
    $("#url-add-app").val("");
    $("#cmd-add-app").val("");
    $('#input-app-exec').val("");
    $('#input-app-audio').val("");
    $('#icon-exe-add-app-1').val("");
    $('#icon-exe-add-app-2').val("");
    $('#icon-exe-add-app-3').val("");
    $("#name-custom-obs-scene").val("");
    $("#select-obs-options").val('');
    old_sbs_scene_selected = null;
    $('#icon-obs-add-app-5').val("");
    if(type == 'obs_wss'){
        if(await BACKEND.Send('Obs_wss_p', {stage: 'is_started'}) != true){
            $('.alert-add-app').html(`
                ${getNameTd('.plsconfigureandconnectwssobs')} <a class='a-style' onClick="$('.bnt-close-modal-add-app').click();selectMenu('obs-studio');">${getNameTd('.obs_studio_n_text')}</a>.
            `).removeClass('hidden');
            //toaster.danger(getNameTd('.notpossibleaddappobs'));
            return;
        }
    }
    add_app.type_exec = type;
    $("#bnt-select-type-add-app").text(getNameTd(text_type));
    $(id_remove_hidden).removeClass("hidden");
}

function appendHtml(item, count){
    var name = item.name.replace('.exe', '');
    var icone = MAIN_DIR+"/Domain/src/img/underbot_logo-68.png";
    if(item.nameCustom.length > 0)
        name = item.nameCustom;
    if(item.iconCustom != null)
        icone = item.iconCustom;
    var bgs = 'bg-light';
    var bg_dropdown_menu = "dropdown-menu-light";
    if(DAO.DB.get('bd_theme') == 'black'){
        bgs = 'bg-black';
        bg_dropdown_menu = "dropdown-menu-black";
    }
    $('.content-files-add').append(`
        <div class="col" id="col-exe-id-${count}"><div class="card bg-srt rounded-3 rigth-click-exe hover-exes border border-4 rounded ${bgs}"><div class="m-2 d-flex flex-row-reverse bd-highlight"><span class="dropdown-toggle dropdown-toggle-c hover-icon-edit" data-bs-auto-close="*" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><a class="nav-link tooltip-script hover_rotation" title="${getNameTd(".tooltip_config_t")}" data-toggle="tooltip" href="#" id="dropdownMenuLink-exe-id-${count}"><i class="bi bi-gear-wide"></i></a></span><ul class="dropdown-menu bg-srt-dropdown-menu ${bg_dropdown_menu}" aria-labelledby="dropdownMenuLink-exe-id-${count}">
        <li onClick="startExe(${count})"><a class="dropdown-item" href="#"><i class="bi bi-filetype-exe"></i> ${getNameTd(".start_text")}</a></li>
        <li onClick="editExe(${count})" type="button" data-bs-toggle="modal" data-bs-target="#modal-edit-exe"><a class="dropdown-item" href="#"><i class="bi bi-pen text-success"></i> ${getNameTd(".edit_text")}</a></li>
        <li onClick="deleteExe(${count})"><a class="dropdown-item" href="#"><i class="bi bi-trash3 text-danger"></i> ${getNameTd(".delete_text")}</a></li>
        </ul></div><img src="${icone}" class="card-img-top w-75 mb-2 auto-left-right rounded" alt="..."><hr><div class="card-body"><h5 class="card-title">${name}</h5><a class="hidden" id="col-title-exe-id-${count}">${item.name.replace('.exe', '')}</a></div></div></div>
    `);
    $(`#col-exe-id-${count}`).dblclick(function(){
        startExe(count)
    });

    setTimeout(()=>{
        $(".tooltip-script").tooltip();
    }, 500)
}
function startExe(id){
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var data = list_programs.filter(b => b._id == id)[0];
    Comun.exec_program(data, data.type_exec);
}

var editExeNow = null;

async function deleteExe(id){
    var list_programs = DAO.ProgramsExe.get('list_programs');
    if(list_programs != null){
        var item = list_programs.filter(b => b._id == id)[0];
        if(item != null && item.isExe != "browser"){
            DAO.ProgramsExe.set('list_programs', list_programs.filter(b => b._id != id));
            let listNowMacro = await DAO.List_macros.get('macros');
            if(listNowMacro != null){
                let newListMacros = listNowMacro.filter(m => m.idProgram != id);
                await DAO.List_macros.set('macros', newListMacros);
            }
            change_list_keys_macros(DAO.List_macros.get('macros'));
            $(`#col-exe-id-${id}`).remove();
            if(item.iconCustom != null){
                if(item.iconCustom.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe'))){
                    fs.access(item.iconCustom, fs.constants.F_OK, (err) => {
                        if (!err)
                        fs.unlinkSync(item.iconCustom)
                    })
                }
            }
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
        }
        else if(item == null){
            $(`#col-exe-id-${id}`).remove();
        }
    }
};

function clearEditExe(){ editExeNow = null};

async function openIpUrlWeb(){ exec(`start http://${ip.address("public", "ipv4")}:${await DAO.DB.get('server_port')}`) };

async function changeAppsHtml(){
    let listApps = await DAO.ProgramsExe.get('list_programs');
    $('.content-files-add').html('');
    if(listApps != null){
        await listApps.forEach(item => {
            appendHtml(item, item._id);
        });
    }
}

async function getAppById(id){
    if(id != null){
        var list_programs = await DAO.ProgramsExe.get('list_programs');
        if(list_programs != null && list_programs.length > 0)
            return list_programs.filter(b => b._id == id)[0];
        else
            return null;
    }
    else
        return null;
}

async function getNameApp(app){
    
    if(app != null && app.name != null && app.name.length > 0){
        var name = app.name.replace('.exe', '');
        if(app.nameCustom.length > 0)
            name = app.nameCustom;
        return name;
    }
    else
        return null;
}

function editExe(id){
    $("#icon-exe-edit").val('');
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var item = list_programs.filter(b => b._id == id)[0];
    $(".div-edit-url").addClass("hidden");
    $(".div-edit-cmd").addClass("hidden");
    $("#edit-url-add-app").val("");
    $("#edit-cmd-add-app").val("");

    editExeNow = item;
    if(item.type_exec == "web_page"){
        $(".div-edit-url").removeClass("hidden");
        $("#edit-url-add-app").val(item.path);
    }
    else if(item.type_exec == "cmd"){
        $(".div-edit-cmd").removeClass("hidden");
        $("#edit-cmd-add-app").val(item.path);
    }

    var name = item.name.replace('.exe', '');
    if(item.nameCustom.length > 0)
        name = item.nameCustom;
    $('#modal-edit-exeLabel').text(`${getNameTd(".edit_text")} ( ${name} )`);
    $('#name-exe-modal').val(name);
};

async function saveEditExe(){
    var file = $('#icon-exe-edit')[0].files[0];
    await saveIconFile(file, async (fileOld)=>{
        var newName = $('#name-exe-modal').val();
        if(newName.length > 0 && newName != editExeNow.nameCustom && newName != editExeNow.name){
            editExeNow.nameCustom = newName;
        }

        if(editExeNow.type_exec == "web_page"){
            editExeNow.path = $("#edit-url-add-app").val();
        }
        else if(editExeNow.type_exec == "cmd"){
            editExeNow.path = $("#edit-cmd-add-app").val();
        }
    
        var list_programs = DAO.ProgramsExe.get('list_programs'), newList = new Array();
        await list_programs.forEach(element => {
            if(element.name == editExeNow.name)
                element = editExeNow;
            newList.push(element);
        });
        await DAO.ProgramsExe.set('list_programs', newList);
        DAO.List_programs = newList;
        await changeAppsHtml();

        if(fileOld){
            if(fileOld.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe')) && fileOld != editExeNow['iconCustom']){
                fs.access(fileOld, fs.constants.F_OK, (err) => {
                    if (!err)
                    fs.unlinkSync(fileOld)
                })
            }
        }

        $(".div-edit-url").addClass("hidden");
        $(".div-edit-cmd").addClass("hidden");
        $("#edit-url-add-app").val("");
        $("#edit-cmd-add-app").val("");
        $('.btn-close-exe-modal').click();
        $("#icon-exe-edit").val('');
    });
};

async function saveIconFile(fileInput, callback){
    if(fileInput){
        var dirCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe', `${editExeNow.name.replace('.','-')}-${fileInput.name}`);
        const oldFile = editExeNow.iconCustom;
        fs.copyFile(fileInput.path, dirCopy, (err) => {
            if (err) throw err;
            editExeNow['iconCustom'] = dirCopy;
            callback(oldFile);
        })
    }else{
        callback();
    }
};

const clear_modal_webpage = () => {
    $("#name_webpage").val("");
    $("#url_webpage").val("https://");
}

const add_new_webpage = async () => {
    var name = $("#name_webpage").val();
    var url = $("#url_webpage").val();
    if(name.length > 0 && url.length > 0){
        var list_webpages = await DAO.DB.get("web_page_saved");
        var id = 1;
        if(list_webpages == null)
            list_webpages = [];
        else{
            let max_id = 0;
            list_webpages.forEach(i => {
                if(i.id > max_id)
                    max_id = i.id;
            })
            id = max_id+1;
        }

        var obj = {
            id: id,
            name: name,
            url: url,
            status: "no open",
        }
        list_webpages.push(obj);
        await DAO.DB.set("web_page_saved", list_webpages);
        add_im_list_webpages(obj);
        $(".btn-close-webpage-modal").click();
    }
    else{
        if(name.length < 1){
            toaster.danger(getNameTd('.requere_name_add_app'));
        }
        if(name.length < 1){
            toaster.danger(getNameTd('.requere_url_add_app'));
        }
    }
}

async function selectMenu(id){

    $(`.container-hide-control`).removeClass('hidden').hide();

    $(`.navs-item-sm`).removeClass('active');

    $(`#nav-item-${id}`).addClass('active');

    var _page_selected = "";

    if(id == 'app-main'){
        changeAppsHtml();
        _page_selected = `.container-home`;
    }
    else if(id == 'keys-macros'){
        await change_list_keys_macros();
        _page_selected = `.container-kys-macros`;
    }
    else if(id == 'web-pages'){
        _page_selected = `.container-web-pages`;
    }
    else if(id == 'obs-studio'){
        _page_selected = `.container-obs-studio`;
    }
    else if(id == 'config'){
        _page_selected = `.container-config`;
    }
    else if(id == 'help'){
        _page_selected = `.container-helper`;
    }

    $(_page_selected).removeClass('hidden').fadeIn();

    localStorage.setItem('page', id);
};

const installed_software_select = async (id)=>{
    var item = _list_installed_software.filter(f => f.id_for_select == id)[0];
    if(item){
        if($("#name-exe-modal-1").val() == '' || $("#name-exe-modal-1").val() == radio_select_name_file){
            $("#name-exe-modal-1").val(item.DisplayName)
            radio_select_name_file = item.DisplayName;
        }
        radio_select_file_dir = item.DisplayIcon;
        radio_select_file_info = await fs.statSync(radio_select_file_dir);
    }
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

const list_installed_software = async ()=>{
    if($("#list_installed_software").hasClass('show') != true){
        if(_list_installed_software.length == 0 && im_list != true){
            toaster.warning(getNameTd(".please_wait"));
            im_list = true;
            setTimeout(async ()=>{
                var temp_list = await getAllInstalledSoftwareSync();
                temp_list = await temp_list.filter(f => f.DisplayIcon != null && f.DisplayIcon.includes('.exe') == true && fs.existsSync(f.DisplayIcon) == true && !f.DisplayIcon.includes('ProgramData') && !f.DisplayIcon.includes('Windows') && !f.DisplayIcon.includes('System32') && !f.DisplayIcon.includes('unis'));
                $($("#list_installed_software").find('.card-content-spinner')[0]).hide('slow');
                var count_id = 1000;
                temp_list.forEach(item =>{
                    if(item.DisplayIcon.includes(".exe,"))
                        item.DisplayIcon = item.DisplayIcon.split(".exe,")[0]+".exe";
                    item.id_for_select = count_id;

                    $("#list_software").append(`<div class="form-check form-check-for-${item.id_for_select}">
                        <input class="form-check-input" type="radio" onClick='installed_software_select(${item.id_for_select})' name="flexRadioDefault" id="radio-select-${item.id_for_select}">
                        <label class="form-check-label" for="radio-select-${item.id_for_select}">
                          ${item.DisplayName}
                        </label>
                        <button title="${getNameTd(".locate_dir")} " class="btn btn-primary btn-sm-custom float-right" onClick="open_file_brosewr(${item.id_for_select})"><i class="bi bi-folder-fill"></i></button>
                    </div>`);
                    _list_installed_software.push(item);
                    count_id = count_id+1;
                })
            }, 1000);
        }
    }
}

const change_position_list = async ()=>{
    let listApps = await DAO.ProgramsExe.get('list_programs');
    var con = 1, list = [];
    for (let index = 0; index < $(".list_apps div.col").length; index++) {
        const element = $(".list_apps div.col")[index];
        var _ir = element.id.replaceAll('col-exe-id-', '');
        list.push({pos: index+1, _id: _ir});

        if(element == $(".list_apps div.col")[$(".list_apps div.col").length-1]){
            var new_l = [];
            listApps.forEach(async e => {
                var dtr = await list.filter(f => f._id == e._id)[0];
                if(dtr){
                    e.positon_l = dtr.pos;
                }
                await new_l.push(e);
                if(e == listApps[listApps.length-1]){
                    await DAO.ProgramsExe.set('list_programs', await new_l.sort( compare_positon_l ));
                }
            })
        }
    }
}
