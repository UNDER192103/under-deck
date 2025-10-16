
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  LoadEventsSettings();
  setTimeout(LoadSettings, 200);
}
RGSFC('IsFirstPercentSUDP', true);
RGSFC('LoadEventsSettings', async function() {
  window.api.on('PercentageProgressUpdateSettings', (percentage) => {
    if(percentage.percentage){
      $(".l_percentage_cloud").html(`<span class="ms-1">${parseInt(percentage.percentage)}%.</span>`);
      $("#DprogressBarCloud").css('width', `${parseInt(percentage.percentage)}%`).html(percentage.html);
    }
  })

  window.api.on('sync-user-data-percent', (dt) => {
    if(dt.percent){
      if(IsFirstPercentSUDP){ $("body").modalLoading('hide', false); IsFirstPercentSUDP = false; }
      $("#DVIL_percentage_cloud").removeClass('hidden');
      $(".l_percentage_cloud").html(`<span class="ms-1">${parseInt(dt.percent)}%.</span>`);
      $(".progressBarCloud").show();
      $("#DprogressBarCloud").css('width', `${parseInt(dt.percent)}%`).html(`${parseInt(dt.percent)}%`);
    }
  });
})

RGSFC('LoadSettings', async function() {
  $('#isEnableCloudIntegrations').prop('checked', GlobalValues.AppData.Settings.EnableCloudIntegration);
  $('#isActivateOverlay').prop('checked', GlobalValues.AppData.Settings.EnabledKeyOverlay);
  $('#start-with-system').prop('checked', GlobalValues.AppData.Settings.StartWithSystem);
  $('#key-macro').prop('checked', GlobalValues.AppData.Settings.EnabledKeysMacro);
  $('#notifications_on_windows').prop('checked', GlobalValues.AppData.Settings.NotificationsOnWindows);
  $('#isMinimizeToBar').prop('checked', GlobalValues.AppData.Settings.AppMinimizeToBar);

  $("#BTN_cloud_stc").prop('disabled', GlobalValues.AppData.Settings.EnableCloudIntegration ? false : true);
  $("#BTN_cloud_sfc").prop('disabled', GlobalValues.AppData.Settings.EnableCloudIntegration ? false : true);
  $(".key-overlay-r").html(GlobalValues.AppData.Settings.KeysOverlay ? GlobalValues.AppData.Settings.KeysOverlay.join(' + ') : "N/A");
})

RGSFC('UpdateSettings', async function() {
  let res = await await window.api.invoke('UpdateAppSettings', GlobalValues.AppData.Settings);
  window.api.invoke('update_data_macros');
  return res;
})

$(document).on('click', '#isEnableCloudIntegrations', async function (Event) {
  GlobalValues.AppData.Settings.EnableCloudIntegration = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#isActivateOverlay', async function (Event) {
  GlobalValues.AppData.Settings.EnabledKeyOverlay = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#start-with-system', async function (Event) {
  GlobalValues.AppData.Settings.StartWithSystem = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#key-macro', async function (Event) {
  GlobalValues.AppData.Settings.EnabledKeysMacro = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#notifications_on_windows', async function (Event) {
  GlobalValues.AppData.Settings.NotificationsOnWindows = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#isMinimizeToBar', async function (Event) {
  GlobalValues.AppData.Settings.AppMinimizeToBar = $(this).prop('checked');
  await UpdateSettings();
  await GlobalValues.GetAllAppData();
  LoadSettings();
})

$(document).on('click', '#key-overlay', async function (Event) {
  let key_sequence_press = [];
  $("#key-overlay").html(GetNameTd(".recording_text")).addClass("pulse-red");
  window.api.invoke('get_combo_keys', null).then((listKeys) => {
      $("#key-overlay").blur().removeClass("pulse-red").html(GetNameTd(".edit_shortcut_text"));
      $(".key-overlay-r").html(listKeys.join(' + '));
      window.api.invoke('SetKeysOverlay', listKeys);
  });
})

$(document).on('click', '#IMPORTLOCALFILECONFIGS', async function (Event) {
  const filePath = await window.api.invoke('Dialog--SelectFile', {
    types: [
      { nameFile: 'File Config undcf', ext: ['undcf'] }
    ]
  });
  if(filePath){
    if(!filePath.includes('undcf')){
      toaster.danger(GetNameTd('.Please_select_the_file_correctly'));
      return;
    }
    if(await GlobalValues.ModalConfirmAreYouSure()){
      $("body").modalLoading('show', false);
      window.api.invoke('DecodeFileImportConfigs', filePath).then(Data => {
        $("body").modalLoading('hide', false);
        if(Data.drt){
          $(".progressBarCloud").show('slow');
          toaster.warning(GetNameTd('.please_wait'));
          window.api.invoke('SerializeImportedConfig', Data.drt).then(Data => {
            toaster.success(GetNameTd('.Data_synchronized_successfully'));
            let countTRR = 4;
            let srtr = null;
            srtr = setInterval(() => {
                $('.delayToRelaunch').html(countTRR);
                if (countTRR <= 0) {
                    location.reload();
                    clearInterval(srtr);
                }
                countTRR--;
            }, 1000);
            bootbox.dialog({
                title: `<h5>${GetNameTd('.Tawri5ststc')}</h5>`,
                message: '<h1 class="delayToRelaunch">5</h1>',
                closeButton: false,
            });
          });
        }
      })
    }
  }
})

