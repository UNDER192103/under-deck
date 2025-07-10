

$(document).on('click', '#MenuSideMenus li.nav-item[data-id="app-main"]', async function (e) {
    e.preventDefault();
    changeAppsHtml();
});
$(document).on('click', '#MenuSideMenus li.nav-item[data-id="web-pages"]', async function (e) {
    e.preventDefault();
    change_list_web_pages();
});

$(document).ready(async () => {

    $(".list_apps").sortable({
        start: (event) => {
            getElmByParentsClass(event.originalEvent.target, 'col-exe', (elem) => {
                elem.removeClass('transition-all').css('cursor', 'move');
            });
        },
        stop: (event) => {
            getElmByParentsClass(event.originalEvent.target, 'col-exe', (elem) => {
                elem.addClass('transition-all').css('cursor', '');
            });
            change_position_list();
        },
    });
    $(".list_apps").disableSelection();

    $("#icon-custom-add-app").on('change', (e) => {
        if (e.target.files[0])
            $("#previwSeletedIconAddApp").attr('src', URL.createObjectURL(e.target.files[0]));
        else
            $("#previwSeletedIconAddApp").attr('src', path.join(APP_PATH, "/Domain/src/img/underbot_logo.png"));
    });

    $("#icon-exe-edit").on('change', (e) => {
        if (e.target.files[0])
            $("#previwSeletedIconEditApp").attr('src', URL.createObjectURL(e.target.files[0]));
        else
            $("#previwSeletedIconEditApp").attr('src', editExeNow.iconCustom);
    });

    $('#autoupdateonestart').click(function () {
        let isCheck = document.getElementById('autoupdateonestart').checked;
        DAO.DB.set('AutoUpdateApp', isCheck);
    });

    $('#isNotValidFirstSearchUpdateApp').click(function () {
        let isCheck = document.getElementById('isNotValidFirstSearchUpdateApp').checked;
        DAO.DB.set('isNotValidFirstSearchUpdateApp', isCheck);
    });

    $('#input-app-exec').change(async () => {
        $('.alert-add-app').text("").addClass('hidden');
        if ($("#name-c-to-app").val().length == 0) {
            var executable = $('#input-app-exec')[0].files[0];
            if (executable != null)
                $("#name-c-to-app").val(executable.name.split(".")[0])
            else
                $("#name-c-to-app").val("");
        }
    });

    $('#input-app-audio').change(async () => {
        $('.alert-add-app').text("").addClass('hidden');
        if ($("#name-c-to-app").val().length == 0) {
            var executable = $('#input-app-audio')[0].files[0];
            if (executable != null)
                $("#name-c-to-app").val(executable.name.split(".")[0])
            else
                $("#name-c-to-app").val("");
        }
    });


    $(document).on('mousedown', '.rigth-click-exe', function (e) {
        if (e.button == 2) {
            $(e.currentTarget).find('.dropdown-toggle').click();
        }
    });


    $("#btn_list_installed_software").click(async () => {
        await list_installed_software();
    });
});

const open_webpage = async (id, name, url) => {
    await BACKEND.New_window({ name: name, url: url });
}

const delet_web_page = async (id) => {
    bootbox.confirm({
        message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
        buttons: {
            confirm: {
                label: getNameTd('.yes'),
                className: 'btn-success yes'
            },
            cancel: {
                label: getNameTd('.no'),
                className: 'btn-danger not'
            }
        },
        callback: async (res) => {
            if (res) {
                let list_webpages = await DAO.DB.get("web_page_saved");
                let new_list = list_webpages.filter(f => f.id != id);
                await DAO.DB.set("web_page_saved", new_list);
                $(`.list-web-pages tbody tr[id="wb_page_${id}"]`).remove();
                BACKEND.Send('OV-Update-data', {type: 'webpages', data: []});
            }
        }
    });
}

