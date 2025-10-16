
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  await LoadEventsUpdates();
  LoadDataUpdates();
}

RGSFC('LoadEventsUpdates', async function() {
  window.api.on('AutoUpdater', (data) => {
    switch (data.code) {
      case -1:
        toaster.danger(data.msg);
        //bootbox.alert(`<h4>${data.msg}</h4>`);
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
        break;

      case -2:
        toaster.danger(data.msg);
        bootbox.alert(`<h4>${data.msg}</h4>`);
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
        break;

      case 0:
        toaster.success(data.msg);
        //bootbox.alert(`<h4>${data.msg}</h4>`);
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
        break;

      case 1:
        toaster.success(data.msg);
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', true);
        bootbox.confirm(
          {
            title: data.msg,
            message: `
              <label>${GetNameTd('.version_text')}: ${data.info.version}</label><br>
              <label>${GetNameTd('.releaseDate_text')}: ${new Date(data.info.releaseDate).toLocaleString()}</label><br>
              <label>${GetNameTd('.releaseName_text')}: ${data.info.releaseName}</label><br>
              <label>${GetNameTd('.releaseNotes_text')}:<br><br> ${data.info.releaseNotes.replace('href="', '')}</label><br>
            `,
            buttons: {
              cancel: {
                label: `${GetNameTd('.close_text')}`,
                className: "btn-danger"
              },
              confirm: {
                label: `${GetNameTd('.download_text')} ${GetNameTd('.uupdate_text')}`
              }
            },
            callback: function (result) {
              if (result) {
                window.api.invoke('app_update_start_download', null).then(response => {
                  //console.log(response)
                });
              }
              else {
                $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
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
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
        break;

      case 4:
        toaster.success(data.msg);
        //bootbox.alert(data.msg);
        $(".percent_download_update_app").hide('slow');
        $("#button-search-updates").html(GetNameTd('.search_updates_text')).prop('disabled', false);
        break;

      default:
        console.log(data)
        break;
    }

  });
})

RGSFC('LoadDataUpdates', async function() {
  $("#autoupdateonestart").attr('checked', GlobalValues.AppData.Settings.AppAutoUpdate);
})

$(document).on('click', '#autoupdateonestart', async function (Event){
  GlobalValues.AppData.Settings.AppAutoUpdate = $(this).is(':checked');
  await window.api.invoke('UpdateUpdatesData', {AppAutoUpdate: GlobalValues.AppData.Settings.AppAutoUpdate});
  await GlobalValues.GetAllAppData();
  LoadDataUpdates();
})

$(document).on('click', `button[data-target="#collapseUpdates"]`, async function (Event){
    if (!$("#collapseUpdates").hasClass('show')) {
        $("#webViewUpdatesGitHub").html(`
            <Iframe class="border rounded iframeUpdate" id="webViewUpdatesGitHubIFrame" src=""
                width="100%"
                height="600px"
                id=""
                className=""
                display="block"
                position="relative"
            />
        `);
        fetch("https://github.com/UNDER192103/under-deck/releases", {
            method: 'GET',
            headers: {
                'frame-ancestors': '*'
            }
        }).then(async res => {
            console.log(res);
            const blob = await res.blob();
            const urlObject = URL.createObjectURL(blob);
            document.querySelector('iframe').setAttribute("src", urlObject);
        })
            .catch(erro => {
                console.error(erro)
                document.querySelector('iframe').setAttribute("src", `${APP_PATH}\\Domain\\Views\\html\\404.html?err=${erro.toString().replaceAll('TypeError:', '')}`);
            });
    }
    else {
        $("#webViewUpdatesGitHub").html('');
    }
})

$(document).on('click', "#button-search-updates", async function (Event){
    toaster.warning(GetNameTd('.looking_for_updates'));
    $("#button-search-updates").html(`
        <div class="card-content-spinner m-1 ps-5 pe-5">
            <div class="hollow-dots-spinner spinner-center spinnerStyle">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `).prop('disabled', true);
    window.api.invoke('check_app_update', null);
});