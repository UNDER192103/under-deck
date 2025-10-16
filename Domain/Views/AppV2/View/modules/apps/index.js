
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  RGSFC('InListInstalledSoftwares', false);
  RGSFC('SelectedFileSoftware', null);
  RGSFC('ListInstalledSoftwares', []);
  RGSFC('DataAddApp', {
    dataType: {
      id: '',
      type: '',
      textid: '',
      mclass: ''
    },
    hash: null,
    lastModified:"",
    lastModifiedDate:"",
    name:"",
    path:"",
    obsAction:null,
    obsOption:null,
    type:"",
    size:"",
    icon: GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png"),
    pos:"",
    typeExec:"",
  });
  RGSFC('DataEditApp', null);
  LoadApps();
}
RGSFC('LoadApps', async function() {
  try {
    $('.content-files-add').html('');
    for (let index = 0; index < GlobalValues.AppData.Apps.length; index++) {
      const App = GlobalValues.AppData.Apps[index];
      //console.log(App);
      await AppendAppHtml(App);
    }
  }
  catch (error) {
    console.log(error);
  }
})

let TimeOutTooltipExe = null;
function AppendAppHtml(App) {
  if(!App.name) return;
  let Name = App.name;
  if(!App.icon) App.icon = GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png");
  let bgs = 'bg-light';
  let bgDropdownMenu = "dropdown-menu-light";
  if (GlobalValues.AppData.AppTheme.selected?.class == 'black') {
      bgs = 'bg-black';
      bgDropdownMenu = "dropdown-menu-black";
  }
  $('.content-files-add').append(`
      <div data-id="${App.uuid}" class="m-0 col-app-exe col-md-4 col-xl-2 transition-all col animate__animated animate__fadeIn col-exe">
          <div class="card rounded-3 rigth-click-exe hover-exes border border-4 rounded ${bgs}">
              <div class="d-btn-exe-F m-1 d-flex flex-row-reverse">
                  <span class="dropdown-toggle dropdown-toggle-c fillter-shadow-text hover-icon-edit" data-bs-auto-close="*" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <a class="nav-link tooltip-script hover_rotation" title="${GetNameTd(".tooltip_config_t")}" data-toggle="tooltip" href="#" id="dropdownMenuLink-exe-id-${App.uuid}"><i class="bi bi-gear-wide"></i></a>
                  </span>
                  <ul class="dropdown-menu fillter-shadow-box ${bgDropdownMenu}" aria-labelledby="dropdownMenuLink-exe-id-${App.uuid}">
                      <li data-id="${App.uuid}" class=""><a class="dropdown-item ligth" href="#"><i class="bi bi-plus-square"></i> <span class="add_macro_text">${GetNameTd(".add_macro_text")}</span></a></li>
                      <li data-id="${App.uuid}" class="StartAppExe"><a class="dropdown-item ligth" href="#"><i class="bi bi-filetype-exe"></i> <span class="start_text">${GetNameTd(".start_text")}</span></a></li>
                      <li data-id="${App.uuid}" class="EditAppExe" type="button"><a class="dropdown-item" href="#"><i class="bi bi-pen text-success"></i> <span class="edit_text">${GetNameTd(".edit_text")}</span></a></li>
                      <li data-id="${App.uuid}" class="DeleteAppExe"><a class="dropdown-item ligth" href="#"><i class="bi bi-trash3 text-danger"></i> <span class="delete_text">${GetNameTd(".delete_text")}</span></a></li>
                  </ul>
              </div>
              <img src="sys:///${encodeURI(App.icon.replace(/\\/g, '/'))}" class="card-img-top w-100 mh-iconapp mb-0 auto-left-right" alt="...">
              
              <div class="d-footer-exe card-body text-center">
                  <h5 class="card-title text-light tooltip-script u-format-max-text exeT m-0 cursor-pointer" title="${Name}" data-toggle="tooltip">${Name}</h5>
              </div>
          </div>
      </div>
  `);
  clearTimeout(TimeOutTooltipExe);
  TimeOutTooltipExe = setTimeout(() => { $(".tooltip-script").tooltip(); }, 500);
}

