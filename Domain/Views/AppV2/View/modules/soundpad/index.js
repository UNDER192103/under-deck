
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  
  RGSFC('GetSoundPadAudios', async function() { return await window.api.invoke('GetListSoundpadAudios'); })
  RGSFC('GetSoundPadPath', async function() { return await window.api.invoke('GetSoundPadPath'); })
  RGSFC('SoundPadAudios', await GetSoundPadAudios())
  setTimeout(LoadHtmlsSoundPadAudios, 200);
}

RGSFC('LoadHtmlsSoundPadAudios', async () => {
  $(".IRT-SelectSoundpadAudio .IRT-RM").remove();
  $(".TRB-ListSoundsSoundpad").html('')
  $("#local-path-soundpad").val(await GetSoundPadPath());

  SoundPadAudios.forEach(Item => {
    $(".IRT-SelectSoundpadAudio").append(`<option class="IRT-RM" value="${Item.hash}">${Item.name}</option>`);
    $(".TRB-ListSoundsSoundpad").append(`
      <tr class="hover-color-primary animate__animated animate__headShake">
          <td>${Item.index}</td>
          <td>${Item.name}</td>
          <td>${Item.artist}</td>
          <td>${Item.duration}</td>
          <td>${Item.addedOn}</td>
          <td>
              <a data-id="${Item.index}" class="btn btn-light btn-xs btn-PlaySoundpad Play_icon_text">${GetNameTd('.Play_icon_text')}</a>
              <a data-id="${Item.index}" class="btn btn-light btn-xs btn-AddAppPlaySoundpad Add_App_icon_text">${GetNameTd('.Add_App_icon_text')}</a>
          </td>
      </tr>
      `);

      if(Item == SoundPadAudios[SoundPadAudios.length - 1]){
        let table = $('.footable').footable();
        table.trigger('footable_resize');
      }
  });
})

$(document).on('click', '.btn-AddAppPlaySoundpad', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  let sound = SoundPadAudios.find(f => f.index == $(this).data('id'));
  if(sound){
    DataAddApp.name = sound.name;
    DataAddApp.hash = sound.hash;
    DataAddApp.lastModified = "";
    DataAddApp.lastModifiedDate = "";
    DataAddApp.path = ''
    DataAddApp.obsAction = null;
    DataAddApp.obsOption = null;
    DataAddApp.type = "";
    DataAddApp.size = "";
    DataAddApp.typeExec = 'soundpad_audio';
    SerialiseAddApp();
  }
})

$(document).on('click', '#btn-select-soundpad-exe', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'SoundPad', ext: ['exe'] }
    ]
  });
  if (filePath && filePath.toLowerCase().includes('soundpad')) {
      $("#local-path-soundpad").val(filePath);
      await window.api.invoke('UpdateSoundPadPath', filePath);
      toaster.success(GetNameTd('.PswSpeiisycutic_SUCC_text'));
  }
  else {
    let pathSoundPadExe = await GetSoundPadPath()
    if (pathSoundPadExe && pathSoundPadExe.toLowerCase().includes('soundpad')) {
        $("#local-path-soundpad").val(pathSoundPadExe);
    }
    else {
        $("#local-path-soundpad").val(GetNameTd('.select_path_SoundPad_text'));
        pathSoundPadExe = null;
        await DAO.DB.set('pathSoundPad', null);
    }
    bootbox.alert(GetNameTd('.PswSpeiisycutic_ERRO1_text'));
  }
})

$(document).on('click', '.btn-PlaySoundpad', function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  if(SoundPadAudios.find(f => f.index == $(this).data('id'))){
    window.api.invoke('ExecSoundpadAudio', SoundPadAudios.find(f => f.index == $(this).data('id')))
  }
});

$(document).on('click', '#bnt_soundpad_get_list', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  await LoadHtmlsSoundPadAudios();
});

window.api.on('PlayAudioByPath', async (filePath) => {

  if(filePath){
    var audio_token = Math.random().toString(32).substr(2);
    $("#TempContents").append(`
        <audio id="${audio_token}-player" class="hidden" controls='false'>
            <source id="${audio_token}-src" src="sys:///${filePath}">
        </audio>
    `);
    try {
        var instace_audio = $(`#${audio_token}-player`)[0];
        await instace_audio.load();
        $(`#${audio_token}-player`).on('ended', function () {
            $(`#${audio_token}-player`).remove();
        });
        instace_audio.play();
    } catch (error) {
        $(`#${audio_token}-player`).remove();
    }
  }
})
$(document).on('click', '#check-soundpad-exe', async function (Event) {
  if(await window.api.invoke('CheckSoundPadExe')){
    toaster.success("SoundPad OK!");
  }
  else{
    toaster.danger(GetNameTd('.PswSpeiisycutic_ERRO1_text'));
  }
});