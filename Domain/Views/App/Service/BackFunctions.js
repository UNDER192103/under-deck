$(".MenuBar .MenuButtons .minimize").click(function () {
  BACKEND.Send('app-minimize', true);
});
$(".MenuBar .MenuButtons .maximize").click(function () {
  BACKEND.Send('app-maximize', true);
});
$(".MenuBar .MenuButtons .close").click(function () {
  BACKEND.Send('app-close', true);
});

//Functions

ipcRenderer.on('ExecMacro', (events, data) => {
  try {
    if(data.macro && data.macro.app)
      exec_program(data.macro.app);
  } catch (error) {
    console.log(error);
  }
});

ipcRenderer.on('ExecAppByUuid', async (events, uuid) => {
  if (uuid) {
    let list = await DAO.ProgramsExe.get('list_programs');
    if(!Array.isArray(list)) list = new Array();
    let app = list.find(f => f.uuid == uuid || f._id == uuid);
    if(app) exec_program(app);
  }
});

ipcRenderer.on('ClientUpdated', async (events, data) => {
  try {loadUserData();} catch (error) {}
});

var inGetPermissions = {};
ipcRenderer.on('UserRequestConnectionPermission', async (events, data) => {
  if (data.Data && data.Data.name) {
      let dataUserRQ = {
        name: data.Data.name,
        client_id: data.Data && data.Data.client_id ? data.Data.client_id : data.From,
      };
      if (!inGetPermissions[dataUserRQ.client_id]) {
          inGetPermissions[dataUserRQ.client_id] = dataUserRQ;
          bootbox.confirm({
              title: `<h3>${getNameTd('.Notice_text')}</h3>`,
              message: `
                  ${getNameTd('.confirm_new_acess_remote_1_text').replaceAll('{{user}}', dataUserRQ.name)}
                  <br><br>
                  ${getNameTd('.Attention_text')}:<br>
                  ${getNameTd('.confirm_new_acess_remote_2_text')}
                  <br><br>
                  OBS:<br>
                  ${getNameTd('.confirm_new_acess_remote_3_text')}
              `,
              buttons: {
                  confirm: {
                      label: getNameTd('.To_accept_text'),
                      className: 'btn-success To_accept_text'
                  },
                  cancel: {
                      label: getNameTd('.To_deny_text'),
                      className: 'btn-danger To_deny_text'
                  }
              },
              callback: async (res) => {
                  if (res) {
                    await BACKEND.Send('AcceptRequestConnection', data);
                    toaster.success(getNameTd('.You_successfully_accept_the_request_text'));
                    delete inGetPermissions[dataUserRQ.client_id];
                  }
                  else {
                      await BACKEND.Send('RejectedRequestConnection', data);
                      toaster.warning(getNameTd('.You_successfully_declined_the_request_text'));
                      delete inGetPermissions[dataUserRQ.client_id];
                  }
              }
          });
      }
      else {
          inGetPermissions[dataUserRQ.client_id] = dataUserRQ;
      }
  }
});

ipcRenderer.on('exec-fbt', async (events, data) => {
  if(data){
    switch (data.type) {
      case 'soundpad':
        exec_soundpad(pathSoundPadExe, data.data.id);
      break;

      case 'webpage':
          var list_webpages = await DAO.DB.get("web_page_saved");
          let webpage = list_webpages.find(f => f.id == data.data.id);
          if(webpage)
            open_webpage(webpage.id, webpage.name.replaceAll(" ", "_"), webpage.url);
      break;

      case 'apps':
        let listApps = await DAO.ProgramsExe.get('list_programs');
        if(!listApps) listApps = [];
        let app = listApps.find(f => f._id == data.data.id);
        if(app) exec_program(app);
      break;

      case 'obs-scene':
        if(data.data){
          select_scene_obs(data.data.sceneName, data.data.sceneUuid);
        }
      break;

      case'obs-audio-mute':
        mute_or_desmute_input(data.data.inputName, data.data.inputUuid, true);
      break;

      case'obs-audio-unmute':
        mute_or_desmute_input(data.data.inputName, data.data.inputUuid, false);
      break;

      case 'discord-toggle-mic':
        DiscordControler.ToggleMute();
      break;

      case 'discord-toggle-audio':
        DiscordControler.ToggleDeafen();
      break;

      case 'discord-mute-mic':
          DiscordControler.Mute();
      break;

      case 'discord-unmute-mic':
          DiscordControler.UnMute();
      break;

      case 'discord-mute-audio':
          DiscordControler.Deafen();
      break;

      case 'discord-unmute-audio':
          DiscordControler.UnDeafen();
      break;
    
      default:
      break;
    }
  }
});

