class DiscordControler {
    RPC = require("discord-rpc");
    CLLIENT = null;
    isConnected = false;
    isMuted = false;
    isDeafened = false;
    isNoiseSuppression = false;
    constructor(){
        this.CLLIENT = new this.RPC.Client({ transport: 'ipc' });
        this.RegisterEvents();
    }

    RegisterEvents(){
        this.CLLIENT.on('ready', async () => {
            this.isConnected = true;
            await this.GetVoiceSettings();
            await DAO.DISCORD.set('accessToken', this.CLLIENT.accessToken);
            await BACKEND.Send('app-maxmize-force', '');

            if (this.CLLIENT.application) {
            if (this.CLLIENT.application.bot.avatar)
                $(".DC_appicon").attr('src', `https://cdn.discordapp.com/avatars/${this.CLLIENT.application.id}/${this.CLLIENT.application.bot.avatar}`);
                $(".DC_app_name").html(this.CLLIENT.application.name);
            }
            if (this.CLLIENT.user) {
                $(".DC_usericon").attr('src', `https://cdn.discordapp.com/avatars/${this.CLLIENT.user.id}/${this.CLLIENT.user.avatar}`);
                $(".DC_global_name").html(this.CLLIENT.user.global_name);
            }
            toaster.success(getNameTd('.Connected_to_discord_successfully_text'));
            $(".bootbox-close-button").click();
            $("#button-login-discord-rpc").removeClass('btn-success').addClass('btn-danger').removeClass('hover-pulse-grean').addClass('hover-pulse-red').removeClass('connect-discord').addClass('desconnect-discord').html(getNameTd('.desconnect-discord'));
        });

        this.CLLIENT.on('disconnected', async () => {
            this.isConnected = false;
            this.Connect();
            toaster.success(getNameTd('.Disconnected_from_discord_successfully_text'));
            $("#button-login-discord-rpc").addClass('btn-success').removeClass('btn-danger').addClass('hover-pulse-grean').removeClass('hover-pulse-red').removeClass('desconnect-discord').addClass('connect-discord').html(getNameTd('.connect-discord'));
            $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
            $(".DC_global_name").html('');
        });

        this.CLLIENT.on('ERROR', async (err) => {
            this.isConnected = false;
            this.Connect();
            $(".bootbox-close-button").click();
            bootbox.alert({
                title: getNameTd('.unable_to_connect_to_Discord_text'),
                message: err.message,
                callback: function () { }
            });
            toaster.success(getNameTd('.Disconnected_from_discord_successfully_text'));
            $("#button-login-discord-rpc").addClass('btn-success').removeClass('btn-danger').addClass('hover-pulse-grean').removeClass('hover-pulse-red').removeClass('desconnect-discord').addClass('connect-discord').html(getNameTd('.connect-discord'));
            $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
            $(".DC_global_name").html('');
        });
    }

    async Disconnect(){
        if (this.isConnected) {
            await this.CLLIENT.destroy();
            this.isConnected = false;
            this.CLLIENT = new this.RPC.Client({ transport: 'ipc' });
            this.RegisterEvents();
        }
    }

    async Connect(ForceNewLogin = false){
        try {
            if(!this.isConnected){
                var config = { clientId: await DAO.DISCORD.get('clientId'), clientSecret: await DAO.DISCORD.get('clientSecret'), scopes: ['rpc'], redirectUri: 'http://127.0.0.1' };
                if (!ForceNewLogin) {
                    var accessToken = await DAO.DISCORD.get('accessToken');
                    if (accessToken) {
                        config.accessToken = accessToken;
                    }
                    else {
                        return;
                    }
                }
                else {
                    DAO.DISCORD.set('accessToken', null);
                }

                this.CLLIENT.login(config).catch(async (err) => {
                    await BACKEND.Send('app-maxmize-force', '');
                    this.isConnected = false;
                    this.Connect();
                    $(".bootbox-close-button").click();
                    bootbox.alert({
                        title: getNameTd('.unable_to_connect_to_Discord_text'),
                        message: err.message,
                        callback: function () { }
                    });
                    await DAO.DISCORD.set('accessToken', null);
                    toaster.danger(getNameTd('.unable_to_connect_to_Discord_text'));
                    $("#button-login-discord-rpc").addClass('btn-success').removeClass('btn-danger').addClass('hover-pulse-grean').removeClass('hover-pulse-red').removeClass('desconnect-discord').addClass('connect-discord').html(getNameTd('.connect-discord'));
                    $(".DC_usericon").attr('src', `../../src/img/profile-icon.png`);
                    $(".DC_global_name").html('');
                });
            }
            else{
                this.CLLIENT.connect();
            }
        } catch (error) {
            console.log(error)
        }
    }

    async GetVoiceSettings(){
        return new Promise((resolve) => {
            this.CLLIENT.getVoiceSettings()
            .then((vs) => {
                this.isMuted = vs.mute;
                this.isDeafened = vs.deaf;
                resolve(vs);
            })
            .catch((err) => {
                console.log(err);
                resolve(null);
            });
        });
    }

    async Mute(){
        if(this.isConnected){
            await this.CLLIENT.setVoiceSettings({ mute: true });
            await this.GetVoiceSettings();
        }
    }

    async UnMute(){
        if(this.isConnected){
            await this.CLLIENT.setVoiceSettings({ mute: false });
            await this.GetVoiceSettings();
        }
    }

    async Deafen(){
        if(this.isConnected){
            await this.CLLIENT.setVoiceSettings({ deaf: true });
            await this.GetVoiceSettings();
        }
    }

    async UnDeafen(){
        if(this.isConnected){
            await this.CLLIENT.setVoiceSettings({ deaf: false });
            await this.GetVoiceSettings();
        }
    }

    async ToggleMute(){
        if(this.isConnected){
            await this.GetVoiceSettings();
            if(this.isMuted){
                await this.UnMute();
            }
            else{
                await this.Mute();
            }
            await this.GetVoiceSettings();
        }
    }

    async ToggleDeafen(){
        if(this.isConnected){
            await this.GetVoiceSettings();
            if(this.isDeafened){
                await this.UnDeafen();
            }
            else{
                await this.Deafen();
            }
            await this.GetVoiceSettings();
        }
    }
}

module.exports = new DiscordControler();