$(document).on('dblclick', '.col-app-exe', function (Event) {
  Event.preventDefault();
  GlobalValues.ExecAppByUuid($(this).data('id'));
});

$(document).on('click', '.StartAppExe', function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  GlobalValues.ExecAppByUuid($(this).data('id'));
});

$(document).on('click', '.EditAppExe', function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  DataEditApp = GlobalValues.AppData.Apps.find(f => f.uuid == $(this).data('id'));
  if(DataEditApp){
    if(DataEditApp.typeExec == 'audio'){
      $("#DEditAppViewFileAudio").show();
      $("#DEditAppViewFileAudio audio").attr('src', `sys:///${DataEditApp.path}`);
      $("#DEditAppViewFileAudio audio")[0].load();
    }
    else if(DataEditApp.typeExec == 'soundpad_audio'){
      let soundpadAudio = SoundPadAudios.find(f => f.hash == DataEditApp.hash);
      if(soundpadAudio){
        $("#DEditAppViewFileAudio").show();
        $("#DEditAppViewFileAudio audio").attr('src', `sys:///${soundpadAudio.path}`);
        $("#DEditAppViewFileAudio audio")[0].load();
      }
    }
    else{
      $("#DEditAppViewFileAudio").hide();
    }
    $("#name-exe-modal").val(DataEditApp.name);
    $("#previwSeletedIconEditApp").attr('src', `sys:///${DataEditApp.icon}`);
    $(`#modal-edit-exe`).modal('show');
  }
});

$(document).on('click', '.DeleteAppExe', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  let app = GlobalValues.AppData.Apps.find(f => f.uuid == $(this).data('id'));
  if(app && await GlobalValues.ModalConfirmAreYouSure()){
    await window.api.invoke('DeleteApp', app);
    await GlobalValues.GetAllAppData();
    LoadApps();
  }
});

$(document).on('mousedown', '.btn-SaveEditApp', async function (Event) {
  if(DataEditApp){
    DataEditApp.name = $("#name-exe-modal").val();
    if(DataEditApp.name.length == 0){
      toaster.warning(`${GetNameTd('.requere_name_add_app')}`);
      return;
    }
    await window.api.invoke('EditApp', DataEditApp);
    $(".div-edit-url").addClass("hidden");
    $(".div-edit-cmd").addClass("hidden");
    $("#edit-url-add-app").val("");
    $("#edit-cmd-add-app").val("");
    $('.btn-close-exe-modal').click();
    $("#icon-exe-edit").val('');
    await GlobalValues.GetAllAppData();
    LoadApps();
    toaster.success(`${GetNameTd('.Successfully_edited')}`);
    window.api.invoke('OV-Update-data', {type: 'apps', data: []});
  }
  $("#DEditAppViewFileAudio").hide();
  $(`#modal-edit-exe`).modal('hide');
});

$(document).on('mousedown', '.rigth-click-exe', function (Event) {
    if (Event.button == 2) {
        $(Event.currentTarget).find('.dropdown-toggle').click();
    }
});

$(document).on('click', '.btn-ClearDataAddApp', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  ClearFormAddApp();
});

