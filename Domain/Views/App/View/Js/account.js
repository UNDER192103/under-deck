let isCroppieStarted = false, UserDataToUpdate = {
    croppie: {
        file: null,
        base64: null,
    },
    icon: null,
    name: null,
    username: null,
    namePlate: null,
    themeProfile: null,
};

$(document).ready(async () => {
    loadUserData();
    loadUserThemesOptions();

    $('#FormUserLogin').submit(async (e) => {
        e.preventDefault();
        $("body").modalLoading('show', false);
        BACKEND.Send('UserLogin', {username: $("#u-email").val(), password: $("#u-password").val() }).then(User => {
            $("body").modalLoading('hide');
            if ( User && User.id) {
                $("#u-form-alert").hide('slow').html();
                $("#modal_login").modal('hide');
                toaster.success(getNameTd('.msg_successfully_logged_text'));
                bootbox.alert(getNameTd('.msg_successfully_logged_text'));
                $("#u-email").val("");
                $("#u-password").val("");
                loadUserData();
            } else {
                $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
            }
        });
    });

    $(document).on('click', '.UND_SelectUStatus', async (e) => {
        e.preventDefault();
        BACKEND.Send('UpdateUserStatus', { id: e.currentTarget.dataset.id }).then(Res => {
            loadUserData();
        });
    });

    $(document).on('click', '.UND_CopyUserId', async (e) => {
        e.preventDefault();
        var User = await BACKEND.Send('GetAccount');
        if(User && User.id) copyText(User.id);
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
        loadUserData();
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IADDFRIEND', async (r) => {
        loadUserData();
        $("#ROWLISTADDFRIEND").html('');
        $("#modal_UND_searchFriends").modal('show');
    });

    $(document).on('click', '.ILLFRIEND', async (r) => {
        loadUserData();
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
        loadUserData();
        $(".IACCFRIEND").addClass('btn-primary');
        $(".IREJFRIEND").removeClass('btn-primary');
        $(".ILLFRIEND").removeClass('btn-primary');
        $(".IBLOCKEDRIEND").removeClass('btn-primary');
        $(".ROWLUNDFRIENDSFF").hide();
        $(".ROWLUNDFRIENDSFRJ").hide();
        $(".ROWLUNDFRIENDSFBLOCK").hide();
        $(".ROWLUNDFRIENDSFP").show('slow');
        $("#modal_UND_profileViewFriends").modal('show');
    });

    $(document).on('click', '.IREJFRIEND', async (r) => {
        loadUserData();
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
        loadUserData();
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
        loadUserData();
        $("#modal_UND_profileView").modal('show');
    });

    $(document).on('click', '.UnfriendACCT', async (e) => {
        e.preventDefault();
        if (await B_are_you_sure()) {
            $("body").modalLoading('show', false);
            BACKEND.Send('UnFriend', {requestId: e.currentTarget.dataset.id}).then(IsRemoved => {
                $("body").modalLoading('hide');
                changeUserFriends();
                if(IsRemoved){
                    toaster.success(getNameTd('.You_have_successfully_unfriended_your_friend'));
                }
            });
        }
        else {

        }
    });

    $(document).on('click', '.UNDREJCTPFF', async (e) => {
        e.preventDefault();
        $("body").modalLoading('show', false);
        BACKEND.Send('RejectFriendRequest', { requestId: e.currentTarget.dataset.id }).then(IsReject => {
            $("body").modalLoading('hide');
            toaster.success(getNameTd('.friend_request_rejected'));
            loadUserData();
        });
    });

    $(document).on('click', '.UNDACCPFF', async (e) => {
        e.preventDefault();
        $("body").modalLoading('show', false);
        BACKEND.Send('AcceptFriendRequest', { requestId: e.currentTarget.dataset.id }).then(IsAccept => {
            $("body").modalLoading('hide');
            toaster.success(getNameTd('.friend_request_accepted'));
            loadUserData();
        });
    });

    $(document).on('click', '.UNDRNOFPFF', async (e) => {
        e.preventDefault();
        let requestId = e.currentTarget.dataset.id;
        if (await B_are_you_sure()) {
            $(e.currentTarget).attr('disabled', true);
            $("body").modalLoading('show', false);
            BACKEND.Send('ResendFriendRequest', { requestId: requestId }).then(Result => {
                $("body").modalLoading('hide');
                changeUserFriends();
                if (Result == true) {
                    toaster.success(getNameTd('.Order_sent_successfully'));
                }
            });
        }
        else {

        }
    });

    $(document).on('click', '.ICCADDFRIEND', async (e) => {
        e.preventDefault();
        let UserId = e.currentTarget.dataset.id;
        $(e.currentTarget).attr('disabled', true);
        $("body").modalLoading('show', false);
        BACKEND.Send('RequestFriend', { userId: UserId }).then(Result => {
            $("body").modalLoading('hide');
            changeUserFriends();
            if (Result == true) {
                toaster.success(getNameTd('.Request_Sent_Successfully'));
            }
        });
    });

    $("#insertUND_DisplayUsername").on('keyup', async () => {
        var User = await BACKEND.Send('GetAccount');
        if ($("#insertUND_DisplayUsername").val() != User.name) {
            UserDataToUpdate.name = $("#insertUND_DisplayUsername").val();
        }
        else {
            UserDataToUpdate.name = null;
        }

        await checkUserProfileEnableEditButton();
    });

    $(".changeUserAvatar").click(() => {
        $("#uInput-changeUserAvatar").click();
    });

    $(document).on('click', '.btn_ConfirmEmail', (r) => {
        $("body").modalLoading('show', false);
        try {
            BACKEND.Send('SendMsgConfirmEmail').then(async (res)=>{
                $("body").modalLoading('hide');
                loadUserData();
                if(res.msg){
                    bootbox.alert(res.msg);
                }
                else{
                    toaster.success(getNameTd('.msg_unable_to_perform_this_action'));
                }
            });
        } catch (error) {
            $("body").modalLoading('hide');
            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
        }
    });

    $(document).on('click', '.logout_account', async (r) => {
        var User = await BACKEND.Send('GetAccount');
        if (User && User.id) {
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
                        await BACKEND.Send('LogoutAccount');
                        loadUserData();
                    }
                }
            });
        }
    });

    $(document).on('click', '.btn_remove_account_avatar', async (r) => {
        var User = await BACKEND.Send('GetAccount');
        if (UserDataToUpdate.icon != null) {
            loadUserData();
        }
        else if (User && User.id) {
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
                            await BACKEND.Send('RemoveUserVatar');
                            loadUserData();
                            $("body").modalLoading('hide');
                            toaster.success(getNameTd('.s_s_text'));
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
            UserDataToUpdate.icon = $("#uInput-changeUserAvatar")[0].files[0];
            UserDataToUpdate.icon.base64 = await FileToBase64(UserDataToUpdate.icon);
            CroppicFile(UserDataToUpdate.icon);
        }
        else {
            UserDataToUpdate.icon = null;
        }

        //await checkUserProfileEnableEditButton();
    });

    $('#modal_UND_profileView').on('hidden.bs.modal', loadUserData);

    $(document).on('click', '.btn_UpdateUserData', async (r) => {
        $("body").modalLoading('show', false);
        try {
            let objectToUpdate = {};
            await BACKEND.Send('DefineMyTheme', {
                namePlateId: UserDataToUpdate.namePlate ? UserDataToUpdate.namePlate.id : null,
                backgroundId: UserDataToUpdate.themeProfile ? UserDataToUpdate.themeProfile.id : null
            });
            if(UserDataToUpdate.name) objectToUpdate.name = UserDataToUpdate.name;
            if(UserDataToUpdate.username) objectToUpdate.username = UserDataToUpdate.username;
            if(UserDataToUpdate.username || UserDataToUpdate.name) await BACKEND.Send('UpdateUser', objectToUpdate);
            $("body").modalLoading('hide');
            $("#cancelExportAvatar").click();
            loadUserData();
            toaster.success(getNameTd('.s_s_text'));
        } catch (error) {
            console.log(error);
            $("body").modalLoading('hide');
            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
        }
    });

    $("#cancelExportAvatar").click(() => {
        $("#croppie-demo").hide('slow');
        $("#info-profile").show('slow');
        $('#croppie-avatar').croppie('destroy');
        UserDataToUpdate.icon = null;
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
                    BACKEND.Send('UpdateUserAvatar', {base64: UserDataToUpdate.icon.base64, name: UserDataToUpdate.icon.name, width: $fileWidth, height: $fileHeight, left: $fileLeft, top: $fileTop}).then(Result => {
                        console.log(Result);
                        $("body").modalLoading('hide');
                        $("#cancelExportAvatar").click();
                        toaster.success(getNameTd('.s_s_text'));
                        loadUserData();
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
                if($("#NSUAF").val() == ""){
                    $(".ROWLISTADDFRIEND").html('');
                    $(".ROWLUNDFRIENDSFFLOADING").hide();
                    return;
                }
                var User = await BACKEND.Send('GetAccount');
                BACKEND.Send('FindUserByName', { name: $("#NSUAF").val() }).then(Users => {
                    if(Users){
                        $(".ROWLISTADDFRIEND").html('');
                        $(".ROWLUNDFRIENDSFFLOADING").hide();
                        Users.forEach(UserSearch => {
                            let isMyFriend = false;
                            if (User.friends.get(UserSearch.id)) isMyFriend = true;
                            $(".ROWLISTADDFRIEND").append(`
                            <div class="col-md-12">
                                <div class="card theme-card me-1">
                                    ${GetNamePlateForUser(UserSearch)}
                                    <div class="card-body z-1">
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="d-flex justify-content-between">
                                                    <div class="d-flex align-items-center">
                                                        <img src="${UserSearch.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(UserSearch).classBg}" style="width: 100px; height: 100px;">
                                                        <div>
                                                            <h5 class="m-2 ${UserSearch.premium == true ? 'text-warning' : ''}">${UserSearch.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${UserSearch.name}</h5>
                                                            <div class="m-2 d-flex">${GetUserTags(UserSearch)}</div>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <button href="#" ${isMyFriend == true ? 'disabled' : ''} class="btn btn-sm btn-success ${isMyFriend == true ? '' : 'ICCADDFRIEND'} Send_Order" data-id="${UserSearch.id}">
                                                            ${getNameTd('.Send_Order')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `);
                        });
                        $(".tooltip-script").tooltip();
                    }
                    else{
                        $(".ROWLISTADDFRIEND").html('');
                        $(".ROWLUNDFRIENDSFFLOADING").hide();
                    }
                });
            }, 1000);
        }

    });

    $("#select-user-nameplate").change(async () => {
        let namePlate = DAO.NAMESPLATES.find(f => f.id == $("#select-user-nameplate").val());
        if (namePlate) {
            getParent($(".PREVUNDNamePlateMY")).show();
            $(".PREVUNDNamePlateMY").attr('src', `${namePlate.uri}`).show();
            $(".PREVUNDNamePlateMY").show().get(0).load();
            if (namePlate.isDuplicate == '1') {
                $(".PREVUNDNamePlateMY.HINRP").show();
            }
            else {
                $(".PREVUNDNamePlateMY.HINRP").hide();
            }
            UserDataToUpdate.namePlate = namePlate;
            getParent($(".PREVUNDNamePlateMY")).css({ color: namePlate.color, 'background-color': namePlate.background });
        }
        else {
            $(".PREVUNDNamePlateMY.HINRP").show();
            getParent($(".PREVUNDNamePlateMY")).hide();
            getParent($(".PREVUNDNamePlateMY")).css({ color: '', 'background-color': '' });
            UserDataToUpdate.namePlate = 'null';
        }
        await checkUserProfileEnableEditButton();
    });

    $("#select-user-profilebackground").change(async () => {
        let theme = DAO.PROFILETHEMESBCK.find(f => f.id == $("#select-user-profilebackground").val());
        if (theme) {
            getParent($(".UNDThemeProfileMY")).show();
            $(".UNDThemeProfileMY").attr('src', `${theme.uri}`).show();
            $(".UNDThemeProfileMY").show().get(0).load();
            UserDataToUpdate.themeProfile = theme;
            $('.UNDTPMMSTYL').css({ color: theme.color, 'background-color': theme.background });
        }
        else {
            getParent($(".UNDThemeProfileMY")).hide();
            $('.UNDTPMMSTYL').css({ color: '', 'background-color': '' });
            UserDataToUpdate.themeProfile = {
                uri: 'null',
                color: 'null',
                background: 'null',
            };
        }
        await checkUserProfileEnableEditButton();
    });
});

