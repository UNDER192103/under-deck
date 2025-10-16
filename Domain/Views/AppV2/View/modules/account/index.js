var NAMESPLATES = [], PROFILETHEMESBCK= [];

export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  // ...lógica para o menu...
  await LoadUserData();
  await LoadUserThemesOptions();
}
RGSFC('LoadUserData', async function() {
  let User = await window.api.invoke('GetAccount');
  
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
            $(".UND_premium_level").html(`<button title="${User.premiumFinishDate}" class="btn btn-warning btn-sm has_Premium_icon_text" type="button">${GetNameTd('.has_Premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).addClass('text-warning');
        }
        else {
            $("#select-user-nameplate").attr('disabled', true);
            $("#select-user-profilebackground").attr('disabled', true);
            $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${GetNameTd('.no_premium_icon_text')}</button>`);
            $($(".UND_DisplayUsername").parent()).removeClass('text-warning');
        }
        if(User.avatar && User.avatar.length > 0){
            $(".UND_usericonPrevEdit").attr('src', User.avatar);
            $(".UND_usericon").attr('src', User.avatar);
        } else {
            $(".UND_usericonPrevEdit").attr('src', 'sysfssrc://img/profile-icon.png');
            $(".UND_usericon").attr('src', 'sysfssrc://img/profile-icon.png');
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
        $(".UND_premium_level").html(`<button class="btn btn-danger btn-sm no_premium_icon_text" type="button">${GetNameTd('.no_premium_icon_text')}</button>`);
        $(".UND_usericonPrevEdit").attr('src', 'sysfssrc://img/profile-icon.png');
        $(".UND_usericon").attr('src', 'sysfssrc://img/profile-icon.png');
    }

    await CheckUserProfileEnableEditButton();
    await CheckUserNotifys();
    await ChangeUserFriends();
    await ChangeUserProfileStyles();
    await ChangeUserTags();
    setTimeout(ChangeUrlRemoteUnderDeck, 500)
    $(".tooltip-script").tooltip();
});

