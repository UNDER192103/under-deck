
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  RGSFC('OBS_TEMP_DATA', {scenes:[], audios:[]});
  await LoadObsEvents();
  await window.api.invoke('Obs_wss_p', { stage: 'Status' });
  setTimeout(LoadObsData, 200);
}

RGSFC('LoadObsEvents', async function() {
  window.api.on('Obs_wss', async (dt) => {
    if(!dt) return;
    //console.log(dt);

    if (dt.err_connection == true) {
      $(".button-obs-wss-s-s")
        .removeClass('hover-pulse-red btn-danger')
        .addClass('hover-pulse-grean btn-success')
        .html(GetNameTd(".connect-obs"));
      try {
        $(".footable-list-scenes").data('footable').removeRow($(".footable-list-scenes tbody tr"));
        $(".footable-list-audios-inputs").data('footable').removeRow($(".footable-list-audios-inputs tbody tr"));
      } catch (error) {
        console.log(error);
      }
      $(".sl-auto-rm").remove();
      OBS_TEMP_DATA.scenes = null;
      $(".ai-auto-rm").remove();
      OBS_TEMP_DATA.audios = null;

      switch (dt.code) {
        case -1:
          toaster.danger(GetNameTd(".invalid-port-or-ip"), 5000);
          break;

        case 4009:
          toaster.danger(GetNameTd(".invalidpasswordobswss"), 5000);
          break;

        default:
          toaster.danger(GetNameTd(".unabletoconnecttoOBSWebsocket"), 5000);
          break;
      }
      await window.api.invoke('OV-Update-data', {type: 'obsstudio', data: null});
    }
    else if (dt.connected_sucess == true) {
      $(".button-obs-wss-s-s")
        .removeClass('hover-pulse-grean btn-success')
        .addClass('hover-pulse-red btn-danger')
        .html(GetNameTd(".desconnect-obs"));
      toaster.success(GetNameTd(".obswssconneted"), 2500);
    }

    if (dt.connected == true && dt.stage != "list_all_scenes" && dt.stage != "list_all_audio_inputs") {
      $(".button-obs-wss-s-s")
        .removeClass('connect-obs hover-pulse-grean btn-success')
        .addClass('desconnect-obs hover-pulse-red btn-danger')
        .html(GetNameTd(".desconnect-obs"));
      if (dt.stage != "MuteInputAudio")
        await UpdateListObs(dt.notify);
    }
    else if (dt.connected == false || dt.desconnected == true) {
      $(".button-obs-wss-s-s")
        .removeClass('desconnect-obs hover-pulse-red btn-danger')
        .addClass('connect-obs hover-pulse-grean btn-success')
        .html(GetNameTd(".connect-obs"));
      if ($(".footable-list-scenes").data('footable'))
        $(".footable-list-scenes").data('footable').removeRow($(".footable-list-scenes tbody tr"));
      $(".sl-auto-rm").remove();
      OBS_TEMP_DATA.scenes = null;
      if ($(".footable-list-audios-inputs").data('footable'))
        $(".footable-list-audios-inputs").data('footable').removeRow($(".footable-list-audios-inputs tbody tr"));
      $(".ai-auto-rm").remove();
      OBS_TEMP_DATA.audios = null;
      await window.api.invoke('OV-Update-data', {type: 'obsstudio', data: null});
    }

    if (dt.code != null) {
      switch (dt.code) {
        case 1000:
          toaster.warning(GetNameTd(".obswssdesconnectedss"), 5000);
          break;

        case 1001:
          toaster.danger(GetNameTd(".obswsshbc"), 5000);
          break;

        case 4011:
          toaster.danger(GetNameTd(".obsdisconnectedbywebSocket"), 5000);
          break;

        default:

          break;
      }
    }

  });
})

