var typeOld = "default", pageNow = 0, pvw_page_item_NOW = null, listAllPermissins = [], pvw_page_edit_NOW = null;

$(document).on('click', '#MenuSideMenus li.nav-item[data-id="webunderdeck"]', async function (e) {
    e.preventDefault();
    changeAppsHtml();
});

$(document).ready(async () => {
    await DAO.GetDataNow();
    if (DAO.WEBDECKDATA.formatView == null) {
        DAO.WEBDECKDATA.formatView = "8x4";
        await DAO.WEBDECK.set('format_view', DAO.WEBDECKDATA.formatView);
    }

    if (DAO.WEBDECKDATA.formatListView == null) {
        DAO.WEBDECKDATA.formatListView = "default";
        await DAO.WEBDECK.set('format_list_view', DAO.WEBDECKDATA.formatListView);
    }

    $(`#change-webdeck-view option[value="${DAO.WEBDECKDATA.formatView}"]`).prop('selected', true);
    if (DAO.WEBDECK.get('pages') == null || DAO.WEBDECK.get('pages').length == 0) {
        await setDefaultConfgi(true);
    }

    $(`#change-webdeck-mode-list-view option[value="${DAO.WEBDECKDATA.formatListView}"]`).prop('selected', true);

    $("#change-webdeck-view").on("change", async () => {
        var type = $("#change-webdeck-view").val();
        ChangeSelectWebdeckView(type);
    });

    $("#change-webdeck-mode-list-view").on("change", async () => {
        var type = $("#change-webdeck-mode-list-view").val();
        await DAO.WEBDECK.set('format_list_view', type);
        DAO.WEBDECKDATA.formatListView = type;
    });

    $(".wendeckpreview").on("click", ".pvw-add-item", async (event) => {

        bootbox.dialog({
            message: `<h4>${getNameTd('.Dywtcnposana')}</h4>`,
            buttons: {
                cancel: {
                    label: getNameTd('.cancel_icon_text'),
                    className: "btn btn-danger cancel_icon_text",
                },
                new_page: {
                    label: getNameTd('.page_icon'),
                    className: 'btn-info page_icon',
                    callback: async function () {
                        if (DAO.WEBDECKDATA.pages.length <= 1) {
                            WebDeckCreateNewPage(event);
                        }
                        else {
                            bootbox.dialog({
                                message: `<h4>${getNameTd('.DywtcnposanaEX')}</h4>`,
                                buttons: {
                                    new_page: {
                                        label: getNameTd('.New_page_text'),
                                        className: 'btn-info New_page_text',
                                        callback: async function () {
                                            WebDeckCreateNewPage(event);
                                        }
                                    },
                                    exist_page: {
                                        label: getNameTd('.selecting_text'),
                                        className: 'btn-info selecting_text',
                                        callback: async function () {
                                            ModalSelectPageWebDeck(async (data) => {
                                                let page = DAO.WEBDECKDATA.pages[pageNow];
                                                pvw_page_item_NOW = page.items.find(f => f.id == $(event.currentTarget).attr('id').replace("pvw-", ""));
                                                pvw_page_item_NOW.type = 'page';
                                                pvw_page_item_NOW.app = { _id: data.id };
                                                await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                                                confirm_add_pvw_wbdc();
                                            });
                                        }
                                    }
                                },
                            });
                        }
                    }
                },
                app_name: {
                    label: getNameTd('.app_name_icon'),
                    className: 'btn-info app_name_icon',
                    callback: async function () {
                        clear_modal_pvw_wbdc();
                        let page = DAO.WEBDECKDATA.pages[pageNow];
                        pvw_page_item_NOW = page.items.find(f => f.id == $(event.currentTarget).attr('id').replace("pvw-", ""));
                        if (pvw_page_item_NOW) {
                            $(".ul-dropdown-pvw-wbdc").html("");
                            $('.btn-dropdown-pvw-wbdc').text(getNameTd(".apps_name")).attr("disabled", false);
                            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
                            if (DAO.List_programs != null && DAO.List_programs.length > 0) {
                                DAO.List_programs.forEach(item => {
                                    let name = item.name.replace('.exe', '');
                                    if (item.nameCustom.length > 0) name = item.nameCustom;
                                    $(".ul-dropdown-pvw-wbdc").append(`
                                        <li onClick="select_program_pvw_wbdc(${item._id})" class="d-flex" id="li-pvw-wbdc-${item._id}">
                                            <img class="img-tbody-list-keys-macros ml-1" src="${item.iconCustom}">
                                            <a class="dropdown-item" href="#">${name}</a>
                                        </li>
                                    `);
                                });
                            }
                            $("#modal-select-app-pvw-wbdc").modal('show');
                        }
                        else {
                            clear_modal_pvw_wbdc();
                            toaster.danger(`${getNameTd('.no_app_found_text')}`);
                        }
                    }
                }
            },
        });
    });

    $(".wendeckpreview").on("click", ".pvw-edit-item", async (e) => {
        clear_modal_pvw_wbdc();

        let page = DAO.WEBDECKDATA.pages[pageNow];
        pvw_page_item_NOW = page.items.find(f => f.id == $(e.currentTarget).attr('id').replace("pvw-", ""));
        if (pvw_page_item_NOW) {
            $(".btn-remove-pvw-wbdc").show();
            $(".ul-dropdown-pvw-wbdc").html("");
            $('.btn-dropdown-pvw-wbdc').text(getNameTd(".apps_name")).attr("disabled", false);
            DAO.List_programs = await DAO.ProgramsExe.get('list_programs');
            if (DAO.List_programs != null && DAO.List_programs.length > 0) {
                DAO.List_programs.forEach(item => {
                    let name = item.name.replace('.exe', '');
                    if (item.nameCustom.length > 0) name = item.nameCustom;
                    $(".ul-dropdown-pvw-wbdc").append(`
                        <li onClick="select_program_pvw_wbdc(${item._id})" class="d-flex" id="li-pvw-wbdc-${item._id}">
                            <img class="img-tbody-list-keys-macros ml-1" src="${item.iconCustom}">
                            <a class="dropdown-item" href="#">${name}</a>
                        </li>
                    `);

                    if (item._id == pvw_page_item_NOW.app._id) {
                        select_program_pvw_wbdc(item._id);
                    }
                });
            }
            $("#modal-select-app-pvw-wbdc").modal('show');
        }
        else {
            clear_modal_pvw_wbdc();
            toaster.danger(`${getNameTd('.no_app_found_text')}`);
        }
    });

    $(".wendeckpreview").on("click", ".pvw-edit-page-item", async (e) => {
        let page = DAO.WEBDECKDATA.pages[pageNow];
        pvw_page_item_NOW = page.items.find(f => f.id == $(e.currentTarget).attr('id').replace("pvw-", ""));
        if (pvw_page_item_NOW) {
            bootbox.dialog({
                message: `<h3>${getNameTd('.dywtotpori')}</h3>`,
                buttons: {
                    cancel: {
                        label: getNameTd('.cancel_icon_text'),
                        className: "btn btn-danger cancel_icon_text",
                    },
                    danger: {
                        label: getNameTd('.remove_icon'),
                        disabled: DAO.WEBDECKDATA.pages.find(f => f.id == pvw_page_item_NOW.app._id).type == 'home' ? true : false,
                        className: "btn btn-danger remove_icon",
                        callback: async function () {
                            clear_modal_pvw_wbdc_and_remove();
                        }
                    },
                    edit: {
                        label: getNameTd('.edit_icon'),
                        className: "btn btn-primary edit_icon",
                        callback: function () {
                            EditPageWebDeck(pvw_page_item_NOW.app._id);
                        }
                    },
                    success: {
                        label: getNameTd('.open_icon_text'),
                        className: "btn btn-success open_icon_text",
                        callback: function () {
                            pageNow = DAO.WEBDECKDATA.pages.findIndex(x => x.id === pvw_page_item_NOW.app._id);
                            loadPreviwWebDeck();
                        }
                    }
                }
            });
        }
        else {
            clear_modal_pvw_wbdc();
            toaster.danger(`${getNameTd('.no_app_found_text')}`);
        }
    });

    $(document).on("click", ".listWebDeckPages", async (e) => {
        e.preventDefault();
        let html = "";
        let pages = DAO.WEBDECKDATA.pages;
        pages.forEach(page => {
            html += `
            <div id="colMd-${page.id}" class="col-md-12">
                <div class="card theme-card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="d-flex justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <img src="${page.icon}" class="img-thumbnail rounded" style="width: 50px; height: 50px;">
                                        <h5 class="m-2">${page.name}</h5>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <a href="#" class="btn btn-sm btn-primary btn-edit-webdeck-page me-1" data-id="${page.id}">
                                            <i class="bi bi-pencil-square"></i>
                                        </a>
                                        <a href="#" ${page.type == 'home' ? 'disabled' : ''} class="btn btn-sm btn-danger ${page.type == 'home' ? 'disabled' : 'btn-remove-webdeck-page'}" data-id="${page.id}">
                                            <i class="bi bi-trash"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            if (page == pages[pages.length - 1]) {
                bootbox.dialog({
                    title: `${getNameTd('.webdeck_pages_text')}`,
                    message: html,
                    buttons: {
                        danger: {
                            label: getNameTd('.close_icon'),
                            className: "btn btn-danger close_icon"
                        },
                        createNewPage: {
                            label: getNameTd('.New_page_icon'),
                            className: "btn btn-primary New_page_icon",
                            callback: function () {
                                getNewNamePage(async (name) => {
                                    ModalGetImagem(true, async (file, default_image) => {
                                        let split = DAO.WEBDECKDATA.formatView.split('x');
                                        let rows = parseInt(split[0]);
                                        let cols = parseInt(split[1]);
                                        let countPerPage = rows * cols;
                                        let list = [];
                                        for (let index = 1; index < (countPerPage + 1); index++) {
                                            if (index == 1) {
                                                list.push({
                                                    id: index,
                                                    type: 'page',
                                                    app: { _id: DAO.WEBDECKDATA.pages[0].id },
                                                });
                                                continue;
                                            }
                                            else {
                                                list.push({
                                                    id: index,
                                                    type: null,
                                                    app: null,
                                                });
                                                continue;
                                            }
                                        }
                                        let uuid = uuidv4();
                                        if(typeof file === 'object' && file.name) {
                                            save_icon_PageWebDeckNF(file, uuid, async (dir_icon) => {
                                                await DAO.WEBDECKDATA.pages.push({
                                                    id: uuid,
                                                    name: name,
                                                    icon: dir_icon,
                                                    type: 'page',
                                                    items: list,
                                                });
                                                confirm_add_pvw_wbdc();
                                            });
                                        }
                                        else {
                                            save_copy_default_icon_PageWebDeck_file(default_image, uuid, async (dir_icon) => {
                                                await DAO.WEBDECKDATA.pages.push({
                                                    id: uuid,
                                                    name: name,
                                                    icon: dir_icon,
                                                    type: 'page',
                                                    items: list,
                                                });
                                                confirm_add_pvw_wbdc();
                                            });
                                        }
                                    })
                                });
                            }
                        }
                    }
                });
            }
        });
    });

    $(document).on("click", ".btn-edit-webdeck-page", async (e) => {
        EditPageWebDeck(e.currentTarget.dataset.id);
    });

    $(document).on("click", ".btn-remove-webdeck-page", async (e) => {
        let pageId = e.currentTarget.dataset.id;
        if (await B_are_you_sure() == true) {
            $("body").modalLoading('show');
            let page = DAO.WEBDECKDATA.pages.find(f => f.id == pageId);
            if (page) {
                DAO.WEBDECKDATA.pages = DAO.WEBDECKDATA.pages.filter(f => f.id != pageId);
                if (page.icon.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages'))) {
                    fs.access(page.icon, fs.constants.F_OK, (err) => {
                        if (!err)
                            fs.unlinkSync(page.icon);
                    })
                }
            }
            await Promise.all(DAO.WEBDECKDATA.pages.map(async page => {
                page.items = await page.items.map(item => {
                    if (item.app != null && item.app._id == pageId) {
                        item.app = null;
                        item.type = null;
                    }
                    return item;
                });
                return page;
            }));
            await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
            $(`#colMd-${pageId}`).remove();
            toaster.success(`${getNameTd('.Page_Successfully_removed')}`);
            $("body").modalLoading('hide');
            clear_modal_pvw_wbdc();
            loadPreviwWebDeck();
        }
    });

    $(document).on('change', '#webdeck_background_color', async (e) => {
        await DAO.WEBDECK.set('exe-background', $("#webdeck_background_color").val());
    });

    $(document).on('change', '#webdeck_color_text', async (e) => {
        await DAO.WEBDECK.set('exe-color-text', $("#webdeck_color_text").val());
    });

    $(document).on('click', '#openInvitationUNDRemotVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
            exec(`start ${process.env.API_URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`);
        }
        else {
            bootbox.alert(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '#openInvitationQRCODEUNDRemotVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
            let uri = `${process.env.API_URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`;
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
        else {
            bootbox.alert(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '#revoke_all_permissions_UNDRemoteVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
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
                        await revokeAllPermissionAcessThisPC();
                        bootbox.alert(getNameTd('.access_permissions_for_all_users_have_been_revoked'));
                        toaster.success(getNameTd('.access_permissions_for_all_users_have_been_revoked'));
                    }
                }
            });
        }
        else {
            bootbox.alert(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $("#reset_to_default_webdeck_colors").click(async () => {
        $("#reset_to_default_webdeck_colors").prop('disabled', true);
        await DAO.WEBDECK.set('exe-background', '#370179');
        await DAO.WEBDECK.set('exe-color-text', '#ffffff');
        changeInputColor();
        $("#reset_to_default_webdeck_colors").prop('disabled', false);
        toaster.success(getNameTd('.successfully_reset_text'));
    });

    $(document).on('click', '#list_all_permissions_UNDRemoteVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
            $("body").modalLoading('show', false);
            API.App.post('', {
                _lang: _lang,
                method: "list-this-pc-users-permissions",
                client_id: DAO.USER.client_id,
                token: DAO.USER.token,
                pc_id: DAO.PC.id,
                pc_name: DAO.PC.name,
            })
                .then(async (res) => {
                    $("body").modalLoading('hide', false);
                    let html = '';
                    if (res && res.data && res.data.result) {
                        listAllPermissins = res.data.result;
                        if (listAllPermissins.length > 0) {
                            listAllPermissins.forEach(data => {
                                let user = data.user;
                                let isMyFriend = false;
                                if (DAO.USER.friends.find(f => f.client_id == user.id || f.friend_id == user.id)) isMyFriend = true;
                                html += `
                                <div id="${user.id}${data.client_id_pc}" class="col-md-12">
                                    <div class="card theme-card me-1">
                                        ${GetNamePlateForUser(user)}
                                        <div class="card-body z-1">
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="d-flex justify-content-between">
                                                        <div class="d-flex align-items-center">
                                                            <img src="${user.avatar}" class="img-thumbnail rounded-circle ${user.classBg}" style="width: 100px; height: 100px;">
                                                            <h5 class="m-2 ${user.premium == true ? 'text-warning' : ''}">${user.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${user.name}</h5>
                                                        </div>
                                                        <div class="d-flex align-items-center">
                                                            <button href="#" class="btn btn-sm btn-success me-1 Friends_icon_text ${isMyFriend == true ? '' : 'hidden'}">
                                                                ${getNameTd('.Friends_icon_text')}
                                                            </button>
                                                            <button href="#" class="btn btn-sm btn-danger remove_icon BTN_RMUNDREMOTEPERM" data-id="${user.id}">
                                                                ${getNameTd('.remove_icon')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                `
                            });
                        }
                        else {
                            html += `<div class="col-md-12">
                                        <div class="card theme-card me-1">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="d-flex justify-content-between">
                                                            <div class="d-flex align-items-center">
                                                                <h5 class="m-2">${getNameTd('.no_permission_found')}</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        }
                        bootbox.dialog({
                            title: `<h5>${getNameTd('.permissions_text')}</h5>`,
                            message: html,
                            buttons: {
                                remote: {
                                    label: getNameTd('.cancel_icon_text'),
                                    className: 'btn-danger cancel_icon_text',
                                },
                            }
                        });
                    }
                    else {
                        toaster.danger(getNameTd('.no_data_found'));
                    }
                })
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '.BTN_RMUNDREMOTEPERM', (e) => {
        B_are_you_sure().then(async (result) => {
            if (result) {
                console.log(e.target.id, e);
                let permission = listAllPermissins.find(x => x.user.id == e.target.dataset.id);
                if (permission) {
                    $("body").modalLoading('show', false);
                    API.App.post('', {
                        _lang: _lang,
                        method: "remove-this-pc-users-permissions",
                        client_id: DAO.USER.client_id,
                        token: DAO.USER.token,
                        pc_id: DAO.PC.id,
                        pc_name: DAO.PC.name,
                        client_id_RM: permission.client_id,
                    })
                        .then(async (res) => {
                            $("body").modalLoading('hide', false);
                            listAllPermissins = listAllPermissins.filter(x => x.user.id != e.target.dataset.id);
                            $(`#${permission.user.id}${permission.client_id_pc}`).remove();
                            toaster.success(getNameTd('.Successfully_removed'));
                        });
                }
                else {
                    bootbox.alert(getNameTd('.no_data_found'));
                }
            }
        });
    });

    ChangeSelectWebdeckView();
});