const add_im_list_webpages = async (item) => {
    await $(".list-web-pages tbody").append(`
    <tr class="hover-color-primary animate__animated animate__headShake" id="wb_page_${item.id}" title="${item.name}">
        <td>${item.id}</td>
        <td><button type="button" class="btn btn-sm btn-primary" onclick="open_webpage(${item.id}, '${item.name.replaceAll(" ", "_")}', '${item.url}')"><i class="bi bi-link-45deg"></i></button></td>
        <td><img src="https://www.google.com/s2/favicons?domain=${item.url}"></td>
        <td>${item.name}</td>
        <td>${item.url}</td>
        <td>${item.status}</td>
        <td>
            <button type="button" onclick="delet_web_page(${item.id})" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`);
    $(`#wb_page_${item.id}`).dblclick(function () {
        open_webpage(item.id, item.name.replaceAll(" ", "_"), item.url);
    });
}

const getQrCodeIpUrlWeb = async () => {
    let uri = `http://${getMyIPAddress()}:${DAO.DB.get('server_port')}`;
    QRCode.toDataURL(uri, function (err, url) {
        if (!err) {
            $("#modal-qr-code").modal('show');
            $(".url-qr-code-modal").attr("src", url);
            $(".url_qr_code_modal_i").val(uri);
        }
        else {
        }
    });
}

function compare_positon_l(a, b) {
    if (a.positon_l < b.positon_l) {
        return -1;
    }
    if (a.positon_l > b.positon_l) {
        return 1;
    }
    return 0;
}

function compare__id(a, b) {
    if (a._id < b._id) {
        return -1;
    }
    if (a._id > b._id) {
        return 1;
    }
    return 0;
}

function appendHtml(item, count) {
    var name = item.name.replace('.exe', '');
    var icone = APP_PATH + "/Domain/src/img/underbot_logo-68.png";
    if (item.nameCustom.length > 0)
        name = item.nameCustom;
    if (item.iconCustom != null)
        icone = item.iconCustom;
    var bgs = 'bg-light';
    var bg_dropdown_menu = "dropdown-menu-light";
    if (DAO.DB.get('bd_theme') == 'black') {
        bgs = 'bg-black';
        bg_dropdown_menu = "dropdown-menu-black";
    }
    $('.content-files-add').append(`
        <div class="m-0 col-md-4 col-xl-2 transition-all col animate__animated animate__fadeIn col-exe" id="col-exe-id-${count}">
            <div class="card rounded-3 rigth-click-exe hover-exes border border-4 rounded ${bgs}">
                <div class="d-btn-exe-F m-1 d-flex flex-row-reverse">
                    <span class="dropdown-toggle dropdown-toggle-c fillter-shadow-text hover-icon-edit" data-bs-auto-close="*" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <a class="nav-link tooltip-script hover_rotation" title="${getNameTd(".tooltip_config_t")}" data-toggle="tooltip" href="#" id="dropdownMenuLink-exe-id-${count}"><i class="bi bi-gear-wide"></i></a>
                    </span>
                    <ul class="dropdown-menu fillter-shadow-box ${bg_dropdown_menu}" aria-labelledby="dropdownMenuLink-exe-id-${count}">
                        <li onClick="addExeShotCut(${count})"><a class="dropdown-item ligth" href="#"><i class="bi bi-plus-square"></i> ${getNameTd(".add_macro_text")}</a></li>
                        <li onClick="startExe(${count})"><a class="dropdown-item ligth" href="#"><i class="bi bi-filetype-exe"></i> ${getNameTd(".start_text")}</a></li>
                        <li onClick="editExe(${count})" type="button" data-bs-toggle="modal" data-bs-target="#modal-edit-exe"><a class="dropdown-item" href="#"><i class="bi bi-pen text-success"></i> ${getNameTd(".edit_text")}</a></li>
                        <li onClick="deleteExe(${count})"><a class="dropdown-item ligth" href="#"><i class="bi bi-trash3 text-danger"></i> ${getNameTd(".delete_text")}</a></li>
                    </ul>
                </div>
                <img src="${icone}" class="card-img-top w-100 mh-iconapp mb-0 auto-left-right" alt="...">
                
                <div class="d-footer-exe card-body text-center">
                    <h5 class="card-title text-light tooltip-script u-format-max-text exeT m-0 cursor-pointer" title="${name}" data-toggle="tooltip">${name}</h5>
                </div>
            </div>
        </div>
    `);
    $(`#col-exe-id-${count}`).dblclick(function () {
        startExe(count)
    });

    setTimeout(() => {
        $(".tooltip-script").tooltip();
    }, 500);
}

