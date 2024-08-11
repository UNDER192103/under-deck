var program_key_macro_selected = null;
var id_macro_id = null;
var key_sequence_press = [];
var key_sequence_press_edit = [];

change_list_keys_macros();

$(document).ready(function(){
    $("#button-add-macro").click(async ()=>{
        $('.btn-dropdown-key-macro').text(getNameTd(".apps_name")).attr("disabled", false);
        DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
        $(".ul-dropdown-ky-macro").html("");
        if(DAO.List_programs != null && DAO.List_programs.length > 0){
            DAO.List_programs.forEach(item => {
                var name = item.name.replace('.exe', '');
                if(item.nameCustom.length > 0)
                    name = item.nameCustom;
                console.log(item)
                $(".ul-dropdown-ky-macro").append(`
                    <li onClick="select_program_key_macro(${item._id})" class="d-flex" id="li-key-macro-${item._id}">
                        <img class="img-tbody-list-keys-macros ml-1" src="${item.iconCustom}">
                        <a class="dropdown-item" href="#">${name}</a>
                    </li>
                `);
            });
        }
    });

    $("#key-macro-modal").click(() => {
        key_sequence_press = [];
        $("#key-macro-modal").val(getNameTd(".recording_text"));
        $("#key-macro-modal").addClass("pulse-red");
    });

    $("#key-edit-macro-modal").click(() => {
        key_sequence_press_edit = [];
        $("#key-edit-macro-modal").val(getNameTd(".recording_text"));
        $("#key-edit-macro-modal").addClass("pulse-red");
    });

    $("#key-edit-macro-modal").keyup(() => {
        $("#key-edit-macro-modal").blur();
        $("#key-edit-macro-modal").removeClass("pulse-red");
        let text = "";
        for (let index = 0; index < key_sequence_press_edit.length; index++) {
            var item = key_sequence_press_edit[index];
            if(index >= (key_sequence_press_edit.length-1))
                text += item.nameKey;
            else
                text += item.nameKey+" + ";
        }
        $("#key-edit-macro-modal").val(text);
    });
    
    $("#key-edit-macro-modal").keydown((event) => {
        let objEvent = event.originalEvent;
        if(objEvent.key != "AltGraph"){
            let busca = key_sequence_press_edit.filter(f => f.key == objEvent.key.toLowerCase().replace('Meta', 'windows'))[0]
            if(busca == undefined){
                let namekey = objEvent.key.toUpperCase();
                let key = objEvent.key;
                key = key.replace('Meta', 'windows');
                key = key.toLowerCase();
                namekey = namekey.replace('CONTROL', 'CTRL');
                namekey = namekey.replace('META', 'WINDOWS');
                let obj = {
                    key: key,
                    nameKey: namekey,
                    keyCode: objEvent.keyCode,
                    shiftKey: objEvent.shiftKey,
                    ctrlKey: objEvent.ctrlKey,
                    altKey: objEvent.altKey,
                    metaKey: objEvent.metaKey,
                }
                key_sequence_press_edit.push(obj);
            }
        }
    });

    $("#key-macro-modal").keyup(() => {
        $("#key-macro-modal").blur();
        $("#key-macro-modal").removeClass("pulse-red");
        let text = "";
        if(key_sequence_press.length > 0){
            for (let index = 0; index < key_sequence_press.length; index++) {
                var item = key_sequence_press[index];
                if(index >= (key_sequence_press.length-1))
                    text += item.nameKey;
                else
                    text += item.nameKey+" + ";
            }
            $("#key-macro-modal").val(text);
        }
    });

    $("#key-macro-modal").keydown((event) => {
        let objEvent = event.originalEvent;
        if(objEvent.key != "AltGraph"){
            let busca = key_sequence_press.filter(f => f.key == objEvent.key.toLowerCase().replace('Meta', 'windows'))[0]
            if(busca == undefined){
                let namekey = objEvent.key.toUpperCase();
                let key = objEvent.key;
                key = key.replace('Meta', 'windows');
                key = key.toLowerCase();
                namekey = namekey.replace('CONTROL', 'CTRL');
                namekey = namekey.replace('META', 'WINDOWS');
                let obj = {
                    key: key,
                    nameKey: namekey,
                    keyCode: objEvent.keyCode,
                    shiftKey: objEvent.shiftKey,
                    ctrlKey: objEvent.ctrlKey,
                    altKey: objEvent.altKey,
                    metaKey: objEvent.metaKey,
                }
                key_sequence_press.push(obj);
            }
        }
    });
});

