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
    $("#list-scenes").html('');
    $(".sl-auto-rm").remove();
    await DAO.OBS.set('data_scenes', null);
    $("#list-audios-inputs").html('');
    $(".ai-auto-rm").remove();
    await DAO.OBS.set('data_audios_inputs', null);

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
    toaster.success(getNameTd(".obswssconneted"), 5000);
  }

  if(dt.connected == true && dt.stage != "list_all_scenes" && dt.stage != "list_all_audio_inputs"){
    $("#button-obs-wss-s-s")
    .removeClass('connect-obs hover-pulse-grean btn-success')
    .addClass('desconnect-obs hover-pulse-red btn-danger')
    .html(getNameTd(".desconnect-obs"));
    if(dt.notify != false){
      toaster.warning(getNameTd(".listing_the_scenes_please_wait"), 2000);
      toaster.warning(getNameTd(".listing_the_audio_inputs_please_wait"), 2000);
    }
    BACKEND.Send('Obs_wss_p', {stage: 'list_all_scenes', notify: dt.notify});
    BACKEND.Send('Obs_wss_p', {stage: 'list_all_audio_inputs', notify: dt.notify});
  }
  else if(dt.connected == false || dt.desconnected == true){
    $("#button-obs-wss-s-s")
    .removeClass('desconnect-obs hover-pulse-red btn-danger')
    .addClass('connect-obs hover-pulse-grean btn-success')
    .html(getNameTd(".connect-obs"));
    $("#list-scenes").html('');
    $(".sl-auto-rm").remove();
    await DAO.OBS.set('data_scenes', null);
    $("#list-audios-inputs").html('');
    $(".ai-auto-rm").remove();
    await DAO.OBS.set('data_audios_inputs', null);
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

  if(dt.stage == 'list_all_scenes' && dt.res != null){
    $("#list-scenes").html('');
    $(".sl-auto-rm").remove();
    await DAO.OBS.set('data_scenes', dt.res);
    dt.res.scenes.reverse();
    var con = 1;
    dt.res.scenes.forEach(element => {
      var is_active = getNameTd(".not");
      if(element.sceneName == dt.res.currentProgramSceneName)
        is_active = getNameTd(".yes");
      $("#list-scenes").append(`
        <tr class="hover-color-primary" id="${element.sceneUuid}">
          <td>${con}</td>
          <td>${element.sceneName}</td>
          <td>${is_active}</td>
          <td><button type="button" onclick="select_scene_obs('${element.sceneName}', '${element.sceneUuid}')" class="btn btn-sm btn-primary"><i class="bi bi-arrow-left-right"></i></button></td>
        </tr>
      `);
      $("#select-obs-scene").append(`<option class="sl-auto-rm" id="sl-${element.sceneUuid}" value="${element.sceneUuid}">${element.sceneName}</option>`);
      con++;
    });
    if(dt.notify != false)
      toaster.success(getNameTd(".scenes_listed_text"), 2500);
  }

  if(dt.stage == 'list_all_audio_inputs' && dt.res != null){
    $("#list-audios-inputs").html('');
    $(".ai-auto-rm").remove();
    await DAO.OBS.set('data_audios_inputs', dt.res);
    var con = 1;
    dt.res.inputs.forEach(async element => {
      $("#list-audios-inputs").append(`
        <tr class="hover-color-primary" id="${element.inputUuid}">
          <td>${con}</td>
          <td>${element.inputName}</td>
          <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', true)" class="btn btn-sm btn-danger"><i class="bi bi-volume-mute-fill"></i></button></td>
          <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', false)" class="btn btn-sm btn-primary"><i class="bi bi-volume-up-fill"></i></button></td>
        </tr>
      `);
      $("#select-audios-inputs").append(`<option class="ai-auto-rm" id="ai-${element.inputUuid}" value="${element.inputUuid}">${element.inputName}</option>`);
      con++;
    });
    if(dt.notify != false)
      toaster.success(getNameTd(".obs_inputs_audio_listed_text"), 2500);
  }
});

const mute_or_desmute_input = async (inputName, inputUuid, inputMuted)=>{
  await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', inputMuted: inputMuted, inputName: inputName, inputUuid: inputUuid});
}

const select_scene_obs = async (name, id)=>{
  await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', sceneName: name, id: id});
}