async function deleteExe(id) {
    bootbox.confirm({
        message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
        buttons: {
            confirm: {
                label: getNameTd('.yes'),
                className: 'btn-success yes'
            },
            cancel: {
                label: getNameTd('.no'),
                className: 'btn-danger not'
            }
        },
        callback: async (res) => {
            if (res) {
                var list_programs = DAO.ProgramsExe.get('list_programs');
                if (list_programs != null) {
                    var item = list_programs.filter(b => b._id == id)[0];
                    if (item != null && item.isExe != "browser") {
                        DAO.ProgramsExe.set('list_programs', list_programs.filter(b => b._id != id));
                        let listNowMacro = await DAO.List_macros.get('macros');
                        if (listNowMacro != null) {
                            let newListMacros = listNowMacro.filter(m => m.idProgram != id);
                            await DAO.List_macros.set('macros', newListMacros);
                        }
                        change_list_keys_macros(DAO.List_macros.get('macros'));
                        $(`#col-exe-id-${id}`).remove();
                        if (item.iconCustom != null) {
                            if (item.iconCustom.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe'))) {
                                fs.access(item.iconCustom, fs.constants.F_OK, (err) => {
                                    if (!err)
                                        fs.unlinkSync(item.iconCustom)
                                })
                            }
                        }
                        DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
                    }
                    else if (item == null) {
                        $(`#col-exe-id-${id}`).remove();
                    }
                    await Promise.all(DAO.WEBDECKDATA.pages.map(async page => {
                        page.items = await page.items.map(item => {
                            if (item.app != null && item.app._id == id) {
                                item.app = null;
                                item.type = null;
                            }
                            return item;
                        });
                        return page;
                    }));
                    await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                    loadPreviwWebDeck();
                    toaster.success(`${getNameTd('.Successfully_removed')}`);
                    BACKEND.Send('OV-Update-data', {type: 'apps', data: []});
                }
            }
        }
    });
};

async function changeAppsHtml() {
    let listApps = await DAO.ProgramsExe.get('list_programs');
    $('.content-files-add').html('');
    if (listApps != null) {
        await listApps.forEach(item => {
            appendHtml(item, item._id);
        });
    }
}

async function getAppById(id) {
    if (id != null) {
        var list_programs = await DAO.ProgramsExe.get('list_programs');
        if (list_programs != null && list_programs.length > 0)
            return list_programs.filter(b => b._id == id)[0];
        else
            return null;
    }
    else
        return null;
}

async function getNameApp(app) {

    if (app != null && app.name != null && app.name.length > 0) {
        var name = app.name.replace('.exe', '');
        if (app.nameCustom.length > 0)
            name = app.nameCustom;
        return name;
    }
    else
        return null;
}

function editExe(id) {
    $("#icon-exe-edit").val('');
    $("#previwSeletedIconEditApp").attr('src', '');
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var item = list_programs.filter(b => b._id == id)[0];
    $(".div-edit-url").addClass("hidden");
    $(".div-edit-cmd").addClass("hidden");
    $("#edit-url-add-app").val("");
    $("#edit-cmd-add-app").val("");

    editExeNow = item;
    if (item.type_exec == "web_page") {
        $(".div-edit-url").removeClass("hidden");
        $("#edit-url-add-app").val(item.path);
    }
    else if (item.type_exec == "cmd") {
        $(".div-edit-cmd").removeClass("hidden");
        $("#edit-cmd-add-app").val(item.path);
    }
    $("#previwSeletedIconEditApp").attr('src', editExeNow.iconCustom);
    var name = item.name.replace('.exe', '');
    if (item.nameCustom.length > 0)
        name = item.nameCustom;
    $('#modal-edit-exeLabel').text(`${getNameTd(".edit_text")} ( ${name} )`);
    $('#name-exe-modal').val(name);
};