function WebDeckCreateNewPage(event) {
    getNewNamePage(async (name) => {
        ModalGetImagem(true, async (file, default_image) => {
            let split = DAO.WEBDECKDATA.formatView.split('x');
            let rows = parseInt(split[0]);
            let cols = parseInt(split[1]);
            let countPerPage = rows * cols;
            let list = [];
            for (let index = 1; index < (countPerPage + 1); index++) {
                if (index == 1) {
                    list.push({
                        id: index,
                        type: 'page',
                        app: { _id: DAO.WEBDECKDATA.pages[0].id },
                    });
                    continue;
                }
                else {
                    list.push({
                        id: index,
                        type: null,
                        app: null,
                    });
                    continue;
                }

            }
            let uuid = uuidv4();
            if(typeof file === 'object' && file.name) {
                save_icon_PageWebDeckNF(file, uuid, async (dir_icon) => {
                    await DAO.WEBDECKDATA.pages.push({
                        id: uuid,
                        name: name,
                        icon: dir_icon,
                        type: 'page',
                        items: list,
                    });

                    let page = DAO.WEBDECKDATA.pages[pageNow];
                    pvw_page_item_NOW = page.items.find(f => f.id == $(event.currentTarget).attr('id').replace("pvw-", ""));
                    pvw_page_item_NOW.type = 'page';
                    pvw_page_item_NOW.app = { _id: uuid };
                    await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                    confirm_add_pvw_wbdc();
                });
            }
            else {
                save_copy_default_icon_PageWebDeck_file(default_image, uuid, async (dir_icon) => {
                    await DAO.WEBDECKDATA.pages.push({
                        id: uuid,
                        name: name,
                        icon: dir_icon,
                        type: 'page',
                        items: list,
                    });

                    let page = DAO.WEBDECKDATA.pages[pageNow];
                    pvw_page_item_NOW = page.items.find(f => f.id == $(event.currentTarget).attr('id').replace("pvw-", ""));
                    pvw_page_item_NOW.type = 'page';
                    pvw_page_item_NOW.app = { _id: uuid };
                    await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                    confirm_add_pvw_wbdc();
                });
            }
        })
    });
}