$(document).on('click', '.btn-ListInstalledSoftwares', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  if(ListInstalledSoftwares.length > 0){
    return;
  }
  InListInstalledSoftwares = true;
  $($("#list_installed_software").find('.card-content-spinner')[0]).show('slow');
  window.api.invoke('GetAllInstalledSoftwareSync').then(async list => {
    InListInstalledSoftwares = false;
    ListInstalledSoftwares = list;
    ListInstalledSoftwares = await ListInstalledSoftwares.filter(f => f.DisplayIcon != null && f.DisplayIcon.includes('.exe') == true && !f.DisplayIcon.includes('uninstall') && !f.DisplayIcon.includes('ProgramData') && !f.DisplayIcon.includes('Windows') && !f.DisplayIcon.includes('System32') && !f.DisplayIcon.includes('unis'));
    $($("#list_installed_software").find('.card-content-spinner')[0]).hide('slow');
    let count_id = 1000;
    $("#list_software").html("");
    ListInstalledSoftwares.forEach(item => {
        if (item.DisplayIcon.includes(".exe,")) item.DisplayIcon = item.DisplayIcon.split(".exe,")[0] + ".exe";
        item.id_for_select = count_id;
        $("#list_software").append(`<div class="form-check form-check-for-${item.id_for_select}">
            <input class="form-check-input" type="radio" name="RadioInstalledSoftware" id="radio-select-${item.id_for_select}">
            <label class="form-check-label" for="radio-select-${item.id_for_select}">
              ${item.DisplayName}
            </label>
            <button type="button" data-id="${item.id_for_select}" title="${GetNameTd(".locate_dir")} " class="btn btn-primary btn-sm-custom float-right btn-OpenFolderInstalledSoftware"><i class="bi bi-folder-fill"></i></button>
        </div>`);
        count_id = count_id + 1;
    })
  });
});

$(document).on('click', '.btn-OpenFolderInstalledSoftware', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  let item = ListInstalledSoftwares.find(f => f.id_for_select == $(this).data('id'));
  if(item){
    window.api.invoke('TryOpenFolderInstalledSoftware', item.DisplayIcon);
  }
  
});

$(document).on('click', '.btn-AddAppSelecIcon', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'Imagens', ext: ['jpg', 'jpeg', 'png', 'gif'] }
    ]
  });
  if(!filePath){
    DataAddApp.icon = GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png");
  }
  else{
    DataAddApp.icon = filePath;
  }

  $("#previwSeletedIconAddApp").attr('src', `sys:///${DataAddApp.icon}`);
})

$(document).on('click', '.btn-AddAppSelecAudioFile', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'Audios', ext: ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'flac'] }
    ]
  });
  if(!filePath){
    DataAddApp.path = '';
  }
  else{
    DataAddApp.path = filePath;
  }

  $("#AddAppAudioPlayer").attr('src', `sys:///${DataAddApp.path}`);
  $("#AddAppAudioPlayer")[0].load();
})

$(document).on('click', '.btn-EditAppSelecIcon', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  if(!DataEditApp) return;
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'Imagens', ext: ['jpg', 'jpeg', 'png', 'gif'] }
    ]
  });
  if(!filePath){
    DataEditApp.icon = GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png");
  }
  else{
    DataEditApp.icon = filePath;
  }

  $("#previwSeletedIconEditApp").attr('src', `sys:///${DataEditApp.icon}`);
})