async function saveEditExe() {
    var file = $('#icon-exe-edit')[0].files[0];
    await saveIconFile(file, async (fileOld) => {
        var newName = $('#name-exe-modal').val();
        if (newName.length > 0 && newName != editExeNow.nameCustom && newName != editExeNow.name) {
            editExeNow.nameCustom = newName;
        }

        if (editExeNow.type_exec == "web_page") {
            editExeNow.path = $("#edit-url-add-app").val();
        }
        else if (editExeNow.type_exec == "cmd") {
            editExeNow.path = $("#edit-cmd-add-app").val();
        }

        var list_programs = DAO.ProgramsExe.get('list_programs'), newList = new Array();
        await list_programs.forEach(element => {
            if (element.name == editExeNow.name)
                element = editExeNow;
            newList.push(element);
        });
        await DAO.ProgramsExe.set('list_programs', newList);
        DAO.List_programs = newList;
        await changeAppsHtml();

        if (fileOld) {
            if (fileOld.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe')) && fileOld != editExeNow['iconCustom']) {
                fs.access(fileOld, fs.constants.F_OK, (err) => {
                    if (!err)
                        fs.unlinkSync(fileOld)
                })
            }
        }

        $(".div-edit-url").addClass("hidden");
        $(".div-edit-cmd").addClass("hidden");
        $("#edit-url-add-app").val("");
        $("#edit-cmd-add-app").val("");
        $('.btn-close-exe-modal').click();
        $("#icon-exe-edit").val('');
        toaster.success(`${getNameTd('.Successfully_edited')}`);
        BACKEND.Send('OV-Update-data', {type: 'apps', data: []});
    });
};

async function saveIconFile(fileInput, callback) {
    if (fileInput) {
        var dirCopy = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe', `${editExeNow.name.replace('.', '-').replaceAll('/', '-').replaceAll('\\', '-')}-${fileInput.name}`);
        const oldFile = editExeNow.iconCustom;
        fs.copyFile(fileInput.path, dirCopy, (err) => {
            if (err) throw err;
            editExeNow['iconCustom'] = dirCopy;
            callback(oldFile);
        })
    } else {
        callback();
    }
};

const add_new_webpage = async () => {
    var name = $("#name_webpage").val();
    var url = $("#url_webpage").val();
    if (name.length > 0 && url.length > 0) {
        var list_webpages = await DAO.DB.get("web_page_saved");
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
            id: id,
            name: name,
            url: url,
            status: "no open",
        }
        list_webpages.push(obj);
        await DAO.DB.set("web_page_saved", list_webpages);
        await add_im_list_webpages(obj);
        $(".btn-close-webpage-modal").click();
        $('.footable').footable().trigger('footable_resize');
        BACKEND.Send('OV-Update-data', {type: 'webpages', data: []});
    }
    else {
        if (name.length < 1) {
            toaster.danger(getNameTd('.requere_name_add_app'));
        }
        if (name.length < 1) {
            toaster.danger(getNameTd('.requere_url_add_app'));
        }
    }
}

const installed_software_select = async (id) => {
    var item = _list_installed_software.filter(f => f.id_for_select == id)[0];
    if (item) {
        if ($("#name-c-to-app").val() == '' || $("#name-c-to-app").val() == radio_select_name_file) {
            $("#name-c-to-app").val(item.DisplayName)
            radio_select_name_file = item.DisplayName;
        }
        radio_select_file_dir = item.DisplayIcon;
        radio_select_file_info = await fs.statSync(radio_select_file_dir);
    }
}

