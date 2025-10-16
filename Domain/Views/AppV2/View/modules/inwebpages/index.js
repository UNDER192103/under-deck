
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  setTimeout(LoadWebPages, 200);
}

RGSFC('LoadWebPages', async () => {
  $(".list-web-pages tbody").html('')
  let table = $('.footable').footable();
  GlobalValues.AppData.WebPages.forEach(Item => {
    $(".list-web-pages tbody").append(`
    <tr class="hover-color-primary animate__animated animate__headShake" id="wb_page_${Item.id}" data-id="${Item.id}" title="${Item.name}">
        <td>${Item.id}</td>
        <td><button type="button" data-id="${Item.id}" class="btn btn-sm btn-primary btn-openwebpage"><i class="bi bi-link-45deg"></i></button></td>
        <td><img src="https://www.google.com/s2/favicons?domain=${Item.url}" style="width:24px;"></td>
        <td>${Item.name}</td>
        <td>${Item.url}</td>
        <td>${Item.status}</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger btn-deletewebpage" data-id="${Item.id}"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`);
    if(Item == GlobalValues.AppData.WebPages[GlobalValues.AppData.WebPages.length - 1]){
      table.trigger('footable_resize');
    }
  });
})

$(document).on('click', '.btn-openwebpage', function (Event) {
  Event.preventDefault();
  let id = $(this).data('id');
  let item = GlobalValues.AppData.WebPages.find(Item => Item.id == id);
  if(item){
    window.api.invoke('new_window', { name: item.name.replaceAll(" ", "_"), url: item.url });
  }
});

$(document).on('click', '.btn-deletewebpage', async function (Event) {
  Event.preventDefault();
  let id = $(this).data('id');
  let item = GlobalValues.AppData.WebPages.find(Item => Item.id == id);
  if(item && await GlobalValues.ModalConfirmAreYouSure()){
    await window.api.invoke('RemoveWebPage', item);
    await GlobalValues.GetAllAppData();
    await window.api.invoke('OV-Update-data', {type: 'webpages', data: []});
    LoadWebPages();
  }
});

$(document).on('click', '.btn-addWebPage', async function (Event) {
  Event.preventDefault();
  var name = $("#name_webpage").val();
  var url = $("#url_webpage").val();
  if (name.length < 1) {
    return toaster.danger(GetNameTd('.requere_name_add_app'));
  }
  else{
    try {
      let _url = new URL(url);
    } catch (error) {
      console.log(error);
      return toaster.danger(GetNameTd('.requere_url_add_app'));
    }
  }
  var list_webpages = GlobalValues.AppData.WebPages;
  var id = 1;
  if (list_webpages == null)
      list_webpages = [];
  else {
      let max_id = 0;
      list_webpages.forEach(i => {
          if (i.id > max_id)
              max_id = i.id;
      })
      id = max_id + 1;
  }
  var obj = {
      name: name,
      url: url,
      status: "no open",
  }
  await window.api.invoke('AddWebPage', obj);
  $(".btn-close-webpage-modal").click();
  $('.footable').footable().trigger('footable_resize');
  $("#name_webpage").val('');
  $("#url_webpage").val('');
  await GlobalValues.GetAllAppData();
  await window.api.invoke('OV-Update-data', {type: 'webpages', data: []});
  LoadWebPages();
});