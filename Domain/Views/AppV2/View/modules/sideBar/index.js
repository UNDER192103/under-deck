
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
}

$(document).on('click', '#MenuSideMenus li.nav-item', async function (e) {
    e.preventDefault();
    GlobalValues.SideBarMenuSelect(e.currentTarget.dataset.id, true);
});

$(document).on('click', ".input_select_all", function () {
    $(this).select();
});

$(document).on('keydown', ".desable_texting_input", function (event) {
  event.preventDefault();
});

RGSFC('SelectMenu', (id) => {
  if(id) $(`#MenuSideMenus li[data-id="${id}"]`).click();
});