$(document).on('click', '.opt-select-add-app', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  DataAddApp.dataType = {
    id: $(this).data('id'),
    type: $(this).data('type'),
    textid: $(this).data('textid'),
    mclass: $(this).data('mclass')
  }
  $("#previwSeletedIconAddApp").attr('src', `sys:///${GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png")}`);
  $("#icon-custom-add-app").val('');
  $('.alert-add-app').html(``).hide();
  $("#formselecCustomIcon").addClass("hidden");
  $("#formselecCustomName").addClass("hidden");
  $("#inputs-add-audio-input").addClass("hidden");
  $("#inputs-add-discord-integration").addClass("hidden");
  $("#inputs-add-options-os-integration").addClass("hidden");
  $("#soundpad-add-app").addClass("hidden");
  $("#input-app-audio").val('');
  $("#select-obs-scene").val('');
  $('#select-audios-inputs').val('');
  $("#inputs-add-exe").addClass("hidden");
  $("#inputs-add-web-page-url").addClass("hidden");
  $("#inputs-add-cmd-input").addClass("hidden");
  $("#obs-add-app-t").addClass("hidden");
  $("#name-c-to-app").val("");
  $(".select-SoundpadAudioAddApp").val("");
  $("#url-add-app").val("");
  $("#cmd-add-app").val("");
  $('#input-app-exec').val("");
  $('#input-app-audio').val("");
  $("#name-custom-obs-scene").val("");
  $("#select-obs-options").val('');
  $("#select-AddAppDiscordTypeIntegration").val('');
  $("#select-AddAppOptionsOsIntegration").val('');
  $("#AddAppAudioPlayer").attr('src', ``);
  $("#input-path-app-exec").val('');
  $('input[name="RadioInstalledSoftware"]').prop('checked', false);
  if(DataAddApp.dataType.id && DataAddApp.dataType.type && DataAddApp.dataType.textid && DataAddApp.dataType.mclass){
    if (DataAddApp.dataType.id == 'obs_wss') {
        if (await window.api.invoke('Obs_wss_p', { stage: 'is_started' }) != true) {
            $('.alert-add-app').html(`
                ${GetNameTd('.plsconfigureandconnectwssobs')} <a class='a-style btn-RedirectToObsStudioPageAddApp'>${GetNameTd('.obs_studio_n_text')}</a>.
            `).show('slow');
            DataAddApp.dataType = {
              id: '',
              type: '',
              textid: '',
              mclass: ''
            };
            return;
        }
    }
    DataAddApp.typeExec = DataAddApp.dataType.id;
    $("#bnt-SelectTypeAddApp").text(GetNameTd(DataAddApp.dataType.textid));
    $("#formselecCustomIcon").removeClass("hidden");
    $("#formselecCustomName").removeClass("hidden");
    $(DataAddApp.dataType.mclass).removeClass("hidden");
  }
});

$(document).on('click', '.btn-RedirectToObsStudioPageAddApp', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  $("#modal-add-app").modal('hide');
  SelectMenu('obs-studio');
});

$(document).on('click', '.btn-AddNewApp', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  FormAddAppPost();
});

$(document).on('change', '.select-SoundpadAudioAddApp', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  DataAddApp.hash = $(this).val();
  if(SoundPadAudios.find(f => f.hash == DataAddApp.hash)){
    if($("#name-c-to-app").val().length == 0){
      $("#name-c-to-app").val(SoundPadAudios.find(f => f.hash == DataAddApp.hash).name);
      DataAddApp.name = $("#name-c-to-app").val();
    }
  }
  else{
    $(this).val('');
    DataAddApp.hash = $(this).val();
  }
});

$(document).on('change', '#select-obs-scene', async function (Event){
  Event.preventDefault();
  Event.stopPropagation();
  $('#select-audios-inputs').val('');
  $('#select-obs-options').val('');
  if($("#name-c-to-app").val() == '') $("#name-c-to-app").val($(this).find('option:selected').text());
})

$(document).on('change', '#select-audios-inputs', async function (Event){
  Event.preventDefault();
  Event.stopPropagation();
  $('#select-obs-scene').val('');
  $('#select-obs-options').val('');
  if($("#name-c-to-app").val() == '') $("#name-c-to-app").val($(this).find('option:selected').text());
})

$(document).on('change', '#select-obs-options', async function (Event){
  Event.preventDefault();
  Event.stopPropagation();
  $('#select-obs-scene').val('');
  $('#select-audios-inputs').val('');
  if($("#name-c-to-app").val() == '') $("#name-c-to-app").val($(this).find('option:selected').text());
})

$(document).on('click', '.btn-UpdateListObs', async function (Event){
  Event.preventDefault();
  Event.stopPropagation();
  OBS_TEMP_DATA = {scenes:[], audios:[]};
  UpdateListObs(false);
})

