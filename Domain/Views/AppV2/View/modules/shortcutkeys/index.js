
export async function initialize(isLogger = false) {
  if (isLogger) console.log("Inicializando modulo!");
  RGSFC('KeySequencePress', []);
  RGSFC('SelectedAppToMacro', null);
  RGSFC('SelectedKeyMacroToEdit', null);
  $("#key-macro-modal").val(`${GetNameTd(".edit_text")} ${GetNameTd(".shortcut_text")}`);
  setTimeout(LoadShortcutkeys, 200);
}

RGSFC('LoadShortcutkeys', async () => {
  $(".list-keys-macros tbody").html('')
  let table = $('.footable').footable();
  GlobalValues.AppData.KeysMacros.forEach(Item => {
    let App = GlobalValues.AppData.Apps.find(a => a.uuid == Item.idProgram);
    if (App) {
      let _macro = "";
      for (let index = 0; index < Item.keys.length; index++) {
        var itemKey = Item.keys[index];
        if (index >= (Item.keys.length - 1)) _macro += itemKey.nameKey; else _macro += itemKey.nameKey + " + ";
      }
      $(".list-keys-macros tbody").append(`
        <tr class="hover-color-primary animate__animated animate__headShake">
                <th scope="row">${Item._id}</th>
                <td><img class="img-tbody-list-keys-macros" src="${App.icon}"></td>
                <td>${App.name}</td>
                <td>${GetNameTd(".trad_ty_" + App.typeExec)}</td>
                <td>${_macro}</td>
            <td>
                <a class="nav-link dropdown-toggle" href="#" id="dropdown_edit_macro" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-gear-wide"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdown_edit_macro">
                    <li class="btn-editKeyMacro" data-id="${Item._id}" type="button">
                        <a class="dropdown-item" href="#">
                            <i class="bi bi-pen text-success"></i>
                                ${GetNameTd(".edit_text")}
                        </a>
                    </li>
                    <li class="btn-deleteKeyMacro" data-id="${Item._id}" type="button">
                        <a class="dropdown-item" href="#">
                            <i class="bi bi-trash3 text-danger"></i>
                                ${GetNameTd(".delete_text")}
                        </a>
                    </li>
                </ul>
            </td>
        </tr>
      `);
    }
    if (Item == GlobalValues.AppData.KeysMacros[GlobalValues.AppData.KeysMacros.length - 1]) {
      table.trigger('footable_resize');
    }
  });
})

$(document).on('click', '.btn-deleteKeyMacro', async function (Event) {
  Event.preventDefault();
  let id = $(this).data('id');
  SelectedKeyMacroToEdit = GlobalValues.AppData.KeysMacros.find(Item => Item._id == id);
  if (SelectedKeyMacroToEdit && await GlobalValues.ModalConfirmAreYouSure()) {
    await window.api.invoke('DeleteKeyMacro', SelectedKeyMacroToEdit);
    await GlobalValues.GetAllAppData();
    SelectedKeyMacroToEdit = null;
    await window.api.invoke('update_data_macros');
    LoadShortcutkeys();
  }
});

$(document).on('click', '.btn-editKeyMacro', async function (Event) {
  Event.preventDefault();
  let id = $(this).data('id');
  SelectedKeyMacroToEdit = GlobalValues.AppData.KeysMacros.find(Item => Item._id == id);
  if (SelectedKeyMacroToEdit) {
    KeySequencePress = SelectedKeyMacroToEdit.keys;
    let app = GlobalValues.AppData.Apps.find(a => a.uuid == SelectedKeyMacroToEdit.idProgram);
    if (app) {
      $("#modal-edit-key-macro").modal('show');
      $(".btn-dropdown-edit-key-macro").text(app.name);
      $("#key-edit-macro-modal").val(SelectedKeyMacroToEdit.keys.map(key => { return key.nameKey }).join(' + '))
    }
  }
});

$("#key-edit-macro-modal").click(() => {
  KeySequencePress = [];
  $("#key-edit-macro-modal").val(GetNameTd(".recording_text"));
  $("#key-edit-macro-modal").addClass("pulse-red");
  window.api.invoke('get_combo_keys', null).then((listKeys) => {
    KeySequencePress = listKeys.map(key => { return { key: key, nameKey: key, keyCode: key, shiftKey: key, ctrlKey: key, altKey: key, metaKey: key, } });
    $("#key-edit-macro-modal").blur();
    $("#key-edit-macro-modal").removeClass("pulse-red");
    $("#key-edit-macro-modal").removeClass("pulse-red");
    console.log()
    $("#key-edit-macro-modal").val(listKeys.join(' + '));
  });
});

$(document).on('click', '#key-macro-modal', async function (Event) {
  Event.preventDefault();
  KeySequencePress = [];
  $("#key-macro-modal").val(GetNameTd(".recording_text"));
  $("#key-macro-modal").addClass("pulse-red");
  window.api.invoke('get_combo_keys', null).then((listKeys) => {
    KeySequencePress = listKeys.map(key => { return { key: key, nameKey: key, keyCode: key, shiftKey: key, ctrlKey: key, altKey: key, metaKey: key, } });
    $("#key-macro-modal").blur();
    $("#key-macro-modal").removeClass("pulse-red");
    $("#key-macro-modal").val(listKeys.join(' + '));
  });
})

