let isCroppieStarted = false;
$(document).ready(async () => {
    loadUserData();
    loadUserThemesOptions();

    $(document).on('click', '.UND_SelectUStatus', async (e) => {
        e.preventDefault();
        let id = e.currentTarget.dataset.id;
        API.App.post('', {
            _lang: _lang,
            method: "update-user-status",
            client_id: DAO.USER.client_id,
            token: DAO.USER.token,
            status: id,
        }).then(async (res) => {
            DAO.USER.status = id;
            changeUserInfoData();
        });
    });

    $(document).on('click', '.UND_CopyUserId', async (e) => {
        e.preventDefault();
        copyText(DAO.USER.client_id);
    });

    $(document).on('click', '.UND_profileViewFriends', async (r) => {
        $(".ROWLUNDFRIENDSFF").show('slow');
        $(".ROWLUNDFRIENDSFP").hide();
        $(".ROWLUNDFRIENDSFRJ").hide();
        $(".ROWLUNDFRIENDSFBLOCK").hide();
        $(".IACCFRIEND").removeClass('btn-primary');
        $(".IREJFRIEND").removeClass('btn-primary');
        $(".IBLOCKEDRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").addClass('btn-primary');
        changeUserInfoData();
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IADDFRIEND', async (r) => {
        changeUserInfoData();
        $("#ROWLISTADDFRIEND").html('');
        $("#modal_UND_searchFriends").modal('show');
    });

    $(document).on('click', '.ILLFRIEND', async (r) => {
        changeUserInfoData();
        $(".IACCFRIEND").removeClass('btn-primary');
        $(".IREJFRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").addClass('btn-primary');
        $(".IBLOCKEDRIEND").removeClass('btn-primary');
        $(".ROWLUNDFRIENDSFF").show('slow');
        $(".ROWLUNDFRIENDSFRJ").hide();
        $(".ROWLUNDFRIENDSFP").hide();
        $(".ROWLUNDFRIENDSFBLOCK").hide();
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IACCFRIEND', async (r) => {
        changeUserInfoData();
        $(".IACCFRIEND").addClass('btn-primary');
        $(".IREJFRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").removeClass('btn-primary');
        $(".IBLOCKEDRIEND").removeClass('btn-primary');
        $(".ROWLUNDFRIENDSFF").hide();
        $(".ROWLUNDFRIENDSFBLOCK").hide();
        $(".ROWLUNDFRIENDSFP").show('slow');
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IREJFRIEND', async (r) => {
        changeUserInfoData();
        $(".IREJFRIEND").addClass('btn-primary');
        $(".IACCFRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").removeClass('btn-primary');
        $(".IBLOCKEDRIEND").removeClass('btn-primary');
        $(".ROWLUNDFRIENDSFF").hide();
        $(".ROWLUNDFRIENDSFP").hide();
        $(".ROWLUNDFRIENDSFBLOCK").hide();
        $(".ROWLUNDFRIENDSFRJ").show('slow');
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IBLOCKEDRIEND', async (r) => {
        changeUserInfoData();
        $(".IBLOCKEDRIEND").addClass('btn-primary');
        $(".IREJFRIEND").removeClass('btn-primary');
        $(".IACCFRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").removeClass('btn-primary');
        $(".ROWLUNDFRIENDSFF").hide();
        $(".ROWLUNDFRIENDSFP").hide();
        $(".ROWLUNDFRIENDSFRJ").hide();
        $(".ROWLUNDFRIENDSFBLOCK").show('slow');
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.UND_profileView', (r) => {
        changeUserInfoData();
        $("#modal_UND_profileView").modal('show');
    });

    $(document).on('click', '.UnfriendACCT', async (e) => {
        e.preventDefault();
        let idP = e.currentTarget.dataset.id;
        if (await B_are_you_sure()) {
            API.App.post('', {
                _lang: _lang,
                method: "user-unfriend",
                client_id: DAO.USER.client_id,
                token: DAO.USER.token,
                idP: idP,
            }).then(async (res) => {
                if (res.data.result == true) {
                    GetACC();
                    toaster.success(getNameTd('.You_have_successfully_unfriended_your_friend'));
                }
                else {
                    GetACC();
                }
            });
        }
        else {

        }
    });

    $(document).on('click', '.UNDREJCTPFF', async (e) => {
        e.preventDefault();
        let idP = e.currentTarget.dataset.id;
        if (await B_are_you_sure()) {
            API.App.post('', {
                _lang: _lang,
                method: "user-reject-friend-request",
                client_id: DAO.USER.client_id,
                token: DAO.USER.token,
                idP: idP,
            }).then(async (res) => {
                if (res.data.result == true) {
                    GetACC();
                    toaster.success(getNameTd('.friend_request_rejected'));
                }
                else {
                    GetACC();
                }
            });
        }
        else {

        }
    });

    $(document).on('click', '.UNDACCPFF', async (e) => {
        e.preventDefault();
        let idP = e.currentTarget.dataset.id;
        API.App.post('', {
            _lang: _lang,
            method: "user-acceppt-friend-request",
            client_id: DAO.USER.client_id,
            token: DAO.USER.token,
            idP: idP,
        }).then(async (res) => {
            if (res.data.result == true) {
                GetACC();
                toaster.success(getNameTd('.friend_request_accepted'));
            }
            else {
                GetACC();
            }
        });
    });

    $(document).on('click', '.UNDRNOFPFF', async (e) => {
        e.preventDefault();
        let idP = e.currentTarget.dataset.id;
        if (await B_are_you_sure()) {
            API.App.post('', {
                _lang: _lang,
                method: "user-request-new-friend-request-ipF",
                client_id: DAO.USER.client_id,
                token: DAO.USER.token,
                idP: idP,
            }).then(async (res) => {
                if (res.data.result == true) {
                    GetACC();
                    toaster.success(getNameTd('.Order_sent_successfully'));
                }
                else {
                    GetACC();
                }
            });
        }
        else {

        }
    });

    var OOONCl = null;
    $(document).on('click', '.ICCADDFRIEND', async (e) => {
        e.preventDefault();
        let Firend_Client_id = e.currentTarget.dataset.id;
        clearTimeout(OOONCl);
        OOONCl = setTimeout(() => {
            OOONCl = null;
            API.App.post('', {
                _lang: _lang,
                method: "request-friend-to-user",
                client_id: DAO.USER.client_id,
                token: DAO.USER.token,
                Firend_Client_id: Firend_Client_id,
            }).then(async (res) => {
                if (res.data.result == true) {
                    GetACC();
                    $(e.currentTarget).attr('disabled', true);
                    toaster.success(getNameTd('.Request_Sent_Successfully'));
                }
                else {
                    GetACC();
                }
            });
        }, 250);
    });

    $("#insertUND_DisplayUsername").on('keyup', async () => {
        if ($("#insertUND_DisplayUsername").val() != DAO.USER.account) {
            DAO.USERDATAUPDATE.name = $("#insertUND_DisplayUsername").val();
        }
        else {
            DAO.USERDATAUPDATE.name = null;
        }

        await checkUserProfileEnableEditButton();
    });

    $(".changeUserAvatar").click(() => {
        $("#uInput-changeUserAvatar").click();
    });

    $(document).on('click', '.btn_ConfirmEmail', (r) => {
        $("body").modalLoading('show', false);
        try {
            let formData = new FormData();

            formData.append('_lang', _lang);
            formData.append('method', "Confirm-Email-Address");
            formData.append('client_id', DAO.USER.client_id);
            formData.append('token', DAO.USER.token);

            API.App.post('', formData)
                .then(async (res) => {
                    let resData = res.data;
                    setTimeout(async () => {
                        if (res.data.success == true && resData.result == true && resData.account) {
                            await DAO.DBUSER.set('user', resData.account);
                            DAO.USER = resData.account;
                            changeUserInfoData();
                            bootbox.alert(resData.msg);
                        }
                        else {
                            toaster.danger(resData.msg);
                            bootbox.alert(resData.msg);
                        }
                        $("body").modalLoading('hide');
                    }, 250);
                })
                .catch(error => {
                    $("body").modalLoading('hide');
                    bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
                });
        } catch (error) {
            $("body").modalLoading('hide');
            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
        }
    });

    $(document).on('click', '.logout_account', (r) => {
        if (DAO.USER != null) {
            bootbox.confirm({
                message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> ' + getNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> ' + getNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: async (res) => {
                    if (res) {
                        DAO.USER = null;
                        await DAO.DBUSER.set('user', DAO.USER);
                        loadUserData();
                    }
                }
            });
        }
    });

    $(document).on('click', '.btn_remove_account_avatar', (r) => {
        if (DAO.USERDATAUPDATE.icon != null) {
            changeUserInfoData();
        }
        else if (DAO.USER != null) {
            bootbox.confirm({
                message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> ' + getNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> ' + getNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: async (res) => {
                    if (res) {
                        $("body").modalLoading('show', false);
                        try {
                            API.App.post('', {
                                _lang: _lang,
                                method: "remove-user-avatar",
                                client_id: DAO.USER.client_id,
                                token: DAO.USER.token
                            })
                                .then(async (res) => {
                                    let resData = res.data;
                                    $("body").modalLoading('hide');
                                    if (resData.result && resData.result.account) {
                                        await DAO.DBUSER.set('user', resData.result.account);
                                        DAO.USER = resData.result.account;
                                    }
                                    loadUserData();
                                    toaster.success(resData.msg);
                                    bootbox.alert(resData.msg);
                                })
                                .catch(error => {
                                    $("body").modalLoading('hide');
                                    $("#u-form-r-alert").show('slow').html(getNameTd('.msg_unable_to_perform_this_action'));
                                });
                        } catch (error) {
                            $("body").modalLoading('hide');
                            $("#u-form-r-alert").show('slow').html(getNameTd('.msg_unable_to_perform_this_action'));
                        }
                    }
                }
            });
        }
    });

    $("#uInput-changeUserAvatar").change(async () => {
        if ($("#uInput-changeUserAvatar")[0].files.length > 0) {
            DAO.USERDATAUPDATE.icon = $("#uInput-changeUserAvatar")[0].files[0];
            CroppicFile(DAO.USERDATAUPDATE.icon);
        }
        else {
            DAO.USERDATAUPDATE.icon = null;
        }

        //await checkUserProfileEnableEditButton();
    });

    $('#modal_UND_profileView').on('hidden.bs.modal', changeUserInfoData);

    $(document).on('click', '.btn_UpdateUserData', (r) => {
        $("body").modalLoading('show', false);
        try {
            let formData = new FormData();

            formData.append('_lang', _lang);
            formData.append('method', "Update-User-Data-crop");
            formData.append('client_id', DAO.USER.client_id);
            formData.append('token', DAO.USER.token);
            formData.append('name', DAO.USERDATAUPDATE.name);
            formData.append('username', DAO.USERDATAUPDATE.username);
            if (DAO.USERDATAUPDATE.namePlate != null)
                formData.append('namePlate', DAO.USERDATAUPDATE.namePlate);
            if (DAO.USERDATAUPDATE.themeProfile != null) {
                formData.append('profileTheme', DAO.USERDATAUPDATE.themeProfile.uri);
                formData.append('profileThemeColor', DAO.USERDATAUPDATE.themeProfile.color);
                formData.append('profileThemeBackground', DAO.USERDATAUPDATE.themeProfile.background);
            }

            API.App.post('', formData)
                .then(async (res) => {
                    let resData = res.data;
                    setTimeout(async () => {
                        $("body").modalLoading('hide');
                        $("#cancelExportAvatar").click();
                        if (res.data.success == true && resData.result && resData.result.account) {
                            await DAO.DBUSER.set('user', resData.result.account);
                            DAO.USER = resData.result.account;
                            changeUserInfoData();
                            loadUserData();
                            toaster.success(resData.msg);
                        }
                        else {
                            toaster.danger(resData.msg);
                            bootbox.alert(resData.msg);
                        }
                    }, 250);
                })
                .catch(error => {
                    $("body").modalLoading('hide');
                    bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
                });
        } catch (error) {
            $("body").modalLoading('hide');
            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
        }
    });

    $("#cancelExportAvatar").click(() => {
        $("#croppie-demo").hide('slow');
        $("#info-profile").show('slow');
        $('#croppie-avatar').croppie('destroy');
        DAO.USERDATAUPDATE.icon = null;
        $("#uInput-changeUserAvatar").val('');
        isCroppieStarted = false;
    });

    $("#croppieExportAvatar").click(() => {
        $('#croppie-avatar').croppie('result', {
            type: 'gif',
        }).then(async html => {
            $("body").modalLoading('show', false);

            try {
                await $("#croppie-avatar-export").html(html);

                $fileWidth = $("#croppie-avatar-export .croppie-result").css('width');
                $fileHeight = $("#croppie-avatar-export .croppie-result").css('height');
                $fileLeft = $("#croppie-avatar-export .croppie-result img").css('left');
                $fileTop = $("#croppie-avatar-export .croppie-result img").css('top');

                try {
                    let formData = new FormData();

                    formData.append('_lang', _lang);
                    formData.append('method', "Update-User-Data-crop");
                    formData.append('client_id', DAO.USER.client_id);
                    formData.append('token', DAO.USER.token);
                    formData.append('icon', DAO.USERDATAUPDATE.icon);
                    formData.append('icon_width', $fileWidth);
                    formData.append('icon_height', $fileHeight);
                    formData.append('icon_left', $fileLeft);
                    formData.append('icon_top', $fileTop);
                    formData.append('name', DAO.USERDATAUPDATE.name);
                    formData.append('username', DAO.USERDATAUPDATE.username);

                    API.App.post('', formData)
                        .then(async (res) => {
                            let resData = res.data;
                            $("#croppie-avatar-export").html('');
                            setTimeout(async () => {
                                $("body").modalLoading('hide');
                                $("#cancelExportAvatar").click();
                                if (res.data.success == true && resData.result && resData.result.account) {
                                    await DAO.DBUSER.set('user', resData.result.account);
                                    DAO.USER = resData.result.account;
                                    changeUserInfoData();
                                    loadUserData();
                                    toaster.success(resData.msg);
                                }
                                else {
                                    toaster.danger(resData.msg);
                                    bootbox.alert(resData.msg);
                                }
                            }, 250);
                        })
                        .catch(error => {
                            console.log(error);
                            $("body").modalLoading('hide');
                            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
                        });
                } catch (error) {
                    console.log(error);
                    $("body").modalLoading('hide');
                    bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
                }
            } catch (error) {
                $("body").modalLoading('hide');
                bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
            }
        });
    });

    var STMNSUAF = null;
    var oldVB = null;
    $("#NSUAF").on('keyup', async function (e) {
        if (oldVB != e.target.value) {
            oldVB = e.target.value;
            clearTimeout(STMNSUAF);
            $(".ROWLUNDFRIENDSFFLOADING").show();
            $(".ROWLISTADDFRIEND").html('');
            STMNSUAF = setTimeout(async () => {
                STMNSUAF = null;
                await webSocketClient.send(
                    await webSocketClient.ToJson(
                        {
                            lang: _lang,
                            method: 'search-for-Friends',
                            user: {
                                client_id: DAO.USER ? DAO.USER.client_id : 0
                            },
                            searchFriend: {
                                text: $("#NSUAF").val()
                            }
                        }
                    )
                );
            }, 1000);
        }

    });

    $("#select-user-nameplate").change(async () => {
        let namePlate = DAO.NAMESPLATES.find(f => f.id == $("#select-user-nameplate").val());
        if (namePlate) {
            getParent($(".PREVUNDNamePlateMY")).show();
            $(".PREVUNDNamePlateMY").attr('src', `${namePlate.uri}`).show();
            $(".PREVUNDNamePlateMY").show().get(0).load();
            DAO.USERDATAUPDATE.namePlate = namePlate.uri;
        }
        else {
            getParent($(".PREVUNDNamePlateMY")).hide();
            DAO.USERDATAUPDATE.namePlate = 'null';
        }
        await checkUserProfileEnableEditButton();
    });

    $("#select-user-profilebackground").change(async () => {
        let theme = DAO.PROFILETHEMESBCK.find(f => f.id == $("#select-user-profilebackground").val());
        if (theme) {
            getParent($(".UNDThemeProfileMY")).show();
            $(".UNDThemeProfileMY").attr('src', `${theme.uri}`).show();
            $(".UNDThemeProfileMY").show().get(0).load();
            DAO.USERDATAUPDATE.themeProfile = theme;
            $('.UNDTPMMSTYL').css({ color: theme.color, 'background-color': theme.background });
        }
        else {
            getParent($(".UNDThemeProfileMY")).hide();
            $('.UNDTPMMSTYL').css({ color: '', 'background-color': '' });
            DAO.USERDATAUPDATE.themeProfile = {
                uri: 'null',
                color: 'null',
                background: 'null',
            };
        }
        await checkUserProfileEnableEditButton();
    });

    setInterval(loadUserData, 1800000);
});