$(document).on('click', '.btn-AddAppSelecFileExec', async function (Event){
  Event.preventDefault();
  Event.stopPropagation();
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'Audios', ext: ['exe', 'msi'] }
    ]
  });
  if(!filePath){
    SelectedFileSoftware = null;
    DataAddApp.path = '';
    $("#input-path-app-exec").val('');
  }
  else{
    SelectedFileSoftware = filePath;
    DataAddApp.path = filePath;
    $("#input-path-app-exec").val(filePath);
  }
})

$(document).ready(async () => {
  setTimeout(()=>{
    $(".list_apps").sortable({
        start: (Event) => {
            GetElmByParentsClass(Event.originalEvent.target, 'col-exe', (elem) => { elem.removeClass('transition-all').css('cursor', 'move') });
        },
        stop: (Event) => {
          GetElmByParentsClass(Event.originalEvent.target, 'col-exe', (elem) => { elem.addClass('transition-all').css('cursor', ''); });
          UpdateAppsPositions();
        },
    });
  }, 500);
  $(".list_apps").disableSelection();
});

RGSFC('GetElmByParentsClass', function(elem, _class, callback) {
    let el = $($(elem).parent()[0]);
    if (el.hasClass(_class)) callback($(el[0])); else GetElmByParentsClass(el, _class, callback);
});

RGSFC('UpdateAppsPositions', async function() {
    var list = [];
    for (let index = 0; index < $(".list_apps div.col").length; index++) {
        const element = $($(".list_apps div.col")[index]);
        if(element && element.data('id')){
          list.push({ pos: index + 1, uuid: element.data('id') });
        }
        if (index == $(".list_apps div.col").length - 1) {
            GlobalValues.AppData.Apps = await GlobalValues.UpdateAppsPositions(list);
        }
    }
});

RGSFC('ClearFormAddApp', async function() {
  $("#modal-add-app").modal('hide');
  $("#previwSeletedIconAddApp").attr('src', `sys:///${GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png")}`);
  $("#icon-custom-add-app").val('');
  $("#inputs-add-exe").addClass("hidden");
  $("#formselecCustomIcon").addClass("hidden");
  $("#formselecCustomName").addClass("hidden");
  $("#inputs-add-audio-input").addClass("hidden");
  $("#inputs-add-discord-integration").addClass("hidden");
  $("#inputs-add-options-os-integration").addClass("hidden");
  $("#soundpad-add-app").addClass("hidden");
  $("#inputs-add-web-page-url").addClass("hidden");
  $("#inputs-add-cmd-input").addClass("hidden");
  $("#obs-add-app-t").addClass("hidden");
  $('#bnt-SelectTypeAddApp').text(GetNameTd(".select_text"));
  $('.alert-add-app').text("").hide();
  $("#name-c-to-app").val("");
  $(".select-SoundpadAudioAddApp").val("");
  $("#url-add-app").val("");
  $("#cmd-add-app").val("");
  $("#input-app-audio").val('');
  $("#name-custom-obs-scene").val("");
  $("#select-obs-scene").val('');
  $('#select-audios-inputs').val('');
  $("#select-obs-options").val('')
  $("#select-AddAppDiscordTypeIntegration").val('');
  $("#select-AddAppOptionsOsIntegration").val('');
  $("#list_software").html("");
  $($("#list_installed_software").find('.card-content-spinner')[0]).show('slow');
  $("#list_installed_software").collapse('hide');
  $("#AddAppAudioPlayer").attr('src', ``);
  $("#input-path-app-exec").val('');
  $('input[name="RadioInstalledSoftware"]').prop('checked', false);
  DataAddApp = {
    dataType: {
      id: '',
      type: '',
      textid: '',
      mclass: ''
    },
    hash: null,
    lastModified:"",
    lastModifiedDate:"",
    name:"",
    path:"",
    obsAction:null,
    obsOption:null,
    type:"",
    size:"",
    icon: GlobalValues.PathJoin(GlobalValues.AppData.AppPath, "Domain/src/img/underbot_logo.png"),
    pos:"",
    typeExec:"",
  }
  window.api.invoke('OV-Update-data', {type: 'apps', data: []});
});