const list_installed_software = async () => {
    if ($("#list_installed_software").hasClass('show') != true) {
        if (_list_installed_software.length == 0 && im_list != true) {
            toaster.warning(getNameTd(".please_wait"));
            im_list = true;
            setTimeout(async () => {
                var temp_list = await getAllInstalledSoftwareSync();
                temp_list = await temp_list.filter(f => f.DisplayIcon != null && f.DisplayIcon.includes('.exe') == true && fs.existsSync(f.DisplayIcon) == true && !f.DisplayIcon.includes('ProgramData') && !f.DisplayIcon.includes('Windows') && !f.DisplayIcon.includes('System32') && !f.DisplayIcon.includes('unis'));
                $($("#list_installed_software").find('.card-content-spinner')[0]).hide('slow');
                var count_id = 1000;
                temp_list.forEach(item => {
                    if (item.DisplayIcon.includes(".exe,"))
                        item.DisplayIcon = item.DisplayIcon.split(".exe,")[0] + ".exe";
                    item.id_for_select = count_id;

                    $("#list_software").append(`<div class="form-check form-check-for-${item.id_for_select}">
                        <input class="form-check-input" type="radio" onClick='installed_software_select(${item.id_for_select})' name="flexRadioDefault" id="radio-select-${item.id_for_select}">
                        <label class="form-check-label" for="radio-select-${item.id_for_select}">
                          ${item.DisplayName}
                        </label>
                        <button title="${getNameTd(".locate_dir")} " class="btn btn-primary btn-sm-custom float-right" onClick="open_file_brosewr(${item.id_for_select})"><i class="bi bi-folder-fill"></i></button>
                    </div>`);
                    _list_installed_software.push(item);
                    count_id = count_id + 1;
                })
            }, 1000);
        }
    }
}

const change_position_list = async () => {
    let listApps = await DAO.ProgramsExe.get('list_programs');
    var con = 1, list = [];
    for (let index = 0; index < $(".list_apps div.col").length; index++) {
        const element = $(".list_apps div.col")[index];
        var _ir = element.id.replaceAll('col-exe-id-', '');
        list.push({ pos: index + 1, _id: _ir });

        if (element == $(".list_apps div.col")[$(".list_apps div.col").length - 1]) {
            var new_l = [];
            listApps.forEach(async e => {
                var dtr = await list.filter(f => f._id == e._id)[0];
                if (dtr) {
                    e.positon_l = dtr.pos;
                }
                await new_l.push(e);
                if (e == listApps[listApps.length - 1]) {
                    await DAO.ProgramsExe.set('list_programs', await new_l.sort(compare_positon_l));
                    BACKEND.Send('OV-Update-data', {type: 'apps', data: []});
                }
            })
        }
    }
}

async function addExeShotCut(id) {
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var item = list_programs.filter(b => b._id == id)[0];
    if (item) {
        /*await selectMenu('keys-macros');
        $("#button-add-macro").click();*/
        $("#modal-key-macro").modal('show');
        addShortCut(item._id);
    }
}

async function clear_add_app() {
    $("#previwSeletedIconAddApp").attr('src', path.join(APP_PATH, "/Domain/src/img/underbot_logo.png"));
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
    $('#bnt-select-type-add-app').text(getNameTd(".select_text"));
    $('.alert-add-app').text("").addClass('hidden');
    $("#name-c-to-app").val("");
    $("#select-soundpad-audio").val("");
    $("#url-add-app").val("");
    $("#cmd-add-app").val("");
    $("#input-app-audio").val('');
    $("#name-custom-obs-scene").val("");
    $("#select-obs-scene").val('');
    $('#select-audios-inputs').val('');
    $("#select-obs-options").val('')
    $("#select-discord-integration").val('');
    old_sbs_scene_selected = null;
    add_app.type_exec = null;
    _list_installed_software = [];
    radio_select_name_file = null;
    im_list = false;
    radio_select_file_dir = null;
    radio_select_file_info = null;
    $("#list_software").html("");
    $($("#list_installed_software").find('.card-content-spinner')[0]).show('slow');
    $("#list_installed_software").collapse('hide');
    BACKEND.Send('OV-Update-data', {type: 'apps', data: []});
}

async function select_type_add_app(type, id, text_type, id_remove_hidden) {
    $("#previwSeletedIconAddApp").attr('src', path.join(APP_PATH, "/Domain/src/img/underbot_logo.png"));
    $("#icon-custom-add-app").val('');
    $('.alert-add-app').html(``).addClass('hidden');
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
    $("#select-soundpad-audio").val("");
    $("#url-add-app").val("");
    $("#cmd-add-app").val("");
    $('#input-app-exec').val("");
    $('#input-app-audio').val("");
    $("#name-custom-obs-scene").val("");
    $("#select-obs-options").val('');
    $("#select-discord-integration").val('');
    old_sbs_scene_selected = null;
    if (type == 'obs_wss') {
        if (await BACKEND.Send('Obs_wss_p', { stage: 'is_started' }) != true) {
            $('.alert-add-app').html(`
                ${getNameTd('.plsconfigureandconnectwssobs')} <a class='a-style' onClick="$('.bnt-close-modal-add-app').click();selectMenu('obs-studio');">${getNameTd('.obs_studio_n_text')}</a>.
            `).removeClass('hidden');
            //toaster.danger(getNameTd('.notpossibleaddappobs'));
            return;
        }
    }
    add_app.type_exec = type;
    $("#bnt-select-type-add-app").text(getNameTd(text_type));
    $("#formselecCustomIcon").removeClass("hidden");
    $("#formselecCustomName").removeClass("hidden");
    $(id_remove_hidden).removeClass("hidden");
}