const loadUserThemesOptions = () => {
    API.App.post('', {
        _lang: _lang,
        method: "get-list-user-nameplates-themes",
    }).then(async (res) => {
        if (res && res.data && res.data.namesPlates) {
            DAO.NAMESPLATES = res.data.namesPlates;
        }
        else {
            DAO.NAMESPLATES = [];
        }
        $("#select-user-nameplate .RM").remove();
        DAO.NAMESPLATES.forEach(async (item) => {
            $("#select-user-nameplate").append(`<option ${item.uri == DAO.USER.profileStyle.namePlate ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
        });
    });

    API.App.post('', {
        _lang: _lang,
        method: "get-list-user-background-themes",
    }).then(async (res) => {
        if (res && res.data && res.data.themes) {
            DAO.PROFILETHEMESBCK = res.data.themes;
        }
        else {
            DAO.PROFILETHEMESBCK = [];
        }
        $("#select-user-profilebackground .RM").remove();
        DAO.PROFILETHEMESBCK.forEach(async (item) => {
            $("#select-user-profilebackground").append(`<option ${item.uri == DAO.USER.profileStyle.theme.uri ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
        });
    });
}

const FileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

const checkUserProfileEnableEditButton = async () => {
    if (DAO.USERDATAUPDATE && DAO.USERDATAUPDATE.icon != null || DAO.USERDATAUPDATE && DAO.USERDATAUPDATE.name != null || DAO.USERDATAUPDATE.namePlate != null || DAO.USERDATAUPDATE.themeProfile != null) {
        $(".btn_UpdateUserData").show('slow');
    }
    else {
        $(".btn_UpdateUserData").hide('slow');
    }
}

const checkUserNotifys = async () => {
    if (DAO.USER && DAO.USER.email_verified == false) {
        $(".UND_usericon.MM").addClass('pulse-orange');
        $(".ValUND_email").addClass('pulse-orange');
        $(".UND_profileView a").addClass('text-warning');
        $(".d-ConfirmEmailAddress").show();
    }
    else {
        $(".UND_usericon.MM").removeClass('pulse-orange');
        $(".ValUND_email").removeClass('pulse-orange');
        $(".UND_profileView a").removeClass('text-warning');
        $(".d-ConfirmEmailAddress").hide('slow');
    }

}

const changeUserInfoData = async (isUpdatePcACC = true) => {
    DAO.USERDATAUPDATE.icon = null;
    DAO.USERDATAUPDATE.name = null;
    DAO.USERDATAUPDATE.croppie.base64 = null;
    DAO.USERDATAUPDATE.croppie.file = null;
    DAO.USERDATAUPDATE.username = null;
    DAO.USERDATAUPDATE.namePlate = null;
    DAO.USERDATAUPDATE.themeProfile = null;
    $(".UND_userTags").html("");

    if (DAO.USER == null) {
        await DAO.DBUSER.set('user', DAO.USER);
        $(".UND_userClietn_id").html("N/A");
        $(".UND_username").html("");
        $(".UND_datecreated").html("");
        $(".ValUND_username").val("");
        $(".ValUND_email").val("");
        $(".ValUND_DisplayUsername").val("");
        $(".UND_usericon").attr('src', "");
        $(".UND_usernotloged").show();
        $(".UND_userloged").hide();
        $(".UND_usericon.p-1").removeClass('bg-secondary bg-danger bg-warning bg-success');
        $(".UND_StatusCC").removeClass('text-secondary text-danger text-warning text-success');
        $(".UND_Status").html('Status');
        $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${getNameTd('.no_premium_icon_text')}</button>`);
    }
    else {
        $(".UND_username").html(DAO.USER.username);
        $(".ValUND_username").val(DAO.USER.username);
        $(".UND_userClietn_id").html(DAO.USER.client_id);
        $(".ValUND_email").val(DAO.USER.email);
        $(".UND_DisplayUsername").html(`${DAO.USER.premium ? '<i class="bi bi-stars"></i>' : ''} ${DAO.USER.account}`);
        $(".UND_datecreated").html(new Date(DAO.USER.created_date).toLocaleString());
        $(".ValUND_DisplayUsername").val(DAO.USER.account);
        let dataStatus = GetStatusAccount(DAO.USER);
        $(".UND_usericon.p-1").removeClass('bg-secondary bg-danger bg-warning bg-success').addClass(dataStatus.classBg);
        $(".UND_StatusCC").removeClass('text-secondary text-danger text-warning text-success').addClass(dataStatus.classTxt);
        $(".UND_Status").html(dataStatus.text);
        if (DAO.USER.premium == true) {
            $("#select-user-nameplate").attr('disabled', false);
            $("#select-user-profilebackground").attr('disabled', false);
            $(".UND_premium_level").html(`<button title="${DAO.USER.premiumDateToFinish}" class="btn btn-warning btn-sm has_Premium_icon_text" type="button">${getNameTd('.has_Premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).addClass('text-warning');
        }
        else {
            $("#select-user-nameplate").attr('disabled', true);
            $("#select-user-profilebackground").attr('disabled', true);
            $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${getNameTd('.no_premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).removeClass('text-warning');
        }
    }

    if (DAO.USER && DAO.USER.icon != null && DAO.USER.icon.length > 6) {
        $(".UND_usericonPrevEdit").attr('src', DAO.USER.icon);
        $(".UND_usericon").attr('src', DAO.USER.icon);
    }
    else {
        $(".UND_usericonPrevEdit").attr('src', '../../src/img/profile-icon.png');
        $(".UND_usericon").attr('src', '../../src/img/profile-icon.png');
    }

    await checkUserProfileEnableEditButton();
    await checkUserNotifys();
    if (isUpdatePcACC)
        await UpdatePCACC();
    await changeUrlRemoteUnderDeck();
    await changeUserFriends();
    await changeUserProfileStyles();
    await changeUserTags();
    $(".tooltip-script").tooltip();
}

const loadUserData = async () => {
    if (DAO.USER != null && DAO.USER.client_id != null && DAO.USER.account != null) {
        $(".UND_usernotloged").hide();
        $(".UND_userloged").show();

        await changeUserInfoData();

        API.App.post('', {
            _lang: _lang,
            method: "check-user",
            client_id: DAO.USER.client_id,
            token: DAO.USER.token
        })
            .then(async (res) => {
                if (res.data.result != true) {
                    DAO.USER = null;
                    await changeUserInfoData();
                }
                else {

                    if (JSON.stringify(DAO.USER) != JSON.stringify(res.data.account)) {
                        await DAO.DBUSER.set('user', res.data.account);
                        DAO.USER = res.data.account;
                        await changeUserInfoData();
                    }

                    setTimeout(loadUserData, 1800000);
                }
            });
    }
    else {
        await changeUserInfoData();
    }
}

const tryLoginUser = () => {
    $("body").modalLoading('show', false);
    try {
        API.App.post('', {
            _lang: _lang,
            method: "login",
            username: $("#u-email").val(),
            password: $("#u-password").val()
        })
            .then(async (res) => {
                setTimeout(async () => {
                    $("body").modalLoading('hide');
                    if ((res.data != null && res.data.success != null) && res.data.success == true) {
                        $("#u-form-alert").hide('slow').html();
                        await DAO.DBUSER.set('user', res.data.result.account);
                        DAO.USER = res.data.result.account;
                        $("#modal_login").modal('hide');
                        toaster.success(getNameTd('.msg_successfully_logged_text'));
                        bootbox.alert(getNameTd('.msg_successfully_logged_text'));
                        $("#u-email").val("");
                        $("#u-password").val("");
                        loadUserData();
                    } else {
                        if (res.data.result == 0) {
                            $("#u-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                        }
                        else if (res.data.result == 1) {
                            $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_up_login_text'));
                        }
                        else {
                            $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
                        }
                    }
                }, 250);
            })
            .catch(error => {
                $("body").modalLoading('hide');
                $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
            });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
    }
}

const tryRegisterUser = () => {
    $("body").modalLoading('show', false);
    try {
        API.App.post('', {
            _lang: _lang,
            method: "register",
            name: $("#ur-name").val(),
            username: $("#ur-username").val(),
            email: $("#ur-email").val(),
            password: $("#ur-password").val(),
            cpassword: $("#ur-cpassword").val()
        })
            .then(async (res) => {
                let resData = res.data;
                setTimeout(async () => {
                    $("body").modalLoading('hide');
                    if ((res.data != null && res.data.success != null) && res.data.success == true) {
                        $("#ur-name").val('');
                        $("#ur-username").val('');
                        $("#ur-email").val('');
                        $("#ur-password").val('');
                        $("#ur-cpassword").val('');
                        $("#u-form-r-alert").hide('slow').html();
                        await DAO.DBUSER.set('user', resData.result.account);
                        DAO.USER = resData.result.account;
                        $("#modal_register").modal('hide');
                        toaster.success(resData.msg);
                        bootbox.alert(resData.msg);
                        loadUserData();
                    } else {
                        if (res.data.msg) {
                            $("#u-form-r-alert").show('slow').html(res.data.msg);
                        }
                        else {
                            $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
                        }
                    }
                }, 250);
            })
            .catch(error => {
                $("body").modalLoading('hide');
                $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
            });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
    }
}

const tryResetPassword = () => {
    $("body").modalLoading('show', false);
    $("#trpemail").val('');
    try {
        API.App.post('', {
            _lang: _lang,
            method: "reset-password",
            username: $("#rp-email").val(),
        })
            .then(async (res) => {
                setTimeout(async () => {
                    $("body").modalLoading('hide');
                    if ((res.data != null && res.data.success != null) && res.data.success == true) {
                        $("#rp-form-alert").show('hide').html('');
                        $("#trpemail").val($("#rp-email").val());
                        $("#modal_reset_password").modal('hide');
                        $("#rp-email").val('');
                        toaster.success(getNameTd('.We_have_sent_a_password_reset_code_to_your_email'));
                        $("#modal_set_reset_password").modal('show');
                    } else {
                        if (res.data.result == 0) {
                            $("#rp-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                        }
                        else {
                            $("#rp-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                        }
                    }
                }, 250);
            })
            .catch(error => {
                $("body").modalLoading('hide');
                $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
            });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
    }
}

const trySetResetPassword = () => {
    $("body").modalLoading('show', false);
    try {
        API.App.post('', {
            _lang: _lang,
            method: "user-set-password",
            token: $("#rp-token").val(),
            username: $("#trpemail").val(),
            password: $("#srp-password").val(),
            cpassword: $("#srp-cpassword").val(),
        })
            .then(async (res) => {
                setTimeout(async () => {
                    $("body").modalLoading('hide');
                    if ((res.data != null && res.data.success != null) && res.data.success == true) {
                        $("#trpemail").val('');
                        $("#modal_set_reset_password").modal('hide');
                        bootbox.alert(getNameTd('.Password_reset_successfully_text'), (r) => {
                            $("#modal_login").modal('show');
                        });
                    } else {
                        if (res.data.result == 0) {
                            $("#srp-form-alert").show('slow').html(getNameTd('.Please_provide_a_valid_password_reset_token_text'));
                        }
                        else if (res.data.result == 1) {
                            $("#srp-form-alert").show('slow').html(res.data.msg);
                        }
                        else {
                            $("#srp-form-alert").show('slow').html(getNameTd('.chek_meets_set_password_text'));
                        }
                    }
                }, 250);
            })
            .catch(error => {
                $("body").modalLoading('hide');
                $("#u-form-alert").show('slow').html(getNameTd('.An_error_occurred_when_trying_to_reset_the_password_text'));
            });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-alert").show('slow').html(getNameTd('.An_error_occurred_when_trying_to_reset_the_password_text'));
    }
}

function CroppicFile(file) {
    FileToBase64(file).then(function (base64) {
        $("#croppie-demo").show();
        $("#info-profile").hide('slow');
        try {
            if (!isCroppieStarted) {
                $('#croppie-avatar').croppie({
                    viewport: {
                        width: 200,
                        height: 200,
                        type: 'circle'
                    },
                    boundary: {
                        width: '100%',
                        height: 400
                    },
                    enableExif: true
                });
                isCroppieStarted = true;
            }
        } catch (error) { }

        $('#croppie-avatar').croppie('bind', {
            url: base64
        }).then(function () {

        });
    }).catch(function (err) {
        console.log(err);
    });
}

function GetStatusAccount(account) {
    switch (account.status) {
        case '1':
            return { text: getNameTd('.online_text'), classBg: 'bg-success', classTxt: 'text-success', class: 'online_text' };

        case '2':
            return { text: getNameTd('.Absent_text'), classBg: 'bg-warning', classTxt: 'text-warning', class: 'Absent_text' };

        case '3':
            return { text: getNameTd('.Invisible_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'Invisible_text' };

        case '4':
            return { text: getNameTd('.Do_not_disturb_text'), classBg: 'bg-danger', classTxt: 'text-danger', class: 'Do_not_disturb_text' };

        case '5':
        default:
            return { text: getNameTd('.offline_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'offline_text' };
    }

}

const changeUserFriends = async () => {
    $(".ROWLUNDFRIENDSFF").html('');
    $(".ROWLUNDFRIENDSFP").html('');
    $(".ROWLUNDFRIENDSFRJ").html('');
    $(".ROWLUNDFRIENDSFBLOCK").html('');

    if (DAO.USER && DAO.USER.friends) {
        $(".IACCFRIEND").removeClass('pulse-orange');
        $(".UND_profileViewFriends").removeClass('pulse-orange');
        if (DAO.USER.email_verified)
            $(".UND_usericon.MM").removeClass('pulse-orange');
        DAO.USER.friends.forEach(friend => {
            let friendData = friend.user;
            $(`.ICCADDFRIEND[data-id="${friend.client_id}"]`).attr('disabled', true);
            $(`.ICCADDFRIEND[data-id="${friend.friend_id}"]`).attr('disabled', true);

            let dataStatus = GetStatusAccount(friendData);
            let dataTagsUser = GetUserTags(friendData);
            let profileStyle = friendData.profileStyle;
            if (friend.friends == true && friend.refused == false && friend.blocked == false) {
                $(".ROWLUNDFRIENDSFF").append(`
                <div class="col-md-12">
                    <div class="card theme-card me-1">
                        ${GetNamePlateForUser(friendData)}
                        <div class="card-body z-1">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex align-items-center">
                                            <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                            <div>
                                                <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                <div class="m-2 d-flex">${dataTagsUser}</div>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <a href="#" class="btn btn-sm btn-danger UnfriendACCT Unfriend_icon_text" data-id="${friend.idP}">
                                                ${getNameTd('.Unfriend_icon_text')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);
            }
            else if (friend.friends == false && friend.refused == false && friend.blocked == false) {
                if (friend.hidedBy == parseFloat(DAO.USER.client_id)) {
                    return;
                }
                if (friend.requestBy != null) {
                    $(".IACCFRIEND").addClass('pulse-orange');
                    $(".UND_profileViewFriends").addClass('pulse-orange');
                    $(".UND_usericon.MM").addClass('pulse-orange');
                    $(".ROWLUNDFRIENDSFP").append(`
                    <div class="col-md-12">
                        <div class="card theme-card me-1">
                            ${GetNamePlateForUser(friendData)}
                            <div class="card-body z-1">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                                <div>
                                                    <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                    <div class="m-2 d-flex">${dataTagsUser}</div>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <a href="#" class="btn btn-sm btn-danger UNDREJCTPFF Refusedtfriend_icon_text me-1" data-id="${friend.idP}">
                                                    ${getNameTd('.Refusedtfriend_icon_text')}
                                                </a>
                                                <a href="#" class="btn btn-sm btn-success UNDACCPFF Acceptfriend_icon_text" data-id="${friend.idP}">
                                                    ${getNameTd('.Acceptfriend_icon_text')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                }
                else {
                    $(".ROWLUNDFRIENDSFP").append(`
                    <div class="col-md-12">
                        <div class="card theme-card me-1">
                            ${GetNamePlateForUser(friendData)}
                            <div class="card-body z-1">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                                <div>
                                                    <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                    <div class="m-2 d-flex">${dataTagsUser}</div>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <a href="#" class="btn btn-sm btn-danger order_pending_text">
                                                    ${getNameTd('.order_pending_text')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                }

            }
            else if (friend.friends == false && friend.refused == true && friend.blocked == false) {
                if (friend.requestBy != null) {
                    $(".ROWLUNDFRIENDSFRJ").append(`
                    <div class="col-md-12">
                        <div class="card theme-card me-1">
                            ${GetNamePlateForUser(friendData)}
                            <div class="card-body z-1">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                                <div>
                                                    <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                    <div class="m-2 d-flex">${dataTagsUser}</div>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <a href="#" class="btn btn-sm btn-danger order_refused_text">
                                                    ${getNameTd('.order_refused_text')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                } else {
                    $(".ROWLUNDFRIENDSFRJ").append(`
                        <div class="col-md-12">
                            <div class="card theme-card me-1">
                                ${GetNamePlateForUser(friendData)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                        <div class="m-2 d-flex">${dataTagsUser}</div>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <a href="#" class="btn btn-sm btn-danger order_refused_text me-1">
                                                        ${getNameTd('.order_refused_text')}
                                                    </a>
                                                    <a href="#" class="btn btn-sm btn-success UNDRNOFPFF RequestNewOrderfriend_icon_text" data-id="${friend.idP}">
                                                        ${getNameTd('.RequestNewOrderfriend_icon_text')}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `);

                }
            }
            else if (friend.friends == false && friend.refused == false && friend.blocked == true) {
                $(".ROWLUNDFRIENDSFBLOCK").append(`
                <div class="col-md-12">
                    <div class="card theme-card me-1">
                        ${GetNamePlateForUser(friendData)}
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex align-items-center">
                                            <img src="${friendData.avatar}" class="img-thumbnail rounded-circle ${dataStatus.classBg}" style="width: 100px; height: 100px;">
                                            <div>
                                                <h5 class="m-2 ${friendData.premium == true ? 'text-warning' : ''}">${friendData.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${friendData.name}</h5>
                                                <div class="m-2 d-flex">${dataTagsUser}</div>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <a href="#" class="btn btn-sm btn-danger blocked_text">
                                                ${getNameTd('.blocked_text')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);
            }
        });
    }

    $(".tooltip-script").tooltip();
}

const changeUserProfileStyles = async () => {
    let profileStyle = DAO.USER.profileStyle;
    if (profileStyle) {
        if (profileStyle.namePlate) {
            if (DAO.NAMESPLATES.length > 0) {
                $("#select-user-nameplate .RM").remove();
                DAO.NAMESPLATES.forEach(async (item) => {
                    $("#select-user-nameplate").append(`<option ${item.uri == DAO.USER.profileStyle.namePlate ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
                });
            }

            getParent($(".UNDNamePlateMY")).show();
            getParent($(".PREVUNDNamePlateMY")).show();
            if ($(".UNDNamePlateMY").attr('src') != profileStyle.namePlate) {
                $(".UNDNamePlateMY").attr('src', `${profileStyle.namePlate}`).show();
                $(".UNDNamePlateMY").show().get(0).load();
            }
            if ($(".PREVUNDNamePlateMY").attr('src') != profileStyle.namePlate) {
                $(".PREVUNDNamePlateMY").attr('src', `${profileStyle.namePlate}`).show();
                $(".PREVUNDNamePlateMY").show().get(0).load();
            }
        }
        else {
            getParent($(".UNDNamePlateMY")).hide();
            getParent($(".PREVUNDNamePlateMY")).hide();
        }

        if (profileStyle.theme && profileStyle.theme.uri) {
            if (DAO.PROFILETHEMESBCK.length > 0) {
                $("#select-user-profilebackground .RM").remove();
                DAO.PROFILETHEMESBCK.forEach(async (item) => {
                    $("#select-user-profilebackground").append(`<option ${item.uri == DAO.USER.profileStyle.theme.uri ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
                });
            }
            $("#select-user-profilebackground");
            $(".UNDThemeProfileMY").attr('src', `${profileStyle.theme.uri}`).show();
            $(".UNDThemeProfileMY").show().get(0).load();
            $('.UNDTPMMSTYL').css({ color: profileStyle.theme.color, 'background-color': profileStyle.theme.background });
        }
        else {
            $('.UNDTPMMSTYL').css({ color: '', 'background-color': '' });
            $(".UNDThemeProfileMY").hide();
        }
    }
    else {
        $('.UNDTPMMSTYL').css({ color: '', 'background-color': '' });
        $(".UNDThemeProfileMY").hide();
        getParent($(".UNDNamePlateMY")).hide();
        getParent($(".PREVUNDNamePlateMY")).hide();
    }
}

function GetNamePlateForUser(user) {
    if (user.premium) {
        let profileStyle = user.profileStyle;
        if (profileStyle && profileStyle.namePlate && profileStyle.namePlate != "") {
            return `
            <div class="UND_contentNamePlate rounded z-0">
                <video class="UNDNamePlate rounded rotate-180" style="" autoplay="" loop="" muted="" plays-inline="" src="${profileStyle.namePlate}">
                  <source src="" type="video/mp4">
               </video>
               <video class="UNDNamePlate rounded" style="" autoplay="" loop="" muted="" plays-inline="" src="${profileStyle.namePlate}">
                  <source src="" type="video/mp4">
               </video>
            </div>
            `;
        }
    }
    return '';
}

const changeUserTags = () => {
    $("#uInput-changeUserAvatar").val('');
    if (DAO.USER && DAO.USER.tags) {
        DAO.USER.tags.forEach(tag => {
            $(".UND_userTags").append(`<span class="badge p-1 tooltip-script cursor-pointer" title="${tag.name}">${tag.icon}</span>`);
        });
    }

    if (DAO.USER.premium == true) {
        $(".UND_userTags").append(`<span class="badge p-1 tooltip-script cursor-pointer Premium_text" title="${getNameTd('.Premium_text')}"><i class="bi bi-stars text-warning"></i></span>`);
    }
}

function GetUserTags(account) {
    let html = '';
    account.tags.forEach(tag => {
        html += `<span class="badge p-1 tooltip-script cursor-pointer" title="${tag.name}">${tag.icon}</span>`;
    });
    if (account.premium == true) {
        html += `<span class="badge p-1 tooltip-script cursor-pointer Premium_text" title="${getNameTd('.Premium_text')}"><i class="bi bi-stars text-warning"></i></span>`;
    }
    return html;
}