RGSFC('FormAddAppPost', async function() {
  $(".alert.alert-add-app").html('').hide('slow');
  function CheckURC(){
    DataAddApp.name = $("#name-c-to-app").val();
    if (DataAddApp.name.length == 0) {
        toaster.warning(GetNameTd(".requere_name_add_app"));
        $('.alert.alert-add-app').text(GetNameTd(".requere_name_add_app")).show('slow');
        $("#name-c-to-app").focus();
        return;
    }
    return true;
  }
  switch (DataAddApp.dataType.id) {

    case 'discord':
      if(CheckURC()){
        if($("#select-AddAppDiscordTypeIntegration").val() == ''){
          toaster.warning(GetNameTd(".requere_cmd_add_app"));
          $('.alert-add-app').text(GetNameTd(".requere_cmd_add_app")).show('slow');
          $('#select-AddAppDiscordTypeIntegration').focus();
          return;
        }
        DataAddApp.hash =  null;
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.path = $("#select-AddAppDiscordTypeIntegration").val();;
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.type = "";
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

    case 'audio':
      if(CheckURC()){
        if (!DataAddApp.path || DataAddApp.path == '') {
            toaster.warning(GetNameTd(".p_s_a_audio_text"));
            $('.alert-add-app').text(GetNameTd(".p_s_a_audio_text")).show('slow');
            $('.btn-AddAppSelecAudioFile').focus();
            return;
        }
        DataAddApp.hash =  null;
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

    case 'exe':
      if(CheckURC()){
        if(SelectedFileSoftware){
          DataAddApp.path = SelectedFileSoftware;
          DataAddApp.hash =  null;
          DataAddApp.lastModified = "";
          DataAddApp.lastModifiedDate = "";
          DataAddApp.obsAction = null;
          DataAddApp.obsOption = null;
          DataAddApp.type = "";
          DataAddApp.size = "";
        }
        else{
          let selectedSoftwareId = $('input[name="RadioInstalledSoftware"]:checked').attr('id');
          if (selectedSoftwareId) {
              let id = selectedSoftwareId.replace('radio-select-', '');
              let item = ListInstalledSoftwares.find(f => f.id_for_select == id);
              if (item) {
                  DataAddApp.path = item.DisplayIcon.replaceAll('"', '');;
                  if(DataAddApp.name == ''){
                    DataAddApp.name = item.DisplayName;
                    $("#name-c-to-app").val(DataAddApp.name);
                  }
                  DataAddApp.hash =  null;
                  DataAddApp.lastModified = "";
                  DataAddApp.lastModifiedDate = "";
                  DataAddApp.obsAction = null;
                  DataAddApp.obsOption = null;
                  DataAddApp.type = "";
                  DataAddApp.size = "";
              }
          } else {
              toaster.warning(GetNameTd(".p_s_a_e_text"));
              $('.alert-add-app').text(GetNameTd(".p_s_a_e_text")).show('slow');
              return;
          }
        }
        SerialiseAddApp();
      }
    break;

    case 'cmd':
      if(CheckURC()){
        if ($("#cmd-add-app").val().length == 0) {
            toaster.warning(GetNameTd(".requere_cmd_add_app"));
            $('.alert-add-app').text(GetNameTd(".requere_cmd_add_app")).show('slow');
            $('#cmd-add-app').focus();
            return;
        }
        DataAddApp.hash =  null;
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.path = $("#cmd-add-app").val();
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.type = "";
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

    case 'obs_wss':
      if(CheckURC()){
        if (OBS_TEMP_DATA != null && OBS_TEMP_DATA.scenes.scenes.length > 0) {
            var scene = OBS_TEMP_DATA.scenes.scenes.find(f => f.sceneUuid == $('#select-obs-scene').val());
            var input_audio = OBS_TEMP_DATA.audios.inputs.find(f => f.inputUuid == $("#select-audios-inputs").val());
            if(!input_audio && !scene && $('#select-obs-options').val() == '') {
                toaster.danger(GetNameTd('.pls_select_obs_scene'));
                $('.alert-add-app').text(GetNameTd(".pls_select_obs_scene")).removeClass('hidden');
                return;
            }
            DataAddApp.hash =  null;
            DataAddApp.lastModified = "";
            DataAddApp.lastModifiedDate = "";
            DataAddApp.path = '';
            DataAddApp.obsAction = $('#select-obs-scene').val() || $("#select-audios-inputs").val() || $("#select-obs-options").val();
            DataAddApp.obsOption = $('#select-obs-scene').val() ? 'scene' : $("#select-audios-inputs").val() ? 'audio' : $("#select-obs-options").val() ? 'obs_options' : null;
            DataAddApp.type = "";
            DataAddApp.size = "";
            SerialiseAddApp();
        }
        else {
            toaster.danger(GetNameTd('.pls_update_list_scene'));
            $('.alert-add-app').text(GetNameTd(".pls_update_list_scene")).removeClass('hidden');
            return;
        }
      }
    break;

    case 'soundpad_audio':
      if(CheckURC()){
        if (!DataAddApp.hash || DataAddApp.hash == '') {
            toaster.warning(GetNameTd(".p_s_a_s_soundpad_audio_text"));
            $('.alert-add-app').text(GetNameTd(".p_s_a_s_soundpad_audio_text")).show('slow');
            $('.select-SoundpadAudioAddApp').focus();
            return;
        }
        await GlobalValues.GetAllAppData();
        if(GlobalValues.AppData.Apps.find(f => f.hash == DataAddApp.hash)){
          toaster.warning(GetNameTd(".this_is_soundpad_already_registered"));
          $('.alert-add-app').text(GetNameTd(".this_is_soundpad_already_registered")).show('slow');
          return;
        }
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.path = ''
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.type = "";
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

    case 'web_page':
      if(CheckURC()){
        if ($("#url-add-app").val().length == 0) {
            toaster.warning(GetNameTd(".requere_url_add_app"));
            $('.alert-add-app').text(GetNameTd(".requere_url_add_app")).show('slow');
            $('#url-add-app').focus();
            return;
        }
        DataAddApp.hash =  null;
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.path = $("#url-add-app").val();
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.type = "";
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

    case 'options_os':
      if(CheckURC()){
        if($("#select-AddAppOptionsOsIntegration").val() == ''){
          toaster.warning(GetNameTd(".requere_cmd_add_app"));
          $('.alert-add-app').text(GetNameTd(".requere_cmd_add_app")).show('slow');
          $('#select-AddAppDiscordTypeIntegration').focus();
          return;
        }
        DataAddApp.hash =  null;
        DataAddApp.lastModified = "";
        DataAddApp.lastModifiedDate = "";
        DataAddApp.path = $("#select-AddAppOptionsOsIntegration").val();
        DataAddApp.obsAction = null;
        DataAddApp.obsOption = null;
        DataAddApp.type = "";
        DataAddApp.size = "";
        SerialiseAddApp();
      }
    break;

  
    default:
      $(".alert.alert-add-app").html(GetNameTd('.err_select_type_add_text')).show('slow');
      toaster.danger(GetNameTd('.err_select_type_add_text'));
    break;
  }
});

RGSFC('SerialiseAddApp', async function() {
  let dataApp = {...DataAddApp};
  delete dataApp.dataType;
  await window.api.invoke('AddApp', dataApp);
  await GlobalValues.GetAllAppData();
  LoadApps();
  ClearFormAddApp();
  toaster.success(`${GetNameTd('.Added_successfully')}`);
})