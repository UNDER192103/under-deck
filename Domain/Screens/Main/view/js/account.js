
$(document).ready(async () => {
    loadUserData();

    $(document).on('click', '.UND_profileView', (r) => {
        resetUserProfileEdit();
        $("#modal_UND_profileView").modal('show');
    });

    $("#insertUND_DisplayUsername").on( 'keyup', async () => {
        if($("#insertUND_DisplayUsername").val() != DAO.USER.account){
            DAO.USERDATAUPDATE.name = $("#insertUND_DisplayUsername").val();
        }
        else{
            DAO.USERDATAUPDATE.name = null;
        }

        await checkUserProfileEnableEditButton();
    });

    $("#changeUserAvatar").click(()=>{ $("#uInput-changeUserAvatar").click(); });

    $(document).on('click', '.logout_account', (r) => {
        if(DAO.USER != null){
            bootbox.confirm({
                message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> '+getNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> '+getNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: async (res) => {
                    if(res){
                        DAO.USER = null;
                        await DAO.DB.set('user', DAO.USER);
                        $(".UND_username").html("");
                        $(".UND_usericon").attr('src', "");
                        $(".UND_usernotloged").show();
                        $(".UND_userloged").hide();
                    }
                }
            });
        }
    });

    $(document).on('click', '.btn_remove_account_avatar', (r) => {
        if(DAO.USERDATAUPDATE.icon != null){
            resetUserProfileEdit();
        }
        else if(DAO.USER != null){
            bootbox.confirm({
                message: `<h4 class="are_you_sure_of_that_text">${getNameTd('.are_you_sure_of_that_text')}</h4>`,
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> '+getNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> '+getNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: async (res) => {
                    if(res){
                        $("body").modalLoading('show', false);
                        try {
                            API.App.post('', {
                                _lang: _lang,
                                method: "remove-user-avatar",
                                client_id: DAO.USER.client_id,
                                token: DAO.USER.token
                            })
                            .then(async ( res ) => {
                                let resData = res.data;
                                $("body").modalLoading('hide');
                                if(resData.result && resData.result.account){
                                    await DAO.DB.set('user', resData.result.account);
                                    DAO.USER = resData.result.account;
                                }
                                loadUserData();
                                toaster.success(resData.msg);
                                bootbox.alert(resData.msg);
                            })
                            .catch( error => {
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

    $("#uInput-changeUserAvatar").change(async ()=>{
        if($("#uInput-changeUserAvatar")[0].files.length > 0){
            DAO.USERDATAUPDATE.icon = $("#uInput-changeUserAvatar")[0].files[0];
            $(".UND_usericonPrevEdit").attr('src', DAO.USERDATAUPDATE.icon.path);
        }
        else{
            DAO.USERDATAUPDATE.icon = null;
            if(DAO.USER.icon != null && DAO.USER.icon.length > 6){
                $(".UND_usericonPrevEdit").attr('src', DAO.USER.icon);
            }
            else{
                $(".UND_usericonPrevEdit").attr('src', '../../src/img/profile-icon.png');
            }
        }

        await checkUserProfileEnableEditButton();
    });

    $('#modal_UND_profileView').on('hidden.bs.modal', resetUserProfileEdit);

    $(document).on('click', '.btn_UpdateUserData', (r) => {
        $("body").modalLoading('show', false);
        try {
            let formData = new FormData();

            formData.append('_lang', _lang);
            formData.append('method', "Update-User-Data");
            formData.append('client_id', DAO.USER.client_id);
            formData.append('token', DAO.USER.token);
            formData.append('icon', DAO.USERDATAUPDATE.icon);
            formData.append('name', DAO.USERDATAUPDATE.name);
            formData.append('username', DAO.USERDATAUPDATE.username);

            API.App.post('', formData)
            .then(async ( res ) => {
                let resData = res.data;
                setTimeout(async ()=>{
                    $("body").modalLoading('hide');
                    if(res.data.success == true && resData.result && resData.result.account){
                        await DAO.DB.set('user', resData.result.account);
                        DAO.USER = resData.result.account;
                        resetUserProfileEdit();
                        loadUserData();
                        toaster.success(resData.msg);
                    }
                    else{
                        toaster.danger(resData.msg);
                        bootbox.alert(resData.msg);
                    }
                }, 250);
            })
            .catch( error => {
                $("body").modalLoading('hide');
                bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
            });
        } catch (error) {
            $("body").modalLoading('hide');
            bootbox.alert(getNameTd('.msg_unable_to_perform_this_action'));
        }
    });

    $(document).on('click', '.btn-forgot-pw', (r) => {

    });

    $(document).on('click', '.User-register-modal', (r) => {

    });

    setInterval(loadUserData, 1800000);
});

const resetUserProfileEdit = async () => {
    DAO.USERDATAUPDATE.icon = null;
    DAO.USERDATAUPDATE.name = null;
    DAO.USERDATAUPDATE.username = null;

    $("#uInput-changeUserAvatar").val('');
    $(".ValUND_username").val(DAO.USER.username);
    $(".ValUND_email").val(DAO.USER.email);
    $(".UND_username").html(DAO.USER.account);
    $(".UND_datecreated").html(new Date(DAO.USER.created_date).toLocaleString());
    $(".ValUND_DisplayUsername").val(DAO.USER.account);
    if(DAO.USER.icon != null && DAO.USER.icon.length > 6){
        $(".UND_usericonPrevEdit").attr('src', DAO.USER.icon);
        $(".UND_usericon").attr('src', DAO.USER.icon);
    }
    else{
        $(".UND_usericonPrevEdit").attr('src', '../../src/img/profile-icon.png');
        $(".UND_usericon").attr('src', '../../src/img/profile-icon.png');
    }

    await checkUserProfileEnableEditButton();
}

const checkUserProfileEnableEditButton = async () => {
    if(DAO.USERDATAUPDATE.icon != null || DAO.USERDATAUPDATE.name != null){
        $(".btn_UpdateUserData").show('slow');
    }
    else{
        $(".btn_UpdateUserData").hide('slow');
    }
}

const loadUserData = async () => {
    if(DAO.USER != null && DAO.USER.client_id != null && DAO.USER.account != null){
        $(".UND_usernotloged").hide();
        $(".UND_userloged").show();
        
        await resetUserProfileEdit();

        API.App.post('', {
            _lang: _lang,
            method: "check-user",
            client_id: DAO.USER.client_id,
            token: DAO.USER.token
        })
        .then(async ( res ) => {
            if(res.data.result != true){
                DAO.USER = null;
                await DAO.DB.set('user', DAO.USER);
                $(".UND_username").html("");
                $(".UND_datecreated").html("");
                $(".ValUND_username").val("");
                $(".ValUND_email").val("");
                $(".ValUND_DisplayUsername").val("");
                $(".UND_usericon").attr('src', "");
                $(".UND_usernotloged").show();
                $(".UND_userloged").hide();
            }
            else{
                if(JSON.stringify(DAO.USER) != JSON.stringify(res.data.account)){
                    await DAO.DB.set('user', res.data.account);
                    DAO.USER = res.data.account;
                    $(".ValUND_username").val(DAO.USER.username);
                    $(".ValUND_email").val(DAO.USER.email);
                    $(".UND_username").html(DAO.USER.account);
                    $(".UND_datecreated").html(new Date(DAO.USER.created_date).toLocaleString());
                    $(".ValUND_DisplayUsername").val(DAO.USER.account);
                    if(DAO.USER.icon != null && DAO.USER.icon.length > 6){
                        $(".UND_usericon").attr('src', DAO.USER.icon);
                    }
                    else{
                        $(".UND_usericon").attr('src', '../../src/img/profile-icon.png');
                    }
                }
                setTimeout(loadUserData, 1800000);
            }
        })
        .catch( error => {

        });
    }
    else{
        $(".UND_usernotloged").show();
        $(".UND_userloged").hide();
    }
}

const tryLoginUser = () =>{
    $("body").modalLoading('show', false);
    try {
        API.App.post('', {
            _lang: _lang,
            method: "login",
            username: $("#u-email").val(),
            password: $("#u-password").val()
        })
        .then(async ( res ) => {
            setTimeout(async ()=>{
                $("body").modalLoading('hide');
                if( (res.data != null && res.data.success != null) &&res.data.success == true){
                    $("#u-form-alert").hide('slow').html();
                    await DAO.DB.set('user', res.data.result.account);
                    DAO.USER = res.data.result.account;
                    $("#modal_login").modal('hide');
                    toaster.success(getNameTd('.msg_successfully_logged_text'));
                    bootbox.alert(getNameTd('.msg_successfully_logged_text'));
                    $("#u-email").val("");
                    $("#u-password").val("");
                    loadUserData();
                } else {
                    if(res.data.result == 0){
                        $("#u-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                    }
                    else if(res.data.result == 1){
                        $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_up_login_text'));
                    }
                    else {
                        $("#u-form-alert").show('slow').html(getNameTd('.msg_err_u_ud_login_text'));
                    }
                }
            }, 250);
        })
        .catch( error => {
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
        .then(async ( res ) => {
            let resData = res.data;
            setTimeout(async ()=>{
                $("body").modalLoading('hide');
                if( (res.data != null && res.data.success != null) && res.data.success == true){
                    $("#ur-name").val('');
                    $("#ur-username").val('');
                    $("#ur-email").val('');
                    $("#ur-password").val('');
                    $("#ur-cpassword").val('');
                    $("#u-form-r-alert").hide('slow').html();
                    await DAO.DB.set('user', resData.result.account);
                    DAO.USER = resData.result.account;
                    $("#modal_register").modal('hide');
                    toaster.success(resData.msg);
                    bootbox.alert(resData.msg);
                    loadUserData();
                } else {
                    if(res.data.msg){
                        $("#u-form-r-alert").show('slow').html(res.data.msg);
                    }
                    else{
                        $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
                    }
                }
            }, 250);
        })
        .catch( error => {
            $("body").modalLoading('hide');
            $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
        });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-r-alert").show('slow').html(getNameTd('.msg_err_u_ud_register_text'));
    }
}

const tryResetPassword = () =>{
    $("body").modalLoading('show', false);
    $("#trpemail").val('');
    try {
        API.App.post('', {
            _lang: _lang,
            method: "reset-password",
            username: $("#rp-email").val(),
        })
        .then(async ( res ) => {
            setTimeout(async ()=>{
                $("body").modalLoading('hide');
                if( (res.data != null && res.data.success != null) &&res.data.success == true){
                    $("#rp-form-alert").show('hide').html('');
                    $("#trpemail").val($("#rp-email").val());
                    $("#modal_reset_password").modal('hide');
                    $("#rp-email").val('');
                    toaster.success(getNameTd('.We_have_sent_a_password_reset_code_to_your_email'));
                    $("#modal_set_reset_password").modal('show');
                } else {
                    if(res.data.result == 0){
                        $("#rp-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                    }
                    else {
                        $("#rp-form-alert").show('slow').html(getNameTd('.no_accounts_found_text'));
                    }
                }
            }, 250);
        })
        .catch( error => {
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
        .then(async ( res ) => {
            setTimeout(async ()=>{
                $("body").modalLoading('hide');
                if( (res.data != null && res.data.success != null) && res.data.success == true){
                    $("#trpemail").val('');
                    $("#modal_set_reset_password").modal('hide');
                    bootbox.alert(getNameTd('.Password_reset_successfully_text'), (r)=>{
                        $("#modal_login").modal('show');
                    });
                } else {
                    if(res.data.result == 0){
                        $("#srp-form-alert").show('slow').html(getNameTd('.Please_provide_a_valid_password_reset_token_text'));
                    }
                    else if(res.data.result == 1){
                        $("#srp-form-alert").show('slow').html(res.data.msg);
                    }
                    else {
                        $("#srp-form-alert").show('slow').html(getNameTd('.chek_meets_set_password_text'));
                    }
                }
            }, 250);
        })
        .catch( error => {
            $("body").modalLoading('hide');
            $("#u-form-alert").show('slow').html(getNameTd('.An_error_occurred_when_trying_to_reset_the_password_text'));
        });
    } catch (error) {
        $("body").modalLoading('hide');
        $("#u-form-alert").show('slow').html(getNameTd('.An_error_occurred_when_trying_to_reset_the_password_text'));
    }
}