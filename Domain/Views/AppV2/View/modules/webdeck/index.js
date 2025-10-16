
export async function initialize(isLogger = false) {
  if (isLogger) console.log("Inicializando modulo!");
  setTimeout(LoadWebDeckData, 200);
}

RGSFC('LoadWebDeckData', async () => {
  let StatusServerNow = await window.api.invoke('GetStatusLocalServer');
  $("#port-local-server").val(GlobalValues.AppData.Settings.Server.port);
  $('#local-server-adress-acess-url').val(`http://${StatusServerNow.address}:${StatusServerNow.port}`);
  if (StatusServerNow.isStarted == true) {
    $('#button-start-local-server').text(GetNameTd(".stop_text")).addClass('btn-danger').removeClass('btn-success')
      .removeClass('hover-pulse-grean')
      .addClass('hover-pulse-red');
  }
  else {
    $('#button-start-local-server').text(GetNameTd(".start_text"))
      .removeClass('btn-danger')
      .addClass('btn-success')
      .addClass('hover-pulse-grean')
      .removeClass('hover-pulse-red');
  }


  $("#webdeck_background_color").val(GlobalValues.AppData.WebDeck.Color.background);
  $("#webdeck_color_text").val(GlobalValues.AppData.WebDeck.Color.text);
})

$(document).on('click', "#reset_to_default_webdeck_colors", async () => {
  $("#webdeck_background_color").val('#370179');
  $("#webdeck_color_text").val('#ffffff');
  $(".btn-SavedataLocalServer").click();
})

$(document).on('click', ".btn-SavedataLocalServer", async () => {
  $(".btn-SavedataLocalServer").prop('disabled', true);
  let port = $('#port-local-server').val();
  if (!isNaN(port) && port > 80 && port < 65536) {
    $('.alert-por-local-server-modal').addClass('hidden');
  }
  else {
    $('.alert-por-local-server-modal').text(GetNameTd(".t_p_m_c_4_n_text")).removeClass('hidden');
    return;
  }
  GlobalValues.AppData.WebDeck.Color.background = $("#webdeck_background_color").val();
  GlobalValues.AppData.WebDeck.Color.text = $("#webdeck_color_text").val();
  await window.api.invoke('UpdateWebDeckData', {
    WebDeck: GlobalValues.AppData.WebDeck,
    Server: GlobalValues.AppData.Settings.Server.port != port ? {
      port: port
    }
    : null
  });
  await window.api.invoke('RestartLocalServer');
  await GlobalValues.GetAllAppData();
  $(".btn-SavedataLocalServer").prop('disabled', false);
  LoadWebDeckData();
  toaster.success(GetNameTd('.s_s_text'));
})

$(document).on('change', "#webdeck_background_color", async function name(Event) {
  Event.preventDefault();
  $(".btn-SavedataLocalServer").click();
})

$(document).on('change', "#webdeck_color_text", async function name(Event) {
  Event.preventDefault();
  $(".btn-SavedataLocalServer").click();
})

$(document).on('click', '#button-start-local-server', async function name(Event) {
  Event.preventDefault();
  let StatusServerNow = await window.api.invoke('GetStatusLocalServer');
  await window.api.invoke('CommandLocalServer', {type: StatusServerNow.isStarted ? 'stop' : 'start'});
  await GlobalValues.GetAllAppData();
  LoadWebDeckData();
})

$(document).on('click', '#openInvitationQRCODEUNDRemotVersion', async (e) => {
    var User = await window.api.invoke('GetAccount');
    var Pc = await window.api.invoke('GetPC');
    var BaseUrl = await window.api.invoke('GetRemoveServerUrl');
    if ( User && User.id  && Pc && Pc.id) {
        let uri = `${BaseUrl}/client/?ng=webdeck/invite/${Pc.id}/`;
        let qrcode = await window.api.invoke('GenerateQrcodeUrl', uri);
        if(qrcode){
          $("#modal-qr-code").modal('show');
          $(".url-qr-code-modal").attr("src", qrcode);
          $(".url_qr_code_modal_i").val(qrcode);
        }
    }
    else {
        bootbox.alert(GetNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
    }
});

$(document).on('click', '.btn-modalQrCodeLocalServerUrl', async (e) => {
  let qrcode = await window.api.invoke('GenerateQrcodeUrl', $("#local-server-adress-acess-url").val());
  if(qrcode){
    $("#modal-qr-code").modal('show');
    $(".url-qr-code-modal").attr("src", qrcode);
    $(".url_qr_code_modal_i").val(qrcode);
  }
});