ipcRenderer.on('AutoUpdater', (events, data) => {

  switch (data.code) {
    case -1:
      toaster.danger(data.msg);
      //bootbox.alert(`<h4>${data.msg}</h4>`);
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
      break;

    case -2:
      toaster.danger(data.msg);
      bootbox.alert(`<h4>${data.msg}</h4>`);
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
      break;

    case 0:
      toaster.success(data.msg);
      //bootbox.alert(`<h4>${data.msg}</h4>`);
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
      break;

    case 1:
      toaster.success(data.msg);
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', true);
      bootbox.confirm(
        {
          title: data.msg,
          message: `
            <label>${getNameTd('.version_text')}: ${data.info.version}</label><br>
            <label>${getNameTd('.releaseDate_text')}: ${new Date(data.info.releaseDate).toLocaleString()}</label><br>
            <label>${getNameTd('.releaseName_text')}: ${data.info.releaseName}</label><br>
            <label>${getNameTd('.releaseNotes_text')}:<br><br> ${data.info.releaseNotes.replace('href="', '')}</label><br>
          `,
          buttons: {
            cancel: {
              label: `${getNameTd('.close_text')}`,
              className: "btn-danger"
            },
            confirm: {
              label: `${getNameTd('.download_text')} ${getNameTd('.uupdate_text')}`
            }
          },
          callback: function (result) {
            if (result) {
              BACKEND.Send('app_update_start_download', null).then(response => {
                //console.log(response)
              });
            }
            else {
              $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
            }
          }
        }
      );
      break;

    case 2:

      if (data.info != null && data.info.percent != null) {
        $(".percent_download_update_app").show('slow');
        let txt = ``;
        if (data.info.percent.toString().split('.').length > 1) {
          txt = `${data.info.percent.toString().split('.')[0]}.${data.info.percent.toString().split('.')[1].slice(0, 2)}`;
        }
        else {
          txt = data.info.percent;
        }
        $(".percent_download_app_update").html(txt + "%");
      }
      break;

    case 3:
      toaster.success(data.msg);
      $(".percent_download_update_app").hide('slow');
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
      break;

    case 4:
      toaster.success(data.msg);
      //bootbox.alert(data.msg);
      $(".percent_download_update_app").hide('slow');
      $("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
      break;

    default:
      console.log(data)
      break;
  }

});

ipcRenderer.on('selectMenu', (events, dt) => {
  if (selectMenu) {
    selectMenu(dt)
  }
});

ipcRenderer.on('Obs_wss', async (events, dt) => {
  //if (dt.err) console.log(dt)

  if (dt.err_connection == true) {
    $(".button-obs-wss-s-s")
      .removeClass('hover-pulse-red btn-danger')
      .addClass('hover-pulse-grean btn-success')
      .html(getNameTd(".connect-obs"));
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
        toaster.danger(getNameTd(".invalid-port-or-ip"), 5000);
        break;

      case 4009:
        toaster.danger(getNameTd(".invalidpasswordobswss"), 5000);
        break;

      default:
        toaster.danger(getNameTd(".unabletoconnecttoOBSWebsocket"), 5000);
        break;
    }
    BACKEND.Send('OV-Update-data', {type: 'obsstudio', data: null});
  }
  else if (dt.connected_sucess == true) {
    $(".button-obs-wss-s-s")
      .removeClass('hover-pulse-grean btn-success')
      .addClass('hover-pulse-red btn-danger')
      .html(getNameTd(".desconnect-obs"));
    toaster.success(getNameTd(".obswssconneted"), 2500);
  }

  if (dt.connected == true && dt.stage != "list_all_scenes" && dt.stage != "list_all_audio_inputs") {
    $(".button-obs-wss-s-s")
      .removeClass('connect-obs hover-pulse-grean btn-success')
      .addClass('desconnect-obs hover-pulse-red btn-danger')
      .html(getNameTd(".desconnect-obs"));
    if (dt.stage != "MuteInputAudio")
      await updateListObs(dt.notify);
  }
  else if (dt.connected == false || dt.desconnected == true) {
    $(".button-obs-wss-s-s")
      .removeClass('desconnect-obs hover-pulse-red btn-danger')
      .addClass('connect-obs hover-pulse-grean btn-success')
      .html(getNameTd(".connect-obs"));
    if ($(".footable-list-scenes").data('footable'))
      $(".footable-list-scenes").data('footable').removeRow($(".footable-list-scenes tbody tr"));
    $(".sl-auto-rm").remove();
    OBS_TEMP_DATA.scenes = null;
    if ($(".footable-list-audios-inputs").data('footable'))
      $(".footable-list-audios-inputs").data('footable').removeRow($(".footable-list-audios-inputs tbody tr"));
    $(".ai-auto-rm").remove();
    OBS_TEMP_DATA.audios = null;
    BACKEND.Send('OV-Update-data', {type: 'obsstudio', data: null});
  }


  if (dt.code != null) {
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

var IsFirstPercentSUDP = true;
ipcRenderer.on('sync-user-data-percent', (events, dt) => {
  if(dt.percent){
    if(IsFirstPercentSUDP){ $("body").modalLoading('hide', false); IsFirstPercentSUDP = false; }
    $("#DVIL_percentage_cloud").removeClass('hidden');
    $(".l_percentage_cloud").html(`<span class="ms-1">${dt.percent}%.</span>`);
    $(".progressBarCloud").show();
    $("#DprogressBarCloud").css('width', `${dt.percent}%`).html(`${dt.percent}%`);
  }
});

const updateListObs = async (isNotify = true) => {
  if (isNotify) toaster.warning(getNameTd(".searching_for_information_obs"), 2600);

  BACKEND.Send('Obs_wss_p', { stage: 'get_information_obs', notify: isNotify }).then(async (DTO) => {

    if (DTO.data) {
      BACKEND.Send('OV-Update-data', {type: 'obsstudio', data: DTO.data});
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
            var is_active = getNameTd(".not");
            if (element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = getNameTd(".yes");
            $(".footable-list-scenes tbody").append(`
              <tr class="hover-color-primary animate__animated animate__headShake" id="${element.sceneUuid}">
                <td alt="con">${con}</td>
                <td alt="name">${element.sceneName}</td>
                <td alt="active">${is_active}</td>
                <td alt="button"><button type="button" onclick="select_scene_obs('${element.sceneName}', '${element.sceneUuid}')" class="btn btn-sm btn-primary"><i class="bi bi-arrow-left-right"></i></button></td>
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
          if (isNotify) toaster.success(getNameTd(".scenes_listed_text"), 2500);
        }
        else {
          DTO.data.scenes.scenes.forEach(element => {
            var is_active = getNameTd(".not");
            if (element.sceneName == DTO.data.scenes.currentProgramSceneName) is_active = getNameTd(".yes");
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
              <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', true)" class="btn btn-sm btn-danger"><i class="bi bi-volume-mute-fill"></i></button></td>
              <td><button type="button" onclick="mute_or_desmute_input('${element.inputName}', '${element.inputUuid}', false)" class="btn btn-sm btn-primary"><i class="bi bi-volume-up-fill"></i></button></td>
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
        if (isNotify) toaster.success(getNameTd(".obs_inputs_audio_listed_text"), 2500);
      }

    }
    else{
      BACKEND.Send('OV-Update-data', {type: 'obsstudio', data: null});
    }
  });
}

const mute_or_desmute_input = async (inputName, inputUuid, inputMuted) => {
  await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', isNotify: false, inputMuted: inputMuted, inputName: inputName, inputUuid: inputUuid });
}

const select_scene_obs = async (name, id) => {
  await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', isNotify: false, sceneName: name, id: id });
}