RGSFC('UpdateListObs', async function(isNotify = true) {
  if (isNotify) toaster.warning(GetNameTd(".searching_for_information_obs"), 2600);
  window.api.invoke('Obs_wss_p', { stage: 'get_information_obs', notify: isNotify }).then(async (DTO) => {
    if (DTO.data) {
      window.api.invoke('OV-Update-data', {type: 'obsstudio', data: DTO.data});
      if (DTO.data.scenes) {
        DTO.data.scenes.scenes.reverse();
        if (OBS_TEMP_DATA.scenes == null || JSON.stringify(OBS_TEMP_DATA.scenes.scenes) != JSON.stringify(DTO.data.scenes.scenes)) {
          $(".footable-list-scenes tbody tr").remove();
          setTimeout(() => {
            $('.footable-list-scenes').footable().trigger('footable_resize');
          }, 100);
          $(".sl-auto-rm").remove();
          OBS_TEMP_DATA.scenes = DTO.data.scenes;
          var con = 1;
          DTO.data.scenes.scenes.forEach(element => {
            var is_active = GetNameTd(".not");
            if (element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = GetNameTd(".yes");
            $(".footable-list-scenes tbody").append(`
              <tr class="hover-color-primary animate__animated animate__headShake" id="${element.sceneUuid}">
                <td alt="con">${con}</td>
                <td alt="name">${element.sceneName}</td>
                <td alt="active">${is_active}</td>
                <td alt="button"><button type="button" onclick="SelectSceneObs('${element.sceneName}', '${element.sceneUuid}')" class="btn btn-sm btn-primary"><i class="bi bi-arrow-left-right"></i></button></td>
              </tr>
            `);
            $("#select-obs-scene").append(`<option class="sl-auto-rm" id="sl-${element.sceneUuid}" value="${element.sceneUuid}">${element.sceneName}</option>`);
            con++;
            if (element == DTO.data.scenes.scenes[DTO.data.scenes.scenes.length - 1]) {
              setTimeout(() => {
                $('.footable-list-scenes').footable().trigger('footable_resize');
              }, 100);
            }
          });
          if (isNotify) toaster.success(GetNameTd(".scenes_listed_text"), 2500);
        }
        else {
          DTO.data.scenes.scenes.forEach(element => {
            var is_active = GetNameTd(".not");
            if (element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = GetNameTd(".yes");
            $(`#${element.sceneUuid} td[alt="active"]`).html(is_active);
          })
        }
      }
      if (DTO.data.audios) {
        $(".footable-list-audios-inputs tbody tr").remove();
        setTimeout(() => {
          $('.footable-list-audios-inputs').footable().trigger('footable_resize');
        }, 100);
        $(".ai-auto-rm").remove();
        OBS_TEMP_DATA.audios = DTO.data.audios;
        var con = 1;
        DTO.data.audios.inputs.forEach(async element => {
          $(".footable-list-audios-inputs tbody").append(`
            <tr class="hover-color-primary animate__animated animate__headShake" id="${element.inputUuid}">
              <td>${con}</td>
              <td>${element.inputName}</td>
              <td><button type="button" onclick="MuteOrDesmuteInput('${element.inputName}', '${element.inputUuid}', true)" class="btn btn-sm btn-danger"><i class="bi bi-volume-mute-fill"></i></button></td>
              <td><button type="button" onclick="MuteOrDesmuteInput('${element.inputName}', '${element.inputUuid}', false)" class="btn btn-sm btn-primary"><i class="bi bi-volume-up-fill"></i></button></td>
            </tr>
          `);
          $("#select-audios-inputs").append(`<option class="ai-auto-rm" id="ai-${element.inputUuid}" value="${element.inputUuid}">${element.inputName}</option>`);
          con++;
          if (element == DTO.data.audios.inputs[DTO.data.audios.inputs.length - 1]) {
            setTimeout(() => {
              $('.footable-list-audios-inputs').footable().trigger('footable_resize');
            }, 100);
          }
        });
        if (isNotify) toaster.success(GetNameTd(".obs_inputs_audio_listed_text"), 2500);
      }
    }
    else{
      window.api.invoke('OV-Update-data', {type: 'obsstudio', data: null});
    }
  });
})

RGSFC('MuteOrDesmuteInput', async function(inputName, inputUuid, inputMuted) {
  return await window.api.invoke('Obs_wss_p', { stage: 'MuteInputAudio', isNotify: false, inputMuted: inputMuted, inputName: inputName, inputUuid: inputUuid });
})

RGSFC('SelectSceneObs', async function(name, id) {
  return await window.api.invoke('Obs_wss_p', { stage: 'select_scene', isNotify: false, sceneName: name, id: id });
})

RGSFC('LoadObsData', async function() {
  $("#obs-checkbox-start").attr('checked', GlobalValues.AppData.Obs.ConnectToWebsocketOnStartup);
  $("#obs-is-config-manual").attr('checked', GlobalValues.AppData.Obs.AutomaticallyDetectSettings);
  if (GlobalValues.AppData.Obs.AutomaticallyDetectSettings == true) {
      $("#obs-wss-port").attr('disabled', true);
      $("#obs-wss-ip").attr('disabled', true);
      $("#obs-wss-password").attr('disabled', true);
      $("#btn-save-osb-port").attr('disabled', true);
      $("#btn-save-osb-password").attr('disabled', true);
  }
  else {
      $("#obs-wss-port").attr('disabled', false);
      $("#obs-wss-ip").attr('disabled', false);
      $("#obs-wss-password").attr('disabled', false);
      $("#btn-save-osb-port").attr('disabled', false);
      $("#btn-save-osb-password").attr('disabled', false);
  }
  if(GlobalValues.AppData.Obs.Configs.Host != null){
    $("#obs-wss-ip").val(GlobalValues.AppData.Obs.Configs.Host);
  }
  if(GlobalValues.AppData.Obs.Configs.Port != null){
    $("#obs-wss-port").val(GlobalValues.AppData.Obs.Configs.Port);
  }
  if(GlobalValues.AppData.Obs.Configs.Password != null){
    $("#obs-wss-password").val(GlobalValues.AppData.Obs.Configs.Password);
  }
})

RGSFC('UpdateObsData', async function(ShowModal = false) {
  if(ShowModal) $("body").modalLoading('show', false);
  GlobalValues.AppData.Obs.ConnectToWebsocketOnStartup = document.getElementById('obs-checkbox-start').checked;
  GlobalValues.AppData.Obs.AutomaticallyDetectSettings = document.getElementById('obs-is-config-manual').checked;
  if(GlobalValues.AppData.Obs.AutomaticallyDetectSettings == true){
    GlobalValues.AppData.Obs.Configs.Host = '';
    GlobalValues.AppData.Obs.Configs.Port = '';
    GlobalValues.AppData.Obs.Configs.Password = '';
  }
  else{
    GlobalValues.AppData.Obs.Configs.Host = $("#obs-wss-ip").val();
    GlobalValues.AppData.Obs.Configs.Port = $("#obs-wss-port").val();
    GlobalValues.AppData.Obs.Configs.Password = $("#obs-wss-password").val();
  }
  await window.api.invoke('UpdateObsData', GlobalValues.AppData.Obs);
  await GlobalValues.GetAllAppData();
  await LoadObsData();
  if(ShowModal) $("body").modalLoading('hide');
})

$(document).on('click', '#obs-checkbox-start', async function (e) {
  await UpdateObsData();
})

$(document).on('click', '#obs-is-config-manual', async function (e) {
  await UpdateObsData();
})

$(document).on('click', '#btn-view-osb-password', async function (e) {
  if($("#obs-wss-password").attr('type') == "text"){
      $("#btn-view-osb-password").html('<i class="bi bi-eye-fill"></i>');
      $("#obs-wss-password").attr('type', 'password');
  }
  else{
      $("#btn-view-osb-password").html('<i class="bi bi-eye-slash-fill"></i>');
      $("#obs-wss-password").attr('type', 'text');
  }
})

$(document).on('click', '#btn-save-osb-port', async function (e) {
  let port = $("#obs-wss-port").val();
  var ip = $("#obs-wss-ip").val();
  if(ip.length > 7 && port.length > 0){
      await UpdateObsData(true);
      toaster.success(GetNameTd('.sucess-save-port-or-ip'));
  }
  else{
      toaster.danger(GetNameTd('.invalid-port-or-ip'));
  }
})

$(document).on('click', '#btn-save-osb-password', async function(){
  if($("#obs-wss-ip").val().length > 7 && $("#obs-wss-port").val().length > 0){
    await UpdateObsData(true);
    toaster.success(GetNameTd('.sucess-save-obs-password'));
  }
  else{
      toaster.danger(GetNameTd('.invalid-port-or-ip'));
  }
})

$(document).on('click', '.button-obs-wss-s-s', async function (e) {
  if (await window.api.invoke('Obs_wss_p', { stage: 'is_started' }) == true) {
      await window.api.invoke('Obs_wss_p', { stage: 'Disconnect' });
  }
  else {
      await window.api.invoke('Obs_wss_p', { stage: 'Connect' });
  }
});
