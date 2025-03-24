const RPC = require("discord-rpc");
var DiscordRPCLogged = false, DC_RPC_Client = null;
var isTimeDc = null, isTimeDc2 = null, isTimeD3 = null;
function StartDCRPC(isPreload = false) {
    DC_RPC_Client = new RPC.Client({ transport: 'ipc' });

    DC_RPC_Client.on('ready', async () => {
        await DAO.DISCORD.set('accessToken', DC_RPC_Client.accessToken);
        DiscordRPCLogged = true;
        if (DC_RPC_Client.application) {
            $(".DC_appicon").attr('src', `https://cdn.discordapp.com/avatars/${DC_RPC_Client.application.id}/${DC_RPC_Client.application.bot.avatar}`);
            $(".DC_app_name").html(DC_RPC_Client.application.name);
        }
        if (DC_RPC_Client.user) {
            $(".DC_usericon").attr('src', `https://cdn.discordapp.com/avatars/${DC_RPC_Client.user.id}/${DC_RPC_Client.user.avatar}`);
            $(".DC_global_name").html(DC_RPC_Client.user.global_name);
        }
        toaster.success(getNameTd('.Connected_to_discord_successfully_text'));
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

    DC_RPC_Client.on('ERROR', async () => {
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

    if (isPreload) {
        LoginDCRPC();
    }
}

async function LoginDCRPC(ForceNewLogin = false) {
    try {
        toaster.success(getNameTd('.Connecting_to_Discord_text'));
    } catch (error) { }
    var DC_RPC_CONFIG = {
        clientId: conf.DISCORD.IPC.clientId,
        clientSecret: conf.DISCORD.IPC.clientSecret,
        scopes: conf.DISCORD.IPC.scopes,
        redirectUri: conf.DISCORD.IPC.redirectUri,
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
        DiscordRPCLogged = false;
        StartDCRPC();
        console.log(err);
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

$(document).ready(async () => {
    $("#button-login-discord-rpc").click(async () => {
        if (!DiscordRPCLogged) {
            await LoginDCRPC(true);
        }
        else {
            DiscordRPCLogged = false;
            await DAO.DISCORD.set('accessToken', null);
            DC_RPC_Client.destroy();
        }
    });
});

StartDCRPC(true);