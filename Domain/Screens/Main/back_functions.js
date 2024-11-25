const { ipcRenderer } = require("electron");
const { events } = require("lepikevents");

const BACKEND = {
  Update_lang: async (lang)=>{
    return await ipcRenderer.invoke('update_lang', lang);
  },
  New_window: async (data)=>{
    return await ipcRenderer.invoke('new_window', data);
  },
  Send: async (type, data) =>{
    return ipcRenderer.invoke(type, data);
  }
}

//Functions
ipcRenderer.on('selectMenu', (events, dt)=>{
  if(selectMenu){
    selectMenu(dt)
  }
});

ipcRenderer.on('Obs_wss', async (events, dt)=>{
  if(dt.err)
    console.log(dt)

  if(dt.err_connection == true){
    $("#button-obs-wss-s-s")
    .removeClass('hover-pulse-red btn-danger')
    .addClass('hover-pulse-grean btn-success')
    .html(getNameTd(".connect-obs"));
    $(".footable-list-scenes").data('footable').removeRow($(".footable-list-scenes tbody tr"));
    $(".sl-auto-rm").remove();
    OBS_TEMP_DATA.scenes = null;
    $(".footable-list-audios-inputs").data('footable').removeRow($(".footable-list-audios-inputs tbody tr"));
    $(".ai-auto-rm").remove();
    OBS_TEMP_DATA.audios = null;

    switch (dt.code) {
      case -1:
        toaster.danger(getNameTd(".invalid-port-or-ip"), 5000);
      break;

      case 4009:
        toaster.danger(getNameTd(".invalidpasswordobswss"), 5000);
      break;
    
      default:
        toaster.danger(getNameTd(".unabletoconnecttoOBSWebsocket"), 5000);
      break;
    }
  }
  else if(dt.connected_sucess == true){
    $("#button-obs-wss-s-s")
    .removeClass('hover-pulse-grean btn-success')
    .addClass('hover-pulse-red btn-danger')
    .html(getNameTd(".desconnect-obs"));
    toaster.success(getNameTd(".obswssconneted"), 2500);
  }

  if(dt.connected == true && dt.stage != "list_all_scenes" && dt.stage != "list_all_audio_inputs"){
    $("#button-obs-wss-s-s")
    .removeClass('connect-obs hover-pulse-grean btn-success')
    .addClass('desconnect-obs hover-pulse-red btn-danger')
    .html(getNameTd(".desconnect-obs"));
    if(dt.stage != "MuteInputAudio" )
    await updateList(dt.notify);
  }
  else if(dt.connected == false || dt.desconnected == true){
    $("#button-obs-wss-s-s")
    .removeClass('desconnect-obs hover-pulse-red btn-danger')
    .addClass('connect-obs hover-pulse-grean btn-success')
    .html(getNameTd(".connect-obs"));
    if($(".footable-list-scenes").data('footable'))
      $(".footable-list-scenes").data('footable').removeRow($(".footable-list-scenes tbody tr"));
    $(".sl-auto-rm").remove();
    OBS_TEMP_DATA.scenes = null;
    if($(".footable-list-audios-inputs").data('footable'))
      $(".footable-list-audios-inputs").data('footable').removeRow($(".footable-list-audios-inputs tbody tr"));
    $(".ai-auto-rm").remove();
    OBS_TEMP_DATA.audios = null;
  }


  if(dt.code != null){
    switch (dt.code) {
      case 1000:
        toaster.warning(getNameTd(".obswssdesconnectedss"), 5000);
      break;

      case 1001:
        toaster.danger(getNameTd(".obswsshbc"), 5000);
      break;

      case 4011:
        toaster.danger(getNameTd(".obsdisconnectedbywebSocket"), 5000);
      break;
    
      default:

      break;
    }
  }

});

const updateList = async (isNotify = true) =>{
  if(isNotify) toaster.warning(getNameTd(".searching_for_information_obs"), 2600);

  BACKEND.Send('Obs_wss_p', {stage: 'get_information_obs', notify: isNotify}).then(async (DTO) => {
    
    if(DTO.data){

      if(DTO.data.scenes){
        DTO.data.scenes.scenes.reverse();

        if(OBS_TEMP_DATA.scenes == null || JSON.stringify(OBS_TEMP_DATA.scenes.scenes) != JSON.stringify(DTO.data.scenes.scenes)){
          var footableScenes = await $(".footable-list-scenes").data('footable');
          footableScenes.removeRow($(".footable-list-scenes tbody tr"));
          $(".sl-auto-rm").remove();
          OBS_TEMP_DATA.scenes = DTO.data.scenes;
          var con = 1;
          DTO.data.scenes.scenes.forEach(element => {
            var is_active = getNameTd(".not");
            if(element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = getNameTd(".yes");
            footableScenes.appendRow(`
              <tr class="hover-color-primary animate__animated animate__headShake" id="${element.sceneUuid}">
                <td alt="con">${con}</td>
                <td alt="name">${element.sceneName}</td>
                <td alt="active">${is_active}</td>
                <td alt="button"><button type="button" onclick="select_scene_obs('${element.sceneName}', '${element.sceneUuid}')" class="btn btn-sm btn-primary"><i class="bi bi-arrow-left-right"></i></button></td>
              </tr>
            `);
            $("#select-obs-scene").append(`<option class="sl-auto-rm" id="sl-${element.sceneUuid}" value="${element.sceneUuid}">${element.sceneName}</option>`);
            con++;
          });
          if(isNotify) toaster.success(getNameTd(".scenes_listed_text"), 2500);
        }
        else{
          DTO.data.scenes.scenes.forEach(element => {
            var is_active = getNameTd(".not");
            if(element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = getNameTd(".yes");
              $(`#${element.sceneUuid} td[alt="active"]`).html(is_active);
          })
        }
      }

      if(DTO.data.audios){
        var footableAudios = await $(".footable-list-audios-inputs").data('footable');
        footableAudios.removeRow($(".footable-list-audios-inputs tbody tr"));
        $(".ai-auto-rm").remove();
        OBS_TEMP_DATA.audios = DTO.data.audios;
        var con = 1;
        DTO.data.audios.inputs.forEach(async element => {
          footableAudios.appendRow(`
            <tr class="hover-color-primary animate__animated animate__headShake" id="${element.inputUuid}">
              <td>${con}</td>
              <td>${element.inputName}</td>
              <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', true)" class="btn btn-sm btn-danger"><i class="bi bi-volume-mute-fill"></i></button></td>
              <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', false)" class="btn btn-sm btn-primary"><i class="bi bi-volume-up-fill"></i></button></td>
            </tr>
          `);
          $("#select-audios-inputs").append(`<option class="ai-auto-rm" id="ai-${element.inputUuid}" value="${element.inputUuid}">${element.inputName}</option>`);
          con++;
        });
        if(isNotify) toaster.success(getNameTd(".obs_inputs_audio_listed_text"), 2500);
      }

    }

  });
}

const mute_or_desmute_input = async (inputName, inputUuid, inputMuted)=>{
  await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', isNotify: false, inputMuted: inputMuted, inputName: inputName, inputUuid: inputUuid});
}

const select_scene_obs = async (name, id)=>{
  await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', isNotify: false, sceneName: name, id: id});
}