$(document).on('click', '.btn-saveEditKeyMacro', async function (Event) {
  Event.preventDefault();
  if (SelectedKeyMacroToEdit) {
    $(".alert-key-macro-modal").text('').addClass('hidden');
    if (KeySequencePress.length > 0) {
      var dataKeyMacro = { ...SelectedKeyMacroToEdit, keys: KeySequencePress }
      await window.api.invoke('EditKeyMacro', dataKeyMacro);
      await GlobalValues.GetAllAppData();
      LoadShortcutkeys()
      $('.btn-close-edit-key-macro-modal').click();
      window.api.invoke('update_data_macros');
      toaster.success(`${GetNameTd('.Successfully_edited')}`);
    }
  }
})

$(document).on('click', '.btn-addMacroKey', async function (Event) {
  Event.preventDefault();
  if (SelectedAppToMacro && SelectedAppToMacro.uuid) {
    $(".alert-key-macro-modal").text('').addClass('hidden');
    var name = SelectedAppToMacro.name.replace('.exe', '');
    if (SelectedAppToMacro.nameCustom && SelectedAppToMacro.nameCustom.length > 0) name = SelectedAppToMacro.nameCustom;
    if (KeySequencePress.length > 0) {
      let validExist = null;
      if (GlobalValues.AppData.KeysMacros != null) validExist = GlobalValues.AppData.KeysMacros.filter(b => b.idProgram == SelectedAppToMacro.uuid)[0];
      if (validExist == null) {
        var dataKeyMacro = { type: 'APP', idProgram: SelectedAppToMacro.uuid, keys: KeySequencePress }
        await window.api.invoke('AddKeyMacro', dataKeyMacro);
        await GlobalValues.GetAllAppData();
        LoadShortcutkeys()
        $('.btn-close-key-macro-modal').click();
        window.api.invoke('update_data_macros');
        toaster.success(`${GetNameTd('.Added_successfully')}`);
      }
      else {
        $(".alert-key-macro-modal").text(GetNameTd(".t_a_i_a_r_i_t_l_o_s_text")).removeClass('hidden');
      }
    }
    else {
      $(".alert-key-macro-modal").text(GetNameTd(".p_c_a_s_text")).removeClass('hidden');
    }
  }
  else {
    $(".alert-key-macro-modal").text(GetNameTd(".p_s_a_a_text")).removeClass('hidden');
  }
})

$(document).on('click', '.li-selectKeyMacro', async function (Event) {
  Event.preventDefault();
  $('.CF-active').removeClass('CF-active');
  let uuid = $(this).data('id');
  SelectedAppToMacro = GlobalValues.AppData.Apps.find(Item => Item.uuid == uuid);
  if (SelectedAppToMacro) {
    $(`.btn-dropdown-key-macro`).text(SelectedAppToMacro.name);
    $(this).addClass('CF-active');
  }
})

$(document).on('show.bs.modal', '#modal-key-macro', async function (Event) {
  KeySequencePress = [];
  SelectedAppToMacro = null;
  $('.CF-active').removeClass('CF-active');
  $("#key-macro-modal").val(`${GetNameTd(".edit_text")} ${GetNameTd(".shortcut_text")}`);
  $(".ul-dropdown-ky-macro").html("");
  $("#key-macro-modal").removeClass("pulse-red");
  $(`.btn-dropdown-key-macro`).text(GetNameTd(".apps_name"));
  GlobalValues.AppData.Apps.forEach(App => {
    let name = App.name;
    if (App.nameCustom && App.nameCustom.length > 0) name = App.nameCustom;
    $(".ul-dropdown-ky-macro").append(`
        <li data-id="${App.uuid}" class="d-flex li-selectKeyMacro">
            <img class="img-tbody-list-keys-macros ml-1" src="sys:///${App.icon}">
            <a class="dropdown-item" href="#">${name}</a>
        </li>
    `);
  })
})

$(document).on('hidden.bs.modal', '#modal-key-macro', async function (Event) {
  KeySequencePress = [];
  SelectedAppToMacro = null;
  $('.CF-active').removeClass('CF-active');
  $("#key-macro-modal").val(`${GetNameTd(".edit_text")} ${GetNameTd(".shortcut_text")}`);
  $(".ul-dropdown-ky-macro").html("");
  $("#key-macro-modal").removeClass("pulse-red");
  $(`.btn-dropdown-key-macro`).text(GetNameTd(".apps_name"));
})

$(document).on('show.bs.modal', "#modal-edit-key-macro", async function (Event) {
  SelectedAppToMacro = null;
})

$(document).on('hidden.bs.modal', "#modal-edit-key-macro", async function (Event) {
  KeySequencePress = [];
  SelectedAppToMacro = null;
  SelectedKeyMacroToEdit = null;
})