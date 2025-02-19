
$(document).ready(async () => {
    loadUserData();

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

    $("#btn-view-u-password").click(()=>{
        if($("#u-password").attr('type') == "text"){
            $("#btn-view-u-password").html('<i class="bi bi-eye-fill"></i>');
            $("#u-password").attr('type', 'password');
        }
        else{
            $("#btn-view-u-password").html('<i class="bi bi-eye-slash-fill"></i>');
            $("#u-password").attr('type', 'text');
        }
    });

    $(document).on('click', '.btn-forgot-pw', (r) => {

    });

    $(document).on('click', '.User-register-modal', (r) => {

    });
});

const loadUserData = () => {
    if(DAO.USER != null && DAO.USER.id != null && DAO.USER.account != null){
        $(".UND_usernotloged").hide();
        $(".UND_userloged").show();
        $(".UND_username").html(DAO.USER.account);
        if(DAO.USER.icon != null && DAO.USER.icon.length > 6){
            $(".UND_usericon").attr('src', DAO.USER.icon);
        }

        API.App.post('', {
            _lang: _lang,
            method: "check-user",
            id: DAO.USER.id,
            token: DAO.USER.token
        })
        .then(async ( res ) => {
            if(res.data.result != true){
                DAO.USER = null;
                await DAO.DB.set('user', DAO.USER);
                $(".UND_username").html("");
                $(".UND_usericon").attr('src', "");
                $(".UND_usernotloged").show();
                $(".UND_userloged").hide();
            }
            else{
                if(JSON.stringify(DAO.USER) != JSON.stringify(res.data.account)){
                    await DAO.DB.set('user', res.data.account);
                    DAO.USER = res.data.account;
                    $(".UND_username").html(DAO.USER.account);
                    if(DAO.USER.icon != null && DAO.USER.icon.length > 6){
                        $(".UND_usericon").attr('src', DAO.USER.icon);
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