async function add_new_app() {
    $('.alert-add-app').text("").addClass('hidden');
    var icon = null;
    var nameCustom = "";

    if(add_app.type_exec === "options_os"){
        if ($("#name-c-to-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-c-to-app').focus();
            return;
        }
        if ($("#select-options-os-integration").val().length == 0) {
            toaster.warning(getNameTd(".requere_cmd_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_cmd_add_app")).removeClass('hidden');
            $('#select-options-os-integration').focus();
            return;
        }
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        let option = $("#select-options-os-integration").val();
        add_app_for_os_option(option, icon, nameCustom);
    }
    else if (add_app.type_exec == "discord") {
        if ($("#name-c-to-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-c-to-app').focus();
            return;
        }
        if ($("#select-discord-integration").val().length == 0) {
            toaster.warning(getNameTd(".requere_cmd_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_cmd_add_app")).removeClass('hidden');
            $('#select-discord-integration').focus();
            return;
        }
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        let discord_option = $("#select-discord-integration").val();
        add_app_for_discord(discord_option, icon, nameCustom);
    }
    else if (add_app.type_exec == "audio") {
        var executable = $('#input-app-audio')[0].files[0];
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        if (executable == null) {
            toaster.warning(getNameTd(".p_s_a_audio_text"));
            $('.alert-add-app').text(getNameTd(".p_s_a_audio_text")).removeClass('hidden');
            $('#input-app-audio').focus();
            return;
        }
        if (executable == null && radio_select_file_dir != null) {
            executable = {
                lastModified: radio_select_file_info.mtime,
                lastModifiedDate: radio_select_file_info.mtime,
                name: path.basename(radio_select_file_dir),
                path: radio_select_file_dir,
                size: radio_select_file_info.size,
                type: "application/x-msdownload",
                webkitRelativePath: '',
            };
        }
        else if (!executable.type.includes('audio/')) {
            toaster.warning(getNameTd(".file_not_accepted"));
            $('.alert-add-app').text(getNameTd(".file_not_accepted")).removeClass('hidden');
            $("#name-c-to-app").val('');
            $('#input-app-audio').val('');
            $('#input-app-audio').focus();
            return;
        }
        add_app_for_file(executable, icon, nameCustom);
    }
    else if (add_app.type_exec == "soundpad_audio") {
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        let soundpad_audio = $("#select-soundpad-audio").val();
        if (nameCustom.length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $("#name-c-to-app").focus();
            return;
        }
        if (soundpad_audio == '') {
            toaster.warning(getNameTd(".p_s_a_s_soundpad_audio_text"));
            $('.alert-add-app').text(getNameTd(".p_s_a_s_soundpad_audio_text")).removeClass('hidden');
            $('#select-soundpad-audio').focus();
            return;
        }
        add_app_for_soundpad_audio(soundpad_audio, icon, nameCustom);
    }
    else if (add_app.type_exec == "exe") {
        var executable = $('#input-app-exec')[0].files[0];
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        if (executable == null && radio_select_file_info == null) {
            toaster.warning(getNameTd(".p_s_a_e_text"));
            $('.alert-add-app').text(getNameTd(".p_s_a_e_text")).removeClass('hidden');
            $('#input-app-exec').focus();
            return;
        }
        if (executable == null && radio_select_file_dir != null) {
            executable = {
                lastModified: radio_select_file_info.mtime,
                lastModifiedDate: radio_select_file_info.mtime,
                name: path.basename(radio_select_file_dir),
                path: radio_select_file_dir,
                size: radio_select_file_info.size,
                type: "application/x-msdownload",
                webkitRelativePath: '',
            };
        }
        else if (!executable.type.includes('application/')) {
            toaster.warning(getNameTd(".file_not_accepted"));
            $('.alert-add-app').text(getNameTd(".file_not_accepted")).removeClass('hidden');
            $("#name-c-to-app").val('');
            $('#input-app-exec').val('');
            $('#input-app-exec').focus();
            return;
        }
        add_app_for_file(executable, icon, nameCustom);
    }
    else if (add_app.type_exec == "web_page") {
        if ($("#name-c-to-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-c-to-app').focus();
            return;
        }
        if ($("#url-add-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_url_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_url_add_app")).removeClass('hidden');
            $('#url-add-app').focus();
            return;
        }
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        let url = $("#url-add-app").val();
        add_app_for_web_page(url, icon, nameCustom)
    }
    else if (add_app.type_exec == "cmd") {
        if ($("#name-c-to-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-c-to-app').focus();
            return;
        }
        if ($("#cmd-add-app").val().length == 0) {
            toaster.warning(getNameTd(".requere_cmd_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_cmd_add_app")).removeClass('hidden');
            $('#cmd-add-app').focus();
            return;
        }
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-c-to-app").val();
        let cmd = $("#cmd-add-app").val();
        add_app_for_cmd(cmd, icon, nameCustom);
    }
    else if (add_app.type_exec == 'obs_wss') {
        icon = $("#icon-custom-add-app")[0].files[0];
        nameCustom = $("#name-custom-obs-scene").val();
        var id_obs_scene = $('#select-obs-scene').val();
        var id_obs_input_audio = $("#select-audios-inputs").val();
        if (nameCustom.length == 0) {
            toaster.warning(getNameTd(".requere_name_add_app"));
            $('.alert-add-app').text(getNameTd(".requere_name_add_app")).removeClass('hidden');
            $('#name-c-to-app').focus();
            return;
        }
        if (OBS_TEMP_DATA != null && OBS_TEMP_DATA.scenes.scenes.length > 0) {
            var scene = OBS_TEMP_DATA.scenes.scenes.filter(f => f.sceneUuid == id_obs_scene)[0];
            var input_audio = OBS_TEMP_DATA.audios.inputs.filter(f => f.inputUuid == id_obs_input_audio)[0];
            if (scene != null) {
                add_app_obs_option_scene(scene, icon, nameCustom, false);
            }
            else if (input_audio != null) {
                add_app_obs_option_input_audio(input_audio, icon, nameCustom, false);
            }
            else if ($('#select-obs-options').val() != '') {
                add_app_obs_options($('#select-obs-options').val(), icon, nameCustom, true);
            }
            else {
                toaster.danger(getNameTd('.pls_select_obs_scene'));
                $('.alert-add-app').text(getNameTd(".pls_select_obs_scene")).removeClass('hidden');
            }
        }
        else if ($('#select-obs-options').val() != '') {
            add_app_obs_options($('#select-obs-options').val(), icon, nameCustom, true);
        }
        else {
            toaster.danger(getNameTd('.pls_update_list_scene'));
            $('.alert-add-app').text(getNameTd(".pls_update_list_scene")).removeClass('hidden');
        }
    }
    else {
        toaster.danger(getNameTd('.err_select_type_add_text'));
    }
}

const add_app_obs_options = async (typeOption, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.obsOption == typeOption)
                isFileSaved = true;
        });
    }

    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");

            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: null, obsOption: typeOption, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_scene_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_scene_already_registered")).removeClass('hidden');
    }
}

