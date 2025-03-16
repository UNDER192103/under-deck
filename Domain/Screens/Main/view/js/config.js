

$(document).ready(async () => {
    changeInputColor();
    changeUrlRemoteUnderDeck();

    $(document).on('change', '#webdeck_background_color', async (e) => {
        await DAO.WEBDECK.set('exe-background', $("#webdeck_background_color").val());
    });

    $(document).on('change', '#webdeck_color_text', async (e) => {
        await DAO.WEBDECK.set('exe-color-text', $("#webdeck_color_text").val());
    });

    $(document).on('click', '#openUNDRemotVersion', async (e) => {
        if (DAO.USER) {
            exec(`start ${API.Conf.API.URL}/client/?ng=webdeck/app/`);
        }
        else {
            bootbox.alert(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '#openQRCODEUNDRemotVersion', async (e) => {
        if (DAO.USER) {
            let uri = `${API.Conf.API.URL}/client/?ng=webdeck/app/`;
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

    $(document).on('click', '#openInvitationUNDRemotVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
            exec(`start ${API.Conf.API.URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`);
        }
        else {
            bootbox.alert(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('click', '#openInvitationQRCODEUNDRemotVersion', async (e) => {
        if (DAO.USER && DAO.PC) {
            let uri = `${API.Conf.API.URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`;
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
});

async function changeInputColor() {
    let background = await DAO.WEBDECK.get('exe-background');
    let color_text = await DAO.WEBDECK.get('exe-color-text');

    $("#webdeck_background_color").val(background);
    $("#webdeck_color_text").val(color_text);
}

function changeUrlRemoteUnderDeck() {
    if (DAO.USER) {
        let url = `${API.Conf.API.URL}/client/?ng=webdeck/app/`;
        $(".underdeck_url_remote_version").html(url).val(url);
    }
    else
        $(".underdeck_url_remote_version").html('N/A').val('N/A');


    if (DAO.USER && DAO.PC) {
        let url = `${API.Conf.API.URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`;
        $(".underdeck_url_invite_remote_version").html(url).val(url);
    }
    else
        $(".underdeck_url_invite_remote_version").html('N/A').val('N/A');
}