RGSFC('GetStatusAccount', function (user) {
    switch (user.status) {
        case '1': return { text: GetNameTd('.online_text'), classBg: 'bg-success', classTxt: 'text-success', class: 'online_text' };

        case '2': return { text: GetNameTd('.Absent_text'), classBg: 'bg-warning', classTxt: 'text-warning', class: 'Absent_text' };

        case '3': return { text: GetNameTd('.Invisible_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'Invisible_text' };

        case '4': return { text: GetNameTd('.Do_not_disturb_text'), classBg: 'bg-danger', classTxt: 'text-danger', class: 'Do_not_disturb_text' };

        case '5':
        default: return { text: GetNameTd('.offline_text'), classBg: 'bg-secondary', classTxt: 'text-secondary', class: 'offline_text' };
    }

});

RGSFC('LoadUserThemesOptions', function () {
    window.api.invoke('GetThemes').then(async Result => {
        if(Result){
            var User = await await window.api.invoke('GetAccount');
            if(Result.userNamePlates){
                $("#select-user-nameplate .RM").remove();
                NAMESPLATES = Result.userNamePlates;
                Result.userNamePlates.forEach(async (item) => {
                    $("#select-user-nameplate").append(`<option ${item.uri == (User ? User.profileStyle.namePlate : null) ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
                });
            }
            $("#select-user-profilebackground .RM").remove();
            PROFILETHEMESBCK = Result.userBackgrounds;
            Result.userBackgrounds.forEach(async (item) => {
                $("#select-user-profilebackground").append(`<option ${item.uri == (User ? User.profileStyle.theme.uri : null) ? 'selected' : ''} value="${item.id}" class="RM">${item.name}</option>`);
            });
        }
    });
});

RGSFC('CheckUserProfileEnableEditButton', function () {

});

RGSFC('CheckUserNotifys', function () {

});

RGSFC('ChangeUserFriends', function () {

});

RGSFC('ChangeUserProfileStyles', async function () {
    var User = await window.api.invoke('GetAccount');
    let profileStyle = User ? User.profileStyle : null;
    if (profileStyle) {
        if (profileStyle.namePlate) {
            if (NAMESPLATES.length > 0) {
                $("#select-user-nameplate .RM").remove();
                NAMESPLATES.forEach(async (item) => {
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
            GetParent($(".UNDNamePlateMY")).show();
            GetParent($(".PREVUNDNamePlateMY")).show();
            GetParent($(".UNDNamePlateMY")).css({ color: profileStyle.namePlateColor, 'background-color': profileStyle.namePlateBackground });
            GetParent($(".PREVUNDNamePlateMY")).css({ color: profileStyle.namePlateColor, 'background-color': profileStyle.namePlateBackground });
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
            GetParent($(".UNDNamePlateMY")).hide();
            GetParent($(".PREVUNDNamePlateMY")).hide();
            GetParent($(".UNDNamePlateMY")).css({ color: '', 'background-color': '' });
            GetParent($(".PREVUNDNamePlateMY")).css({ color: '', 'background-color': '' });
        }

        if (profileStyle.theme && profileStyle.theme.uri) {
            if (PROFILETHEMESBCK.length > 0) {
                $("#select-user-profilebackground .RM").remove();
                PROFILETHEMESBCK.forEach(async (item) => {
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
        GetParent($(".UNDNamePlateMY")).hide();
        GetParent($(".PREVUNDNamePlateMY")).hide();
    }
});

RGSFC('ChangeUserTags', function () {

});

RGSFC('ChangeUrlRemoteUnderDeck', async function () {
    var User = await window.api.invoke('GetAccount');
    var Pc = await window.api.invoke('GetPC');
    var BaseUrl = await window.api.invoke('GetRemoveServerUrl');
    if (User && User.id && Pc && Pc.id ) {
        let url = `${BaseUrl}/client/?ng=webdeck/invite/${Pc.id}/`;
        $(".underdeck_url_invite_remote_version").html(url).val(url);
    }
    else
        $(".underdeck_url_invite_remote_version").html('N/A').val('N/A');
});


$(document).on('click', '.UND_CopyUserId', async (e) => {
    e.preventDefault();
    var User = await await window.api.invoke('GetAccount');
    if(User && User.id) {
        navigator.clipboard.writeText(User.id)
        .then(() => {
            console.log('Text copied to clipboard');
            $("body").click();
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});

$(document).on('click', '.UND_profileView', (r) => {
    LoadUserData();
    $("#modal_UND_profileView").modal('show');
});

$(document).on('click', '.logout_account', async (r) => {
    var User = await window.api.invoke('GetAccount');
    if (User && User.id) {
        bootbox.confirm({
            message: `<h4 class="are_you_sure_of_that_text">${GetNameTd('.are_you_sure_of_that_text')}</h4>`,
            buttons: {
                confirm: {
                    label: '<i class="bi bi-check2"></i> ' + GetNameTd('.yes'),
                    className: 'btn-success yes'
                },
                cancel: {
                    label: '<i class="bi bi-x-lg"></i> ' + GetNameTd('.no'),
                    className: 'btn-danger not'
                }
            },
            callback: async (res) => {
                if (res) {
                    await window.api.invoke('LogoutAccount');
                    LoadUserData();
                }
            }
        });
    }
});

$(document).on('submit', '#FormUserLogin', async (e) => {
    e.preventDefault();
    $("body").modalLoading('show', false);
    window.api.invoke('UserLogin', {username: $("#u-email").val(), password: $("#u-password").val() }).then(User => {
        $("body").modalLoading('hide');
        if ( User && User.id) {
            $("#u-form-alert").hide('slow').html();
            $("#modal_login").modal('hide');
            window.toaster.success(GetNameTd('.msg_successfully_logged_text'));
            bootbox.alert(GetNameTd('.msg_successfully_logged_text'));
            $("#u-email").val("");
            $("#u-password").val("");
            LoadUserData();
        } else {
            $("#u-form-alert").show('slow').html(GetNameTd('.msg_err_u_ud_login_text'));
        }
    });
});

$(document).on('click', '.UND_SelectUStatus', async (e) => {
    e.preventDefault();
    window.api.invoke('UpdateUserStatus', { id: e.currentTarget.dataset.id }).then(Res => {
        LoadUserData();
    });
});

$(document).on('click', '.btn-OpenLocalServerInBrowser', async (e) => {
    e.preventDefault();
    window.api.invoke('OpenUrlInBrowser', $("#local-server-adress-acess-url").val())
});

$(document).on('click', '#openInvitationUNDRemotVersion', async (e) => {
    e.preventDefault();
    window.api.invoke('OpenUrlInBrowser', $(".underdeck_url_invite_remote_version").val())
});