async function change_list_keys_macros(){
    $('#list-keys-macros').html('');
    let list_macros = await DAO.List_macros.get('macros');
    if(list_macros != null && list_macros.length > 0){
        await list_macros.forEach(async item => {
            let appr = await getAppById(item.idProgram);
            if(appr != null){
                item.app = appr;
                item.name = await getNameApp(item.app);
                let _macro = "";
                for (let index = 0; index < item.keys.length; index++) {
                    var itemKey = item.keys[index];
                    if(index >= (item.keys.length-1)) _macro += itemKey.nameKey; else _macro += itemKey.nameKey+" + ";
                }
                var type_exc = item.app.type_exec;
                
                $('#list-keys-macros').append(`
            <tr class="hover-color-primary">
                    <th scope="row">${item._id}</th>
                    <td><img class="img-tbody-list-keys-macros" src="${item.app.iconCustom}"></td>
                    <td>${item.name}</td>
                    <td>${getNameTd(".trad_ty_"+type_exc)}</td>
                    <td>${_macro}</td>
                <td>
                    <a class="nav-link dropdown-toggle" href="#" id="dropdown_edit_macro" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-gear-wide"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdown_edit_macro">
                        <li onClick="edit_macro(${item._id})" type="button" data-bs-toggle="modal" data-bs-target="#modal-edit-key-macro">
                            <a class="dropdown-item" href="#">
                                <i class="bi bi-pen text-success"></i>
                                    ${getNameTd(".edit_text")}
                            </a>
                        </li>
                        <li onClick="delete_macro(${item._id})" type="button">
                            <a class="dropdown-item" href="#">
                                <i class="bi bi-trash3 text-danger"></i>
                                    ${getNameTd(".delete_text")}
                            </a>
                        </li>
                    </ul>
                </td>
            </tr>
                `);
            }
            else{
                list_macros = await list_macros.filter(r => r.idProgram != item.idProgram);
                await DAO.List_macros.set('macros', list_macros);
            }
        });
        await DAO.List_macros.set('macros', list_macros);
    }
}

async function edit_macro(id){
    id_macro_id = id;
    key_sequence_press_edit = [];
    let item = await get_macro_updated(id);
    let text = "";
    for (let index = 0; index < item.keys.length; index++) {
        var elem = item.keys[index];
        if(index >= (item.keys.length-1))
            text += elem.nameKey;
        else
            text += elem.nameKey+" + ";
    }
    $("#key-edit-macro-modal").val(text);
    $('.btn-dropdown-edit-key-macro').text(item.name).attr("disabled", true);
}

async function delete_macro(id){
    let listNowMacro = await DAO.List_macros.get('macros');
    let newListMacros = listNowMacro.filter(m => m._id != id);
    await DAO.List_macros.set('macros', newListMacros);
    change_list_keys_macros();
}

function select_program_key_macro(id){
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var item = list_programs.filter(b => b._id == id)[0], icone = path.join(__dirname, "/src/img/underbot_logo.svg");
    program_key_macro_selected = id;
    var name = item.name.replace('.exe', '');
    if(item.nameCustom.length > 0)
        name = item.nameCustom;
    if(item.iconCustom != null)
        icone = item.iconCustom;
    else
        item.iconCustom = icone;
    $(`.btn-dropdown-key-macro`).text(name);
}

