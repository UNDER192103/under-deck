const RPC = require("discord-rpc");
var DiscordRPCLogged = false, DC_RPC_Client = null;
var isTimeDc = null, isTimeDc2 = null, isTimeD3 = null;
function StartDCRPC(isPreload = false) {
    DC_RPC_Client = new RPC.Client({ transport: 'ipc' });

    DC_RPC_Client.on('ready', async () => {
        await DAO.DISCORD.set('accessToken', DC_RPC_Client.accessToken);
        await BACKEND.Send('app-maxmize-force', '');
        DiscordRPCLogged = true;
        if (DC_RPC_Client.application) {
            if (DC_RPC_Client.application.bot.avatar)
                $(".DC_appicon").attr('src', `https://cdn.discordapp.com/avatars/${DC_RPC_Client.application.id}/${DC_RPC_Client.application.bot.avatar}`);
            $(".DC_app_name").html(DC_RPC_Client.application.name);
        }
        if (DC_RPC_Client.user) {
            $(".DC_usericon").attr('src', `https://cdn.discordapp.com/avatars/${DC_RPC_Client.user.id}/${DC_RPC_Client.user.avatar}`);
            $(".DC_global_name").html(DC_RPC_Client.user.global_name);
        }
        toaster.success(getNameTd('.Connected_to_discord_successfully_text'));
        $(".bootbox-close-button").click();
        $("#button-login-discord-rpc")
            .removeClass('btn-success')
            .addClass('btn-danger')
            .removeClass('hover-pulse-grean')
            .addClass('hover-pulse-red')
            .removeClass('connect-discord')
            .addClass('desconnect-discord')
            .html(getNameTd('.desconnect-discord'));
    });

    DC_RPC_Client.on('disconnected', async () => {
        DiscordRPCLogged = false;
        StartDCRPC();
        toaster.success(getNameTd('.Disconnected_from_discord_successfully_text'));
        $("#button-login-discord-rpc")
            .addClass('btn-success')
            .removeClass('btn-danger')
            .addClass('hover-pulse-grean')
            .removeClass('hover-pulse-red')
            .removeClass('desconnect-discord')
            .addClass('connect-discord')
            .html(getNameTd('.connect-discord'));
        $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
        $(".DC_global_name").html('');
    });

    DC_RPC_Client.on('ERROR', async (err) => {
        DiscordRPCLogged = false;
        StartDCRPC();
        $(".bootbox-close-button").click();
        bootbox.alert({
            title: getNameTd('.unable_to_connect_to_Discord_text'),
            message: err.message,
            callback: function () { }
        });
        toaster.success(getNameTd('.Disconnected_from_discord_successfully_text'));
        $("#button-login-discord-rpc")
            .addClass('btn-success')
            .removeClass('btn-danger')
            .addClass('hover-pulse-grean')
            .removeClass('hover-pulse-red')
            .removeClass('desconnect-discord')
            .addClass('connect-discord')
            .html(getNameTd('.connect-discord'));
        $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
        $(".DC_global_name").html('');
    });

    if (isPreload) {
        LoginDCRPC();
    }
}

async function LoginDCRPC(ForceNewLogin = false) {
    /*try {
        toaster.success(getNameTd('.Connecting_to_Discord_text'));
    } catch (error) { }*/
    var DC_RPC_CONFIG = {
        clientId: await DAO.DISCORD.get('clientId'),
        clientSecret: await DAO.DISCORD.get('clientSecret'),
        scopes: ['rpc'],
        redirectUri: 'http://127.0.0.1',
    };
    if (!ForceNewLogin) {
        accessToken = await DAO.DISCORD.get('accessToken');
        if (accessToken) {
            DC_RPC_CONFIG.accessToken = accessToken;
        }
        else {
            return;
        }
    }
    else {
        DAO.DISCORD.set('accessToken', null);
    }
    DC_RPC_Client.login(DC_RPC_CONFIG).catch(async (err) => {
        await BACKEND.Send('app-maxmize-force', '');
        DiscordRPCLogged = false;
        StartDCRPC();
        $(".bootbox-close-button").click();
        bootbox.alert({
            title: getNameTd('.unable_to_connect_to_Discord_text'),
            message: err.message,
            callback: function () { }
        });
        await DAO.DISCORD.set('accessToken', null);
        toaster.danger(getNameTd('.unable_to_connect_to_Discord_text'));
        $("#button-login-discord-rpc")
            .addClass('btn-success')
            .removeClass('btn-danger')
            .addClass('hover-pulse-grean')
            .removeClass('hover-pulse-red')
            .removeClass('desconnect-discord')
            .addClass('connect-discord')
            .html(getNameTd('.connect-discord'));
        $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
        $(".DC_global_name").html('');
    });
}

function MuteOrUnmuteMic() {
    try {
        DC_RPC_Client.getVoiceSettings()
            .then((vs) => {
                vs.mute = vs.mute ? false : true;
                DC_RPC_Client.setVoiceSettings(vs);
            })
            .catch((e) => {
                console.log(e);
            });
    } catch (error) {

    }
}

function MuteOrUnmuteAudio() {
    try {
        DC_RPC_Client.getVoiceSettings()
            .then((vs) => {
                if (vs.deaf) {
                    vs.deaf = false;
                    vs.mute = false;
                }
                else {
                    vs.deaf = true;
                    vs.mute = true;
                }
                DC_RPC_Client.setVoiceSettings(vs);
            })
            .catch((e) => {
                console.log(e);
            });
    } catch (error) {

    }
}

const tryLoginDiscordRpc = async () => {
    var clientId = $("#dc-rpc-clientId").val();
    var clientSecret = $("#dc-rpc-clientSecret").val();
    $("#dc-rpc-form-alert").hide('slow').html();
    if (clientId.length == 19 && clientSecret.length == 32) {
        await DAO.DISCORD.set('clientId', clientId);
        await DAO.DISCORD.set('clientSecret', clientSecret);
        await DAO.DISCORD.set('accessToken', null);
        $("#modal_discord_integration").modal('hide');
        bootbox.alert(`<h4>${getNameTd('.Please_check_the_discord_application_installed_on_your_machine')}</h4>`);
        LoginDCRPC(true);
    }
    else {
        $("#dc-rpc-form-alert").show('slow').html(
            getNameTd('.Please_check_if_the_Client_ID_Application_ID_and_Client_Secret_have_been_entered_correctly')
        );
    }
}

$(document).ready(async () => {
    $(document).on('click', '.open-url-Discord-Developer-Portal', async () => {
        exec(`start ${conf.DISCORD.URL_APPS}`);
    });
    $("#button-login-discord-rpc").click(async () => {
        if (!DiscordRPCLogged) {
            $("#dc-rpc-clientId").val(await DAO.DISCORD.get('clientId'));
            $("#dc-rpc-clientSecret").val(await DAO.DISCORD.get('clientSecret'));
            $("#modal_discord_integration").modal('show');
        }
        else {
            $("#modal_discord_integration").modal('hide');
            DiscordRPCLogged = false;
            await DAO.DISCORD.set('accessToken', null);
            DC_RPC_Client.destroy();
        }
    });
});

StartDCRPC(true);