const add_app_obs_option_scene = async (scene, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.scene == scene || item.scene != null && item.scene.sceneUuid == scene.sceneUuid)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");

            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: scene, obsOption: 'scene', type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_scene_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_scene_already_registered")).removeClass('hidden');
    }
}

const add_app_obs_option_input_audio = async (audio_input, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.scene == audio_input || item.audioInput != null && item.audioInput.inputUuid == audio_input.inputUuid)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");

            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, scene: null, audioInput: audio_input, obsOption: 'audioinput_mute', type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_inputaudio_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_inputaudio_already_registered")).removeClass('hidden');
    }
}

const add_app_for_soundpad_audio = async (soundpadHash, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.hash == soundpadHash)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;
        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: null, hash: soundpadHash, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_soundpad_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_soundpad_already_registered")).removeClass('hidden');
    }
}

const add_app_for_os_option = async (action, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.path == action)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;
        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null) dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: action, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".There_is_already_a_record_of_this_action_for_the_operating_system"));
        $('.alert-add-app').text(getNameTd(".There_is_already_a_record_of_this_action_for_the_operating_system")).removeClass('hidden');
    }
}

const add_app_for_discord = async (discord_action, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.path == discord_action)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;
        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: discord_action, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_discord_action_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_discord_action_already_registered")).removeClass('hidden');
    }
}