async function add_new_macro(){
    if(program_key_macro_selected != null){
        $(".alert-key-macro-modal").text('').addClass('hidden');
        var list_programs = DAO.ProgramsExe.get('list_programs');
        var item = list_programs.filter(b => b._id == program_key_macro_selected)[0];
        if(item != null){
            var name = item.name.replace('.exe', '');
            if(item.nameCustom.length > 0)
                name = item.nameCustom;

            if(key_sequence_press.length > 0){
                let listKeyMacroNow = await DAO.List_macros.get('macros'), _id = null, validExist = null;
                if(listKeyMacroNow != null)
                    validExist = listKeyMacroNow.filter(b => b.idProgram == program_key_macro_selected)[0];

                if(validExist == null){
                    if(listKeyMacroNow != null && listKeyMacroNow.length > 0)
                        _id = (listKeyMacroNow[listKeyMacroNow.length-1]._id+1)
                    else
                        _id = 1;
                    var dt = {_id: _id, idProgram: program_key_macro_selected, name: name, keys: key_sequence_press, app: item}
                    await DAO.List_macros.push('macros', dt);
                    await change_list_keys_macros();
                    $('.btn-close-key-macro-modal').click();

                    program_key_macro_selected = null;
                    key_sequence_press = [];
                    $("#key-macro-modal").val(`${getNameTd(".edit_text")} ${getNameTd(".shortcut_text")}`);
                    $("#key-macro-modal").blur()
                    $("#key-macro-modal").removeClass("pulse-red")
                    $(`.btn-dropdown-key-macro`).text(getNameTd(".apps_name"));
                }
                else{
                    $(".alert-key-macro-modal").text(getNameTd(".t_a_i_a_r_i_t_l_o_s_text")).removeClass('hidden');
                }
            }
            else{
                $(".alert-key-macro-modal").text(getNameTd(".p_c_a_s_text")).removeClass('hidden');
            }
        }
        else{
            $(".alert-key-macro-modal").text(getNameTd(".p_s_a_a_text")).removeClass('hidden');
        }
    }
    else{
        $(".alert-key-macro-modal").text(getNameTd(".p_s_a_a_text")).removeClass('hidden');
    }
}

async function edit_save_macro(){
    if(id_macro_id != null){
        $(".alert-edit-key-macro-modal").text('').addClass('hidden');
        if(key_sequence_press_edit.length > 0){
            let listNowMacro = await DAO.List_macros.get('macros');
            listNowMacro.forEach(i => {
                if(i._id == id_macro_id){
                    i.keys = key_sequence_press_edit;
                }
            });
            await DAO.List_macros.set('macros', listNowMacro);
            await change_list_keys_macros();
            $('.btn-close-edit-key-macro-modal').click();
        }
        else{
            $(".alert-key-macro-modal").text(getNameTd(".p_c_a_s_text")).removeClass('hidden');
        }
    }
}

function clear_modal_macro(){
    $(".alert-key-macro-modal").text('').addClass('hidden');
    key_sequence_press = [];
    program_key_macro_selected = null;
    $("#key-macro-modal").blur()
    $("#key-macro-modal").removeClass("pulse-red")
    $(`.btn-dropdown-key-macro`).text(getNameTd(".apps_name"));
    $("#key-macro-modal").val(`${getNameTd(".edit_text")} ${getNameTd(".shortcut_text")}`);
}

function clear_edit_modal_macro(){
    $(".alert-key-edit-macro-modal").text('').addClass('hidden');
    key_sequence_press_edit = [];
    id_macro_id = null;
    $("#key-edit-macro-modal").blur()
    $("#key-edit-macro-modal").removeClass("pulse-red")
    $('.btn-dropdown-edit-key-macro').text('');
    $("#key-edit-macro-modal").val(`${getNameTd(".edit_text")} ${getNameTd(".shortcut_text")}`);
}

async function get_macro_updated(id){
    let listNowMacro = await DAO.List_macros.get('macros');
    let item = listNowMacro.filter(m => m._id == id)[0];
    item.app = await getAppById(item.idProgram);
    item.name = await getNameApp(item.app);
    return item;
}