const loadUserThemesOptions = () => {
    BACKEND.Send('GetThemes').then(async Result => {
        if(Result){
            var User = await BACKEND.Send('GetAccount');
            if(Result.userNamePlates){
                DAO.NAMESPLATES = Result.userNamePlates;
                $("#select-user-nameplate .RM").remove();
                DAO.NAMESPLATES.forEach(async (item) => {
                    $("#select-user-nameplate").append(`<option ${item.uri == (User ? User.profileStyle.namePlate : null) ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
                });
            }
            DAO.PROFILETHEMESBCK = Result.userBackgrounds;
            $("#select-user-profilebackground .RM").remove();
            DAO.PROFILETHEMESBCK.forEach(async (item) => {
                $("#select-user-profilebackground").append(`<option ${item.uri == (User ? User.profileStyle.theme.uri : null) ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
            });
        }
    });
}

const FileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

const checkUserProfileEnableEditButton = async () => {
    if (UserDataToUpdate && UserDataToUpdate.icon != null || UserDataToUpdate && UserDataToUpdate.name != null || UserDataToUpdate.namePlate != null || UserDataToUpdate.themeProfile != null) {
        $(".btn_UpdateUserData").show('slow');
    }
    else {
        $(".btn_UpdateUserData").hide('slow');
    }
}

const checkUserNotifys = async () => {
    var User = await BACKEND.Send('GetAccount');
    if (User && User.emailVerified == false) {
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

const loadUserData = async () => {
    var User = await BACKEND.Send('GetAccount');
    UserDataToUpdate.icon = null;
    UserDataToUpdate.name = null;
    UserDataToUpdate.croppie.base64 = null;
    UserDataToUpdate.croppie.file = null;
    UserDataToUpdate.username = null;
    UserDataToUpdate.namePlate = null;
    UserDataToUpdate.themeProfile = null;

    if(User && User.id){
        $(".UND_username").html(User.username);
        $(".ValUND_username").val(User.username);
        $(".UND_userClietn_id").html(User.id);
        $(".ValUND_email").val(User.email);
        $(".UND_DisplayUsername").html(`${User.premium ? '<i class="bi bi-stars"></i>' : ''} ${User.name}`);
        $(".UND_datecreated").html(new Date(User.created_date).toLocaleString());
        $(".ValUND_DisplayUsername").val(User.name);
        $(".UND_usericon.p-1").removeClass('bg-secondary bg-danger bg-warning bg-success').addClass(GetStatusAccount(User).classBg);
        $(".UND_usericon.p-01").removeClass('bg-secondary bg-danger bg-warning bg-success').addClass(GetStatusAccount(User).classBg);
        $(".UND_StatusCC").removeClass('text-secondary text-danger text-warning text-success').addClass(GetStatusAccount(User).classTxt);
        $(".UND_Status").html(GetStatusAccount(User).text);
        if (User.premium == true) {
            $("#select-user-nameplate").attr('disabled', false);
            $("#select-user-profilebackground").attr('disabled', false);
            $(".UND_premium_level").html(`<button title="${User.premiumFinishDate}" class="btn btn-warning btn-sm has_Premium_icon_text" type="button">${getNameTd('.has_Premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).addClass('text-warning');
        }
        else {
            $("#select-user-nameplate").attr('disabled', true);
            $("#select-user-profilebackground").attr('disabled', true);
            $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${getNameTd('.no_premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).removeClass('text-warning');
        }
        if(User.avatar && User.avatar.length > 0){
            $(".UND_usericonPrevEdit").attr('src', User.avatar);
            $(".UND_usericon").attr('src', User.avatar);
        } else {
            $(".UND_usericonPrevEdit").attr('src', '../../src/img/profile-icon.png');
            $(".UND_usericon").attr('src', '../../src/img/profile-icon.png');
        }
        $(".UND_usernotloged").hide();
        $(".UND_userloged").show();
    }
    else{
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
        $(".UND_usericon.p-01").removeClass('bg-secondary bg-danger bg-warning bg-success');
        $(".UND_StatusCC").removeClass('text-secondary text-danger text-warning text-success');
        $(".UND_Status").html('Status');
        $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${getNameTd('.no_premium_icon_text')}</button>`);
        $(".UND_usericonPrevEdit").attr('src', '../../src/img/profile-icon.png');
        $(".UND_usericon").attr('src', '../../src/img/profile-icon.png');
    }

    await checkUserProfileEnableEditButton();
    await checkUserNotifys();
    await changeUserFriends();
    await changeUserProfileStyles();
    await changeUserTags();
    await changeUrlRemoteUnderDeck();
    $(".tooltip-script").tooltip();
}

const tryRegisterUser = () => {
    $("body").modalLoading('show', false);
    try {
        BACKEND.Send("UserRegister", {
            _lang: _lang,
            method: "register",
            name: $("#ur-name").val(),
            username: $("#ur-username").val(),
            email: $("#ur-email").val(),
            password: $("#ur-password").val(),
            cpassword: $("#ur-cpassword").val()
        }).then(async (res) => {
            $("body").modalLoading('hide');
            if ((res != null && res.success != null) && res.success == true) {
                $("#ur-name").val('');
                $("#ur-username").val('');
                $("#ur-email").val('');
                $("#ur-password").val('');
                $("#ur-cpassword").val('');
                $("#u-form-r-alert").hide('slow').html();
                $("#modal_register").modal('hide');
                toaster.success(res.msg);
                bootbox.alert(res.msg);
                loadUserData();
            } else {
                if (res.msg) {
                    $("#u-form-r-alert").show('slow').html(res.msg);
                }
                else {
                    $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
                }
            }
        });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
    }
}

const tryResetPassword = () => {
    $("body").modalLoading('show', false);
    $("#trpclientid").val('');
    try {
        BACKEND.Send('RequestCodeChangePassword', {username: $("#rp-email").val()}).then(async (response) => {
            $("body").modalLoading('hide');
            if (response && response.success == true) {
                $("#rp-form-alert").hide().html('');
                $("#trpclientid").val(response.client_id);
                $("#modal_reset_password").modal('hide');
                $("#rp-email").val('');
                toaster.success(getNameTd('.We_have_sent_a_password_reset_code_to_your_email'));
                $("#modal_set_reset_password").modal('show');
            } else {
                if (response.msg) {
                    $("#rp-form-alert").show('slow').html(response.msg);
                }
                else {
                    $("#rp-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                }
            }
        });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
    }
}

const trySetResetPassword = () => {
    $("body").modalLoading('show', false);
    try {
        BACKEND.Send('ChangePassword', { _lang: _lang, clientId: $("#trpclientid").val(), code: $("#rp-token").val(), Password: $("#srp-password").val(), CPassword: $("#srp-cpassword").val() }).then(async (response) => {
            $("body").modalLoading('hide');
            if (response && response.success == true){
                $("#trpclientid").val('');
                $("#modal_set_reset_password").modal('hide');
                bootbox.alert(response.msg ? response.msg : getNameTd('.Password_reset_successfully_text'), (r) => {
                    $("#modal_login").modal('show');
                });
            }
            else{
                if (response.msg) {
                    $("#srp-form-alert").show('slow').html(response.msg);
                }
                else {
                    $("#srp-form-alert").show('slow').html(getNameTd('.chek_meets_set_password_text'));
                }
            }
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

function GetStatusAccount(user) {
    switch (user.status) {
        case '1': return { text: getNameTd('.online_text'), classBg: 'bg-success', classTxt: 'text-success', class: 'online_text' };

        case '2': return { text: getNameTd('.Absent_text'), classBg: 'bg-warning', classTxt: 'text-warning', class: 'Absent_text' };

        case '3': return { text: getNameTd('.Invisible_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'Invisible_text' };

        case '4': return { text: getNameTd('.Do_not_disturb_text'), classBg: 'bg-danger', classTxt: 'text-danger', class: 'Do_not_disturb_text' };

        case '5':
        default: return { text: getNameTd('.offline_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'offline_text' };
    }

}

const changeUserFriends = async () => {
    var User = await BACKEND.Send('GetAccount');

    $(".ROWLUNDFRIENDSFF").html('');
    $(".ROWLUNDFRIENDSFP").html('');
    $(".ROWLUNDFRIENDSFRJ").html('');
    $(".ROWLUNDFRIENDSFBLOCK").html('');
    //console.log(User);
    if ( User && User.friends ) {
        $(".IACCFRIEND").removeClass('pulse-orange');
        $(".UND_profileViewFriends").removeClass('pulse-orange');
        if ( User.email_verified ) $(".UND_usericon.MM").removeClass('pulse-orange');
        User.friends.forEach(Friend => {
            $(`.ICCADDFRIEND[data-id="${Friend.id}"]`).attr('disabled', true);
            if(Friend.friendRequestStatus){
                if(Friend.friendRequestStatus.friends == true){
                    $(".ROWLUNDFRIENDSFF").append(`
                    <div class="col-md-12">
                        <div class="card theme-card me-1">
                            ${GetNamePlateForUser(Friend)}
                            <div class="card-body z-1">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                <div>
                                                    <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                    <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <a href="#" class="btn btn-sm btn-danger UnfriendACCT Unfriend_icon_text" data-id="${Friend.friendRequestStatus.RequestId}">
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
                else if(Friend.friendRequestStatus.refused == true){
                    if (Friend.friendRequestStatus.byId != null) {
                        $(".ROWLUNDFRIENDSFRJ").append(`
                        <div class="col-md-12">
                            <div class="card theme-card me-1">
                                ${GetNamePlateForUser(Friend)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                        <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
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
                                ${GetNamePlateForUser(Friend)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                        <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <a href="#" class="btn btn-sm btn-danger order_refused_text me-1">
                                                        ${getNameTd('.order_refused_text')}
                                                    </a>
                                                    <a href="#" class="btn btn-sm btn-success UNDRNOFPFF RequestNewOrderfriend_icon_text" data-id="${Friend.friendRequestStatus.RequestId}">
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
                else if(Friend.friendRequestStatus.blocked == true){
                    console.log(Friend)
                    $(".ROWLUNDFRIENDSFBLOCK").append(`
                    <div class="col-md-12">
                        <div class="card theme-card me-1">
                            ${GetNamePlateForUser(Friend)}
                            <div class="card-body z-1">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                <div>
                                                    <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                    <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
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
                else {
                    /*
                    if (friend.hidedBy == parseFloat(User.id)) {
                        return;
                    }
                    */
                    if (Friend.friendRequestStatus.byId != null) {
                        $(".IACCFRIEND").addClass('pulse-orange');
                        $(".UND_profileViewFriends").addClass('pulse-orange');
                        $(".UND_usericon.MM").addClass('pulse-orange');
                        $(".ROWLUNDFRIENDSFP").append(`
                        <div class="col-md-12">
                            <div class="card theme-card me-1">
                                ${GetNamePlateForUser(Friend)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                        <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <a href="#" class="btn btn-sm btn-danger UNDREJCTPFF Refusedtfriend_icon_text me-1" data-id="${Friend.friendRequestStatus.RequestId}">
                                                        ${getNameTd('.Refusedtfriend_icon_text')}
                                                    </a>
                                                    <a href="#" class="btn btn-sm btn-success UNDACCPFF Acceptfriend_icon_text" data-id="${Friend.friendRequestStatus.RequestId}">
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
                                ${GetNamePlateForUser(Friend)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${Friend.avatar}" class="img-thumbnail rounded-circle ${GetStatusAccount(Friend).classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${Friend.premium == true ? 'text-warning' : ''}">${Friend.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${Friend.name}</h5>
                                                        <div class="m-2 d-flex">${GetUserTags(Friend)}</div>
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
            }
        });
    }

    $(".tooltip-script").tooltip();
}

const changeUserProfileStyles = async () => {
    var User = await BACKEND.Send('GetAccount');
    let profileStyle = User ? User.profileStyle : null;
    if (profileStyle) {
        if (profileStyle.namePlate) {
            if (DAO.NAMESPLATES.length > 0) {
                $("#select-user-nameplate .RM").remove();
                DAO.NAMESPLATES.forEach(async (item) => {
                    $("#select-user-nameplate").append(`<option ${item.uri == User.profileStyle.namePlate ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
                });
            }
            if (profileStyle.isDuplicateNamePlate == '1') {
                $(".UNDNamePlateMY.HINRP").show();
                $(".PREVUNDNamePlateMY.HINRP").show();
            }
            else {
                $(".UNDNamePlateMY.HINRP").hide();
                $(".PREVUNDNamePlateMY.HINRP").hide();
            }
            getParent($(".UNDNamePlateMY")).show();
            getParent($(".PREVUNDNamePlateMY")).show();
            getParent($(".UNDNamePlateMY")).css({ color: profileStyle.namePlateColor, 'background-color': profileStyle.namePlateBackground });
            getParent($(".PREVUNDNamePlateMY")).css({ color: profileStyle.namePlateColor, 'background-color': profileStyle.namePlateBackground });
            if ($(".UNDNamePlateMY").attr('src') != profileStyle.namePlate) {
                $(".UNDNamePlateMY").attr('src', `${profileStyle.namePlate}`).show();
                setTimeout(() => {
                    for (let index = 0; index < $(".UNDNamePlateMY").length; index++) {
                        const element = $(".UNDNamePlateMY").get(index);
                        element.load();
                    }
                }, 500);
            }
            if ($(".PREVUNDNamePlateMY").attr('src') != profileStyle.namePlate) {
                $(".PREVUNDNamePlateMY").attr('src', `${profileStyle.namePlate}`).show();
                setTimeout(() => {
                    for (let index = 0; index < $(".PREVUNDNamePlateMY").length; index++) {
                        const element = $(".PREVUNDNamePlateMY").get(index);
                        element.load();
                    }
                }, 500);
            }
        }
        else {
            $(".UNDNamePlateMY.HINRP").show();
            $(".PREVUNDNamePlateMY.HINRP").show();
            getParent($(".UNDNamePlateMY")).hide();
            getParent($(".PREVUNDNamePlateMY")).hide();
            getParent($(".UNDNamePlateMY")).css({ color: '', 'background-color': '' });
            getParent($(".PREVUNDNamePlateMY")).css({ color: '', 'background-color': '' });
        }

        if (profileStyle.theme && profileStyle.theme.uri) {
            if (DAO.PROFILETHEMESBCK.length > 0) {
                $("#select-user-profilebackground .RM").remove();
                DAO.PROFILETHEMESBCK.forEach(async (item) => {
                    $("#select-user-profilebackground").append(`<option ${item.uri == (User ? User.profileStyle.theme.uri : null) ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
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
                <video class="UNDNamePlate rounded rotate-180" ${profileStyle.isDuplicateNamePlate == '1' ? 'style=""' : 'style="display:none;"'} autoplay="" loop="" muted="" plays-inline="" src="${profileStyle.namePlate}">
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

const changeUserTags = async () => {
    var User = await BACKEND.Send('GetAccount');
    $("#uInput-changeUserAvatar").val('');
    $(".UND_userTags").html('');
    if (User && User.tags) {
        User.tags.forEach(tag => { $(".UND_userTags").append(`<span class="badge p-1 tooltip-script cursor-pointer" title="${tag.name}">${tag.icon}</span>`); });
    }
    if (User && User.premium == true) {
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