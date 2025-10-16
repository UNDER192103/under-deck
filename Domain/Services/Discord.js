const  { EventEmitter } = require('events');

class DiscordService extends EventEmitter {
    RPC = require("discord-rpc");
    CLLIENT = null;
    isConnected = false;
    isMuted = false;
    isDeafened = false;
    isNoiseSuppression = false;

    constructor(){
        super();
        this.CLLIENT = new this.RPC.Client({ transport: 'ipc' });
        this.RegisterEvents();
        this.Connect(false, false);
    }

    RegisterEvents(){
        this.CLLIENT.on('ready', async () => {
            this.isConnected = true;
            await this.GetVoiceSettings();
            await DAO.DISCORD.set('accessToken', this.CLLIENT.accessToken);

            this.emit('ready', this.CLLIENT);
        });

        this.CLLIENT.on('disconnected', async () => {
            this.isConnected = false;
            this.Connect();
            this.emit('disconnected');
        });

        this.CLLIENT.on('ERROR', async (err) => {
            this.isConnected = false;
            this.Connect();
            this.emit('error', err);
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

    async Connect(ForceNewLogin = false, reconect = true){
        return new Promise(async (resolve) => {
            try {
                if(!this.isConnected){
                    var config = { clientId: await DAO.DISCORD.get('clientId'), clientSecret: await DAO.DISCORD.get('clientSecret'), scopes: ['rpc'], redirectUri: 'http://127.0.0.1' };
                    if (!ForceNewLogin) {
                        var accessToken = await DAO.DISCORD.get('accessToken');
                        if (accessToken) {
                            config.accessToken = accessToken;
                        }
                        else {
                            return resolve(false);
                        }
                    }
                    else {
                        DAO.DISCORD.set('accessToken', null);
                    }

                    this.CLLIENT.login(config).then(async (data) => {
                        //console.log(data);
                        this.isConnected = true;
                        resolve(true);
                    }).catch(async (error) => {
                        console.log(error);
                        this.isConnected = false;
                        if(reconect) this.Connect();
                        resolve(false);
                    });
                    return;
                }
            } catch (error) {
                console.log(error);
            }
            resolve(false);
        });
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

module.exports = DiscordService;