const add_app_for_cmd = async (cmd, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.path == cmd)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;
        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null)
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: cmd, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_cmd_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_cmd_already_registered")).removeClass('hidden');
    }
}

const add_app_for_web_page = async (url, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == nameCustom)
                isFileSaved = true;
            else if (item.path == url)
                isFileSaved = true;
        });
    }
    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, nameCustom, async (dir_icon) => {
            if (dir_icon == null) {
                dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            }
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: "", lastModifiedDate: "", name: nameCustom, nameCustom: nameCustom, path: url, scene: null, obsOption: null, type: "", size: "", iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        })
    }
    else {
        toaster.warning(getNameTd(".this_is_web_page_already_registered"));
        $('.alert-add-app').text(getNameTd(".this_is_web_page_already_registered")).removeClass('hidden');
    }
}

const add_app_for_file = async (file, icon, nameCustom) => {
    var filesSaved = await DAO.ProgramsExe.get('list_programs'), isFileSaved = false;
    if (filesSaved != null) {
        await filesSaved.forEach(item => {
            if (item.name == file.name)
                isFileSaved = true;
        });
    }

    if (!isFileSaved) {
        var _idItem = null;
        var positon_rl = 1;
        if (filesSaved != null && filesSaved.length > 0) {
            if (filesSaved.length > 1) {
                var iret = filesSaved.sort(compare__id).pop();
                _idItem = iret._id + 1;
            }
            else
                _idItem = filesSaved[0]._id + 1;

            var lra = await filesSaved.sort(compare_positon_l);
            positon_rl = lra[lra.length - 1].positon_l + 1;
        }
        else
            _idItem = 1;

        save_icon_app_file(icon, file.name, async (dir_icon) => {
            let icon_but_exe = null;
            if (dir_icon == null) {
                icon_but_exe = await get_icon_by_exe(file.path, path.join(DAO.DB_DIR, '\\UN-DATA\\icons-exe\\'));
                if (icon_but_exe != null)
                    dir_icon = icon_but_exe;
                else
                    dir_icon = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
            }
            var item = { _id: _idItem, positon_l: positon_rl, type_exec: add_app.type_exec, lastModified: file.lastModified, lastModifiedDate: file.lastModifiedDate, name: file.name, nameCustom: nameCustom, path: file.path, scene: null, obsOption: null, type: file.type, size: file.size, iconCustom: dir_icon }
            await DAO.ProgramsExe.push("list_programs", item);
            if (icon_but_exe != null) {
                item.iconCustom = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
                setTimeout(() => {
                    $(`#col-exe-id-${_idItem} img`).attr("src", icon_but_exe);
                }, 3000);
            }
            appendHtml(item, _idItem);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            $('.bnt-close-modal-add-app').click();
            clear_add_app();
            toaster.success(`${getNameTd('.Added_successfully')}`);
        });
    }
    else {
        if (file.type.includes('audio/') == true) {
            toaster.warning(getNameTd(".this_is_audio_already_registered"));
            $('.alert-add-app').text(getNameTd(".this_is_audio_already_registered")).removeClass('hidden');
        }
        else {
            toaster.warning(getNameTd(".t_e_i_a_r_text"));
            $('.alert-add-app').text(getNameTd(".t_e_i_a_r_text")).removeClass('hidden');
        }
    }
}