$(document).on('click', '#UNDEXPORTFILECF', async function (Event) {
    bootbox.confirm(
        {
            closeButton: false,
            title: GetNameTd('.Export_settings_to_a_local_file_icon'),
            message: GetNameTd('.Dywtetititbf'),
            buttons: {
                confirm: {
                    label: '<i class="bi bi-check2"></i> ' + GetNameTd('.yes'),
                    className: 'btn-success yes'
                },
                cancel: {
                    label: '<i class="bi bi-x-lg"></i> ' + GetNameTd('.no'),
                    className: 'btn-danger not'
                }
            },
            callback: function (result) {
                $("body").modalLoading('show', false);
                ExportUNDConfigFile('', result).then((isExported) => {
                    $("body").modalLoading('hide', false);
                    if (isExported) toaster.success(GetNameTd('.File_exported_successfully'));
                });
            }
        }
    );
});

$(document).on('click', '#BTN_cloud_stc', async function (Event) {
    var User = await window.api.invoke('GetAccount');
    if ( User && User.id ) {
        if (await GlobalValues.ModalConfirmAreYouSure()) {
            IsFirstPercentSUDP = true;
            $("body").modalLoading('show', false);
            $("#BTN_cloud_stc").prop('disabled', true);
            $("#BTN_cloud_dcs").prop('disabled', true);
            $("#BTN_cloud_sfc").prop('disabled', true);
            $("#IMPORTLOCALFILECONFIGS").prop('disabled', true);
            $("#isEnableCloudIntegrations").prop('disabled', true);
            window.api.invoke('sync-user-data').then((response) => {
                $("#BTN_cloud_stc").prop('disabled', false);
                $("#BTN_cloud_dcs").prop('disabled', false);
                $("#BTN_cloud_sfc").prop('disabled', false);
                $("#IMPORTLOCALFILECONFIGS").prop('disabled', false);
                $("#isEnableCloudIntegrations").prop('disabled', false);
                $(".progressBarCloud").hide('slow');
                $("#DVIL_percentage_cloud").addClass('hidden');
                $("body").modalLoading('hide', false);
                toaster.success(GetNameTd('.Data_synchronized_successfully'));
            });
        }
    }
    else {
        toaster.danger(GetNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
    }
});

$(document).on('click', '#BTN_cloud_sfc', async function (Event) {
    var User = await window.api.invoke('GetAccount');
    if ( User && User.id ) {
        if (await GlobalValues.ModalConfirmAreYouSure()) {
            $("#BTN_cloud_sfc").attr('disabled', true);
            $("body").modalLoading('show', false);
            window.api.invoke('get-synchronized-data').then(async (response) => {
                if (response.dataSynchronized && response.dataSynchronized.length > 0) {
                  $("body").modalLoading('hide', false);
                  $(".progressBarCloud").show('slow');
                  $("#DVIL_percentage_cloud").removeClass('hidden');
                  toaster.warning(GetNameTd('.please_wait'));
                  window.api.invoke('SerializeSynchronizedConfig', response).then(Data => {
                    toaster.success(GetNameTd('.Data_synchronized_successfully'));
                    let countTRR = 4;
                    let srtr = null;
                    srtr = setInterval(() => {
                        $('.delayToRelaunch').html(countTRR);
                        if (countTRR <= 0) {
                            location.reload();
                            clearInterval(srtr);
                        }
                        countTRR--;
                    }, 1000);
                    bootbox.dialog({
                        title: `<h5>${GetNameTd('.Tawri5ststc')}</h5>`,
                        message: '<h1 class="delayToRelaunch">5</h1>',
                        closeButton: false,
                    });
                  });
                }
                else {
                    $("body").modalLoading('hide', false);
                    $("#BTN_cloud_sfc").attr('disabled', false);
                    toaster.danger(GetNameTd('.You_do_not_have_data_to_sync'));
                }
            });
        }
    }
    else {
        toaster.danger(GetNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
    }
});

$(document).on('click', '#BTN_cloud_dcs', async function (Event) {
    var User = await window.api.invoke('GetAccount');
    if ( User && User.id ) {
        if (await GlobalValues.ModalConfirmAreYouSure()) {
            $("body").modalLoading('show', false);
            window.api.invoke('clear-synchronized-data').then((response) => {
                $("body").modalLoading('hide', false);
                toaster.success(GetNameTd('.Data_deleted_successfully'));
            });
        }
    }
    else {
        toaster.danger(GetNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
    }
});

RGSFC('ExportUNDConfigFile', async function(_fileName = null, isExportImgs = false) {
    return new Promise(resolve => {
      if (_fileName == null || _fileName == '') _fileName = `Backup Under Deck - ${new Date().toLocaleDateString().replaceAll('/', '-')}`;
      window.api.invoke('Dialog--SelectFileToPath', {
          ext: ['undcf'],
          nameFile: _fileName,
      }).then((filePath) => {
        if(filePath){
          window.api.invoke('ExportAppConfigs', {path: filePath+'.undcf', isExportImgs: isExportImgs}).then(resolve);
        }
        else{
          resolve(false);
        }
      });
    });
})