async function EditPageWebDeck(pageId) {
    let page = DAO.WEBDECKDATA.pages.find(f => f.id == pageId);
    if (page) {
        $(".bootbox-close-button").click();
        bootbox.dialog({
            title: `${getNameTd('.edit_webdeck_page_text')}`,
            message: `
                <div id="colMd-${page.id}" class="col-md-12">
                    <div class="card theme-card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex align-items-center">
                                            <img src="${typeof page.icon === 'object' && page.icon.size ? await convertImageToBase64(page.icon) : page.icon}" class="img-thumbnail rounded" style="width: 75px; height: 75px;">
                                            <h5 class="m-2">${page.name}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            closeButton: false,
            buttons: {
                danger: {
                    label: getNameTd('.cancel_icon_text'),
                    className: "btn btn-danger cancel_icon_text",
                    callback: async function () {
                        $("body").modalLoading('show');
                        await DAO.GetDataNow();
                        loadPreviwWebDeck();
                        $("body").modalLoading('hide');
                    }
                },
                changeIcon: {
                    label: getNameTd('.Change_icon_icon'),
                    className: "btn btn-primary Change_icon_icon",
                    callback: async function () {
                        ModalGetImagem(true, async (file, default_image) => {
                            $("body").modalLoading('show');
                            let NewIcon = file != null ? file : default_image;
                            await Promise.all(DAO.WEBDECKDATA.pages.map(async page => {
                                if (page.id == pageId) {
                                    if(!page.OldIcon || page.OldIcon == '') page.OldIcon = page.icon;
                                    page.icon = NewIcon;
                                }
                                return page;
                            }));
                            $("body").modalLoading('hide');
                            EditPageWebDeck(pageId);
                        }, page.icon);
                    }
                },
                changeName: {
                    label: getNameTd('.Change_name_icon'),
                    className: "btn btn-primary Change_name_icon",
                    callback: async function () {
                        getNewNamePage(async (NewName) => {
                            $("body").modalLoading('show');
                            await Promise.all(DAO.WEBDECKDATA.pages.map(async page => {
                                if (page.id == pageId) {
                                    page.name = NewName;
                                }
                                return page;
                            }));
                            $("body").modalLoading('hide');
                            EditPageWebDeck(pageId);
                        }, page.name, () => {
                            EditPageWebDeck(pageId);
                        });
                    }
                },
                save: {
                    label: getNameTd('.save_icon_text'),
                    className: "btn btn-success save_icon_text",
                    callback: async function () {
                        $("body").modalLoading('show');
                        if (page.OldIcon) {
                            if (page.OldIcon && page.OldIcon.includes(path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages'))) {
                                const pathDelete = page.OldIcon;
                                await fs.access(pathDelete, fs.constants.F_OK, (err) => {
                                    if (!err)
                                        fs.unlinkSync(pathDelete);
                                });
                                delete page.OldIcon;
                            }
                            if(typeof page.icon === 'object' && page.icon.size) {
                                save_icon_PageWebDeckBF(page, async (fileDirIcon) => {
                                    await Promise.all(DAO.WEBDECKDATA.pages.map(async page => {
                                        if (page.id == pageId) {
                                            page.icon = fileDirIcon ? fileDirIcon : '';
                                        }
                                        return page;
                                    }));
                                    await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                                    toaster.success(`${getNameTd('.Page_Successfully_edited')}`);
                                    clear_modal_pvw_wbdc();
                                    loadPreviwWebDeck();
                                    $("body").modalLoading('hide');
                                });
                            }
                            else{
                                await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                                toaster.success(`${getNameTd('.Page_Successfully_edited')}`);
                                clear_modal_pvw_wbdc();
                                loadPreviwWebDeck();
                                $("body").modalLoading('hide');
                            }
                        }
                        else {
                            await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
                            toaster.success(`${getNameTd('.Page_Successfully_edited')}`);
                            clear_modal_pvw_wbdc();
                            loadPreviwWebDeck();
                            $("body").modalLoading('hide');
                        }
                    }
                },
            }
        });
    }
}

function getNewNamePage(callback, name = '', callback_cancel = null) {
    bootbox.dialog({
        title: `${getNameTd('.requere_name_add_app')}`,
        message: `<form class="bootbox-form"><input id="requerename" value="${name}" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text"></form>`,
        buttons: {
            danger: {
                label: getNameTd('.cancel_icon_text'),
                className: "btn btn-danger",
                callback: function () {
                    if (callback_cancel) callback_cancel();
                }
            },
            success: {
                label: getNameTd('.submit_icon'),
                className: "btn btn-success",
                callback: function () {
                    var result = $("#requerename").val();
                    if (result && result.length > 1) {
                        callback(result);
                    }
                    else {
                        toaster.danger(`${getNameTd('.requere_name_add_app')}`);
                        getNewNamePage(callback, name);
                    }
                }
            }
        }
    });
}

function ModalSelectPageWebDeck(callback) {
    bootbox.dialog({
        title: `${getNameTd('.select_webdeck_page_text')}`,
        message: `<form class="bootbox-form">
            <select id="requerewebdeckpage" class="bootbox-input bootbox-input-text form-control">
                <option value="0">${getNameTd('.select_webdeck_page_text')}</option>
                ${DAO.WEBDECKDATA.pages.filter(f => f.id != DAO.WEBDECKDATA.pages[pageNow].id).map(x => `<option value="${x.id}">${x.name}</option>`).join('')}
            </select>
        </form>`,
        buttons: {
            danger: {
                label: getNameTd('.cancel_icon_text'),
                className: "btn btn-danger"
            },
            success: {
                label: getNameTd('.submit_icon'),
                className: "btn btn-success",
                callback: function () {
                    var result = $("#requerewebdeckpage").val();
                    if (result != '0') {
                        callback(DAO.WEBDECKDATA.pages.find(x => x.id === result));
                    }
                    else {
                        toaster.danger(`${getNameTd('.select_webdeck_page_text')}`);
                        ModalSelectPageWebDeck(callback);
                    }
                }
            }
        }
    });
}

const ChangeSelectWebdeckView = async (type = null) => {
    if (!type) type = DAO.WEBDECKDATA.formatView;

    $(".wendeckpreview").html(`<span class="m-auto"><i class="gg-spinner text-white float-inline-start"></i></span>`);
    $(".wendeckpreview")
        .removeClass(typeOld)
        .addClass(`m-${type}`);

    if (type == 'default') {
        $(".wendeckpreview").html(``);
        for (let index = 0; index < 3; index++) {
            $(".wendeckpreview").append(`
                <div class="card-oracle-card">
                   <div class="card-oracle-card-body card-oracle-back rounded"></div>
                </div>
            `);
        }
    }

    await DAO.WEBDECK.set('format_view', type);
    DAO.WEBDECKDATA.formatView = type;
    typeOld = `m-${type}`;

    if (type != 'default') {
        await setDefaultConfgi();
        loadPreviwWebDeck();
    }
}

const setDefaultConfgi = async () => {
    let split = DAO.WEBDECKDATA.formatView.split('x');
    let rows = parseInt(split[0]);
    let cols = parseInt(split[1]);
    let countPerPage = rows * cols;
    let pages = [];
    if (DAO.WEBDECKDATA.pages.length == 0) {
        let list = [];
        for (let index = 1; index < (countPerPage + 1); index++) {
            list.push({
                id: index,
                type: null,
                app: null,
            });
        }
        pages.push({
            id: uuidv4(),
            name: "Home",
            type: 'home',
            icon: path.join(APP_PATH, "/Domain", "src", "img", "underbot_logo.png"),
            items: list,
        });
        await DAO.WEBDECK.set('pages', pages);
        DAO.WEBDECKDATA.pages = pages
    }
    else {
        let isUpdate = false;
        DAO.WEBDECKDATA.pages.forEach(async page => {
            if (page.items.length > countPerPage) {
                isUpdate = true;
                page.items = page.items.splice(0, countPerPage);
                pages.push(page);
            }
            else if (page.items.length < countPerPage) {
                isUpdate = true;
                let list = [];
                for (let index = 1; index < (countPerPage + 1); index++) {
                    let item = page.items.find(f => f.id == index);
                    if (item != null) list.push(item);
                    else {
                        list.push({
                            id: index,
                            type: null,
                            app: null,
                        });
                    }
                }
                page.items = list;
                pages.push(page);
            }

            if (isUpdate == true && DAO.WEBDECKDATA.pages[DAO.WEBDECKDATA.pages.length - 1] == page) {
                await DAO.WEBDECK.set('pages', pages);
                DAO.WEBDECKDATA.pages = pages
            }
        });
    }
}

const loadPreviwWebDeck = async () => {
    $(".wendeckpreview").html(``);

    let type = DAO.WEBDECKDATA.formatView;
    let pages = DAO.WEBDECKDATA.pages;
    let page = pages[pageNow];
    $("#pvw-wbdc-page-name").html(page.name);
    page.items.forEach(item => {
        if (item.app == null) {
            $(".wendeckpreview").append(`
                <div class="card-oracle-card pvw-add-item" id="pvw-${item.id}">
                    <div class="card-oracle-card-body card-oracle-back rounded d-flex">
                        <i class="bi bi-plus-lg m-auto"></i>
                    </div>
                </div>
            `);
        }
        else if (item.type == 'page') {
            let subPage = DAO.WEBDECKDATA.pages.find(f => f.id == item.app._id);
            if (subPage != null) {
                $(".wendeckpreview").append(`
                    <div class="card-oracle-card pvw-edit-page-item" id="pvw-${item.id}">
                        <div class="card-oracle-card-body card-oracle-back rounded">
                            <img src="${subPage.icon}" class="card-oracle-card-img rounded" alt="...">
                        </div>
                        <div class="d-footer-exe card-body text-center">
                            <h5 class="card-title text-light tooltip-script u-format-max-text exeT m-0 cursor-pointer" title="${subPage.name}" data-toggle="tooltip">${subPage.name}</h5>
                        </div>
                    </div>
                `);
            }
            else {
                $(".wendeckpreview").append(`
                    <div class="card-oracle-card pvw-add-item" id="pvw-${item.id}">
                        <div class="card-oracle-card-body card-oracle-back rounded d-flex">
                            <i class="bi bi-plus-lg m-auto"></i>
                        </div>
                    </div>
                `);
                toaster.danger(`${getNameTd('.no_app_found_text')}`);
            }
        }
        else {
            let app = DAO.List_programs.find(f => f._id == item.app._id);
            if (app != null) {
                var name = app.name.replace('.exe', '');
                if (app.nameCustom.length > 0)
                    name = app.nameCustom;
                $(".wendeckpreview").append(`
                    <div class="card-oracle-card pvw-edit-item" id="pvw-${item.id}">
                       <div class="card-oracle-card-body card-oracle-back rounded">
                            <img src="${app.iconCustom}" class="card-oracle-card-img rounded" alt="...">
                       </div>
    
                       <div class="d-footer-exe card-body text-center">
                            <h5 class="card-title text-light tooltip-script u-format-max-text exeT m-0 cursor-pointer" title="${name}" data-toggle="tooltip">${name}</h5>
                        </div>
                    </div>
                `);
            }
            else {
                $(".wendeckpreview").append(`
                    <div class="card-oracle-card pvw-add-item" id="pvw-${item.id}">
                        <div class="card-oracle-card-body card-oracle-back rounded d-flex">
                            <i class="bi bi-plus-lg m-auto"></i>
                        </div>
                    </div>
                `);
                toaster.danger(`${getNameTd('.no_app_found_text')}`);
            }
        }
        if (item == page.items[page.items.length - 1]) {
            setTimeout(() => {
                $(".tooltip-script").tooltip();
            }, 500);
        }
    });
}

const select_program_pvw_wbdc = async (id) => {
    $('.CF-active').removeClass('CF-active');
    var list_programs = DAO.ProgramsExe.get('list_programs');
    var item = list_programs.filter(b => b._id == id)[0];
    program_key_macro_selected = id;
    var name = item.name.replace('.exe', '');
    if (item.nameCustom.length > 0)
        name = item.nameCustom;
    pvw_page_item_NOW.type = 'app';
    pvw_page_item_NOW.app = { _id: item._id };
    $(`.btn-dropdown-pvw-wbdc`).text(name);
    $("#li-pvw-wbdc-" + id).addClass('CF-active');
}

const clear_modal_pvw_wbdc = async () => {
    pvw_page_item_NOW = null;
    $('.btn-dropdown-pvw-wbdc').text(getNameTd(".apps_name")).attr("disabled", false);
    $('.CF-active').removeClass('CF-active');
    $(".btn-remove-pvw-wbdc").hide();
    $("#modal-select-app-pvw-wbdc").modal('hide');
}

const clear_modal_pvw_wbdc_and_remove = async () => {
    if (await B_are_you_sure() == true) {
        if (pvw_page_item_NOW != null) {
            var list = DAO.WEBDECKDATA.pages[pageNow].items.map(item => {
                if (item.id == pvw_page_item_NOW.id) {
                    item.app = null;
                    item.type = null;
                }

                return item;
            });

            DAO.WEBDECKDATA.pages[pageNow].items = list;
        }
        await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
        toaster.success(getNameTd('.Successfully_removed'));
    }
    clear_modal_pvw_wbdc();
    loadPreviwWebDeck();
}

const confirm_add_pvw_wbdc = async () => {
    var list = DAO.WEBDECKDATA.pages[pageNow].items.map(item => {
        if (pvw_page_item_NOW && item.id == pvw_page_item_NOW.id) item = pvw_page_item_NOW;

        return item;
    })
    DAO.WEBDECKDATA.pages[pageNow].items = list;
    await DAO.WEBDECK.set('pages', DAO.WEBDECKDATA.pages);
    toaster.success(getNameTd('.Added_successfully'));
    $(".btn-close-pvw-wbdc-modal").click();
    clear_modal_pvw_wbdc();
    loadPreviwWebDeck();
}