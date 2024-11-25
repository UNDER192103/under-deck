///      App ready      ///

$(document).ready(async () => {

    $("#btn-update-list-scenes-obs").click(()=>{
        if(old_sbs_scene_selected == $("#name-custom-obs-scene").val())
            $("#name-custom-obs-scene").val('');
        old_sbs_scene_selected = null;
        toaster.warning(getNameTd(".searching_for_information_obs"), 5000);
        BACKEND.Send('Obs_wss_p', {stage: 'list_all_scenes'});
    });

    $("#btn-update-list-audio-input-obs").click(()=>{
        if(old_sbs_scene_selected == $("#name-custom-obs-scene").val())
            $("#name-custom-obs-scene").val('');
        old_sbs_scene_selected = null;
        toaster.warning(getNameTd(".searching_for_information_obs"), 5000);
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
        let port = $("#obs-wss-port").val();
        var ip = $("#obs-wss-ip").val();
        if(ip.length > 7 && port.length > 0){
            GNDATA.server_port = port;
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

    $("#btn-view-osb-password").click(()=>{
        if($("#obs-wss-password").attr('type') == "text"){
            $("#btn-view-osb-password").html('<i class="bi bi-eye-fill"></i>');
            $("#obs-wss-password").attr('type', 'password');
        }
        else{
            $("#btn-view-osb-password").html('<i class="bi bi-eye-slash-fill"></i>');
            $("#obs-wss-password").attr('type', 'text');
        }
    });
    
    if(DAO.OBS.get('Port_wss_obs') != null){
        $("#obs-wss-port").val(DAO.OBS.get('Port_wss_obs'));
    }
    if(DAO.OBS.get('Ip_wss_obs') != null){
        $("#obs-wss-ip").val(DAO.OBS.get('Ip_wss_obs'));
    }
    if(DAO.OBS.get('Pass_wss_obs') != null){
        $("#obs-wss-password").val(DAO.OBS.get('Pass_wss_obs'));
    }

});

///      App ready      ///