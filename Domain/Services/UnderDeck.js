const fs = require('fs');
const convert = require('xml-js');
const path = require('path');
const { app } = require("electron");
const loudness = require("loudness");
const { exec } = require('child_process');
const axios = require("axios");
const { deploymentmanager } = require('googleapis/build/src/apis/deploymentmanager');
const { uuid } = require('systeminformation');

var robotjs;
try {
    robotjs = require('robotjs');
} catch (error) {
    console.log(error);
}

class ServiceUnderDeck {
    ClientDiscordService = null;
    ObsService = null;
    SendFrontDataCallback = null;
    ProcessObsEvents = null;
    FormTListCRT = {
        list: new Array(),
        listPrograms: new Array()
    };

    constructor(ClientDiscordService, ObsService = null) {
        this.ClientDiscordService = ClientDiscordService;
        this.ObsService = ObsService;
    }

    uuidv4() { return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)); }

    async SetSendFrontDataCallback(_function) {
        this.SendFrontDataCallback = _function;
    }

    async SetProcessObsEvents(_function) {
        this.ProcessObsEvents = _function;
    }

    async SetKeysOverlay(list) {
        await DAO.DB.set('keys-overlay', list);
    }

    async UpdateAppThemeAnimations(data) {
        await DAO.DB.set('isEnableAnimations', data.enabled);
        if (data.model != null) await DAO.DB.set('modelAnimation', data.model || 'random');
        if (data.animation != null) await DAO.DB.set('animation', data.animation || 'random');
        if (data.duration != null) await DAO.DB.set('AnimationDuration', data.duration || 1000);
    }

    async UpdateAppSettings(settings) {
        if (settings.EnableCloudIntegration != null) await DAO.CLOUD.set('isEnbCloudIntegrations', settings.EnableCloudIntegration);
        if (settings.EnabledKeyOverlay != null) await DAO.DB.set('isActivateOverlay', settings.EnabledKeyOverlay);
        if (settings.StartWithSystem != null) await DAO.DB.set('startWithSystem', settings.StartWithSystem);
        if (settings.EnabledKeysMacro != null) await DAO.DB.set('keyEvent', settings.EnabledKeysMacro);
        if (settings.NotificationsOnWindows != null) await DAO.DB.set('App_notification_windows', settings.NotificationsOnWindows);
        if (settings.AppMinimizeToBar != null) await DAO.DB.set('isMinimizeToBar', settings.AppMinimizeToBar);
    }

    async ListProgramsForRemote() {
        await DAO.GetDataNow();
        let data = {
            css: `:root {${await DAO.WEBDECK.get('exe-background') ? `\n--backgound-exe-item: ${await DAO.WEBDECK.get('exe-background')};` : ""}${await DAO.WEBDECK.get('exe-color-text') ? `--color-exe-item: ${await DAO.WEBDECK.get('exe-color-text')};\n` : ""}}`,
            windows: {
                volume: await loudness.getVolume(),
                muted: await loudness.getMuted(),
            },
            app: {
                version: app.getVersion(),
            },
            web: {
                formatView: await DAO.WEBDECK.get('format_view'),
                formatListView: await DAO.WEBDECK.get('format_list_view'),
                pages: await this.FormatListPagesToRemote(),
            },
            programs: await this.FormatListProgramsToRemote(),
        }
        return data;
    }

    async ListProgramsForLocal() {
        await DAO.GetDataNow();
        let data = {
            css: `:root {${await DAO.WEBDECK.get('exe-background') ? `\n--backgound-exe-item: ${await DAO.WEBDECK.get('exe-background')};` : ""}${await DAO.WEBDECK.get('exe-color-text') ? `--color-exe-item: ${await DAO.WEBDECK.get('exe-color-text')};\n` : ""}}`,
            windows: {
                volume: await loudness.getVolume(),
                muted: await loudness.getMuted(),
            },
            app: {
                version: app.getVersion(),
            },
            web: {
                formatView: await DAO.WEBDECK.get('format_view'),
                formatListView: await DAO.WEBDECK.get('format_list_view'),
                pages: DAO.WEBDECKDATA.pages,
            },
            programs: DAO.List_programs ? DAO.List_programs : [],
        }
        return data;
    }

    async FormatListPagesToRemote() {
        const List = await DAO.WEBDECK.get('pages');
        return List.map(element => {
            element.icon = path.basename(element.icon);
            return element;
        });
    }

    async FormatListProgramsToRemote() {
        let List = await DAO.ProgramsExe.get('list_programs');
        if (JSON.stringify(this.FormTListCRT.list) != JSON.stringify(List)) {
            this.FormTListCRT.list = DAO.ProgramsExe.get('list_programs');
            this.FormTListCRT.listPrograms = List.map(element => {
                element.icon = path.basename(element.icon);
                return element;
            });
        }

        return this.FormTListCRT.listPrograms;
    }

    async ConvetFileToBase64(filePath) {
        const fileBuffer = await fs.readFileSync(filePath);
        const fileObject = {
            name: path.basename(filePath),
            size: fileBuffer.length,
            type: 'application/octet-stream',
            data: await this.BufferToBlob(fileBuffer)
        };
        return fileObject;
    }

    async BufferToBlob(buffer) {
        return buffer.toString('base64');
    }

    async GetAppIconByUuid(uuid) {
        try {
            let list = await this.GetApps();
            let AppReturn = list.find(f => f.uuid == uuid || f._id == uuid);
            if (AppReturn && AppReturn.icon) {
                return {
                    uuid: uuid,
                    file: await this.ConvetFileToBase64(AppReturn.icon),
                };
            }
        } catch (error) { }
        return {
            uuid: uuid,
            data: null,
        };
    }

    async GetPageIconById(id) {
        try {
            const page = DAO.WEBDECKDATA.pages.find(f => f.id == id);
            if (page && page.icon) {
                return {
                    id: id,
                    file: await this.ConvetFileToBase64(page.icon),
                };
            }
        } catch (error) { }
        return {
            id: id,
            file: null,
        };
    }

    async GetWindowsVolume() {
        try {
            return await loudness.getVolume();
        } catch (error) {
            return false;
        }
    }

    async SetWindowsVolume(volume) {
        try {
            volume = parseInt(volume);
            if (volume > 0) {
                if (await loudness.getMuted()) {
                    await loudness.setMuted(false);
                }
                await loudness.setVolume(parseInt(volume));
            }
            else {
                await loudness.setMuted(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async ListAppThemes() {
        let themesLocal = await DAO.THEMES.get('local');
        let themesRemote = await DAO.THEMES.get('remote');
        if (!Array.isArray(themesLocal)) {
            themesLocal = [];
            await DAO.THEMES.set('local', themesLocal);
        }
        if (!Array.isArray(themesRemote)) {
            themesRemote = [];
            await DAO.THEMES.set('remote', themesRemote);
        }
        return themesLocal.concat(themesRemote);
    }

    async GetAppThemes() {
        let list = await this.ListAppThemes();
        let themeNow = await DAO.DB.get('bd_theme');
        return {
            list: list,
            animations: {
                enabled: await DAO.DB.get('isEnableAnimations') != null ? await DAO.DB.get('isEnableAnimations') : true,
                model: await DAO.DB.get('modelAnimation') || 'random',
                animation: await DAO.DB.get('animation') || 'random',
                duration: await DAO.DB.get('AnimationDuration') || 1000,
                list: require(path.join(BASE_PATHS.APP_PATH, "/Domain/Src/animations-list.json")).list
            },
            enabledAnimationsHover: await DAO.DB.get('isEnableAnimationsHover') || true,
            selected: list.find(t => t.tid == themeNow),
            idTheme: themeNow,
        };
    }

    async SetAppTheme(Theme) {
        let list = await this.ListAppThemes();
        if (Theme && Theme.tid && list.find(t => t.tid == Theme.tid)) {
            await DAO.DB.set('bd_theme', Theme.tid);
            return true;
        }
        else {
            await DAO.DB.set('bd_theme', Theme.tid);
        }
        return false;
    }

    async GetApps() {
        let list = await DAO.ProgramsExe.get('list_programs');
        if (!Array.isArray(list)) {
            list = new Array();
            await DAO.ProgramsExe.set('list_programs', []);
        }
        return list;
    }

    async AddApp(App) {
        let list = await this.GetApps();
        App.uuid = this.uuidv4();

        if (App.icon && fs.existsSync(App.icon)) {
            try {
                let dirToCopy = path.join(BASE_PATHS.ICONS_EXE, `${this.uuidv4()}${path.extname(App.icon)}`);
                await fs.copyFileSync(App.icon, dirToCopy);
                App.icon = dirToCopy;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

        App.pos = list.length + 1;
        list.push(App);
        await DAO.ProgramsExe.set('list_programs', list);
        return true;
    }

    async GetWebPages() {
        let list = await DAO.DB.get("web_page_saved");
        if (!Array.isArray(list)) list = new Array();
        return list;
    }

    async RemoveWebPage(Page) {
        let list = await this.GetWebPages();
        list = list.filter(item => item.id != Page.id);
        await DAO.DB.set('web_page_saved', list);
        return true;
    }

    async AddWebPage(Page) {
        let list = await this.GetWebPages();
        if (Page.name && Page.url) {
            let max_id = 0;
            list.forEach(i => { if (i.id > max_id) max_id = i.id; })
            Page.id = max_id + 1;
            list.push(Page);
            await DAO.DB.set('web_page_saved', list);
        }
        return true;
    }

    async GetKeysMacros() {
        let list = await DAO.List_macros.get('macros');
        if (!Array.isArray(list)) list = new Array();
        return list;
    }

    async AddKeyMacro(KeyMacroApp) {
        let list = await this.GetKeysMacros();
        if (KeyMacroApp.idProgram && Array.isArray(KeyMacroApp.keys)) {
            list = list.filter(item => item.idProgram != KeyMacroApp.idProgram);
            list.push(KeyMacroApp);
            list = list.map((item, index) => {
                item._id = index + 1;
                return item;
            });
            await DAO.List_macros.set('macros', list);
        }
        return true;
    }

    async DeleteKeyMacro(KeyMacroApp) {
        let list = await this.GetKeysMacros();
        if (KeyMacroApp.idProgram && Array.isArray(KeyMacroApp.keys)) {
            list = list.filter(item => item.idProgram != KeyMacroApp.idProgram);
            list = list.map((item, index) => {
                item._id = index + 1;
                return item;
            });
            await DAO.List_macros.set('macros', list);
        }
        return true;
    }

    async EditKeyMacro(KeyMacroApp) {
        let list = await this.GetKeysMacros();
        if (KeyMacroApp.idProgram && Array.isArray(KeyMacroApp.keys)) {
            list = list.map((item, index) => {
                if (item.idProgram == KeyMacroApp.idProgram) {
                    item = KeyMacroApp;
                }
                item._id = index + 1;
                return item;
            });
            await DAO.List_macros.set('macros', list);
        }
        return true;
    }

    async DeleteApp(App) {
        let list = await this.GetApps();
        if (App.uuid && App.icon && fs.existsSync(App.icon) && App.icon.includes(BASE_PATHS.ICONS_EXE)) {
            try {
                await fs.unlinkSync(App.icon);
            } catch (error) {
                console.log(error);
            }
        }
        list = list.filter(item => item.uuid != App.uuid);
        await DAO.ProgramsExe.set('list_programs', list);
        return true;
    }

    async EditApp(App) {
        let list = await this.GetApps();

        if (App.uuid) {
            let appInList = await list.find(f => f.uuid == App.uuid);
            if (appInList) {
                if (!App.icon || !fs.existsSync(App.icon)) return false;
                if (appInList.icon != App.icon) {
                    let dirToCopy;
                    try {
                        dirToCopy = path.join(BASE_PATHS.ICONS_EXE, `${this.uuidv4()}${path.extname(App.icon)}`);
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                    if (!dirToCopy) return false;
                    try {
                        await fs.copyFileSync(App.icon, dirToCopy);
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                    App.icon = dirToCopy;
                    if (appInList.icon && fs.existsSync(appInList.icon) && appInList.icon.includes(BASE_PATHS.ICONS_EXE)) {
                        try {
                            await fs.unlinkSync(appInList.icon);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                list = list.map(item => {
                    if (item.uuid == App.uuid) item = App;
                    return item;
                });
                await DAO.ProgramsExe.set('list_programs', list);
                return true;
            }
        }
        return true;
    }

    async UpdateObsData(DataObs) {
        if (DataObs) {
            await DAO.OBS.set('ObsWssStartOnApp', DataObs.ConnectToWebsocketOnStartup);
            await DAO.OBS.set('ObsWssConfigManual', DataObs.AutomaticallyDetectSettings);
            if (DataObs.Configs) {
                await DAO.OBS.set('ObsWssHost', DataObs.Configs.Host);
                await DAO.OBS.set('ObsWssPort', DataObs.Configs.Port);
                await DAO.OBS.set('ObsWssPassword', DataObs.Configs.Password);
            }
            return true;
        }
        return false;
    }

    async GetMyIPAddress() {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            if (devName.includes('Ethernet') || devName.includes('Wi-Fi') || devName.includes('Wi Fi') || devName.includes('WiFi')) {
                var iface = interfaces[devName];
                for (var i = 0; i < iface.length; i++) {
                    var alias = iface[i];
                    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                        return alias.address;
                }
            }
        }
        return '0.0.0.0';
    }

    async GetObsConfigs() {
        let configs = {
            ConnectToWebsocketOnStartup: await DAO.OBS.get('ObsWssStartOnApp'),
            AutomaticallyDetectSettings: await DAO.OBS.get('ObsWssConfigManual'),
            Configs: {
                Host: await DAO.OBS.get('ObsWssHost'),
                Port: await DAO.OBS.get('ObsWssPort'),
                Password: await DAO.OBS.get('ObsWssPassword')
            }
        };
        if (configs.AutomaticallyDetectSettings == true) {
            try {
                var pathOBS = path.join(process.env.APPDATA, 'obs-studio');
                var fileConfigOBSWS = path.join(pathOBS, 'plugin_config', 'obs-websocket', 'config.json');
                if (fs.existsSync(fileConfigOBSWS)) {
                    var config = JSON.parse(fs.readFileSync(fileConfigOBSWS, 'utf8'));
                    if (config) {
                        configs.Configs.Host = await this.GetMyIPAddress();
                        configs.Configs.Port = config.server_port;
                        configs.Configs.Password = config.server_password;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        return configs;
    }

    async UpdateWebDeckData(WebDeckData) {
        if (WebDeckData.WebDeck) {
            await DAO.WEBDECK.set('format_view', WebDeckData.WebDeck.FormatView);
            await DAO.WEBDECK.set('pages', WebDeckData.WebDeck.Pages || []);
            await DAO.WEBDECK.set('format_list_view', WebDeckData.WebDeck.FormatListView);
            await DAO.WEBDECK.set('exe-background', WebDeckData.WebDeck.Color.background || '#370179');
            await DAO.WEBDECK.set('exe-color-text', WebDeckData.WebDeck.Color.text || '#ffffff');
        }
        if(WebDeckData.Server){
            await DAO.DB.set('server_port', WebDeckData.Server.port);
        }
        return true
    }

    async GetWebDeckData() {
        return {
            FormatView: await DAO.WEBDECK.get('format_view'),
            Pages: await DAO.WEBDECK.get('pages'),
            FormatListView: await DAO.WEBDECK.get('format_list_view'),
            Color: {
                background: await DAO.WEBDECK.get('exe-background') || '#370179',
                text: await DAO.WEBDECK.get('exe-color-text') || '#ffffff',
            }
        }
    }

    async GetAllAppData() {
        var data = {
            AppPath: app.getAppPath(),
            AppName: app.getName(),
            AppVersion: app.getVersion(),
            Language: await TRANSLATOR.GetLang(),
            Languages: await TRANSLATOR.GetListLanguages(),
            Apps: await this.GetApps(),
            KeysMacros: await this.GetKeysMacros(),
            WebPages: await this.GetWebPages(),
            AppTheme: await this.GetAppThemes(),
            Obs: await this.GetObsConfigs(),
            WebDeck: await this.GetWebDeckData(),
            Settings: {
                EnableCloudIntegration: await DAO.CLOUD.get('isEnbCloudIntegrations'),
                EnabledKeyOverlay: await DAO.DB.get('isActivateOverlay'),
                StartWithSystem: await DAO.DB.get('startWithSystem'),
                EnabledKeysMacro: await DAO.DB.get('keyEvent'),
                NotificationsOnWindows: await DAO.DB.get('App_notification_windows'),
                AppMinimizeToBar: await DAO.DB.get('isMinimizeToBar'),
                AppAutoUpdate: await DAO.DB.get('AutoUpdateApp'),
                KeysOverlay: await DAO.DB.get('keys-overlay'),
                Server: {
                    port: !isNaN(await DAO.DB.get('server_port')) ? await DAO.DB.get('server_port') : 3000,
                    isStart: await DAO.DB.get('isStartLocalServer') ? true : false,
                }
            }
        };
        if (!Array.isArray(data.Apps)) {
            data.Apps = [];
            await DAO.ProgramsExe.set('list_programs', data.Apps);
        }
        if (!Array.isArray(data.KeysMacros)) {
            data.KeysMacros = [];
            await DAO.ProgramsExe.set('macros', data.KeysMacros);
        }
        if (!Array.isArray(data.WebPages)) {
            data.WebPages = [];
            await DAO.ProgramsExe.set('web_page_saved', data.WebPages);
        }
        let UpdateApps = false;
        data.Apps = data.Apps.map(item => {
            if (!item.icon) {
                UpdateApps = true;
                item.icon = item.iconCustom;
                delete item.iconCustom;
            }
            if (item.positon_l) {
                UpdateApps = true;
                item.pos = item.positon_l;
                delete item.positon_l;
            }
            if (item.type_exec) {
                UpdateApps = true;
                item.typeExec = item.type_exec;
                delete item.type_exec;
            };
            if (item._id) delete item._id;
            if (!item.uuid) {
                UpdateApps = true;
                item.uuid = this.uuidv4();
            }
            return item;
        });
        if (UpdateApps) {
            await DAO.ProgramsExe.set('list_programs', data.Apps);
        }
        return data;
    }

    async ExecutAppByUuid(Uuid) {
        let apps = await this.GetApps();
        let App = apps.find(a => a.uuid == Uuid);
        if (App) {
            return await this.ExecutApp(App);
        }
        return false;
    }

    async ExecSoundPad(data) {
        if (data && data.index) await this.ExecSoundpad(`DoPlaySound(${data.index})`);
    }

    async OpenUrlInBrowser(url) {
        try {
            let _url = new URL(url);
            exec(`start "" "${url}"`, () => { });
            return true;
        } catch (error) {
            return false;
        }
    }

    async ExecutApp(App) {
        try {
            if (App) {
                switch (App.typeExec) {

                    case 'Cmd':
                    case 'cmd':
                        if (App.path) exec(`${App.path}`, () => { });
                        break;

                    case 'WebPage':
                    case 'web_page':
                        this.OpenUrlInBrowser(App.path);
                        break;

                    case 'Exe':
                    case 'exe':
                        if (App.path) exec(`start "" "${App.path}"`, () => { });
                        break;

                    case 'Audio':
                    case 'audio':
                        if (App.path && fs.existsSync(App.path)) {
                            try {
                                if (typeof this.SendFrontDataCallback == 'function') await this.SendFrontDataCallback('PlayAudioByPath', App.path);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                        break;

                    case 'SoundpadAudio':
                    case 'soundpad_audio':
                        if (App.hash) {
                            switch (App.hash) {
                                case 'DoPlayCurrentSoundAgain':
                                    await this.ExecSoundpad(`DoPlayCurrentSoundAgain()`);
                                    break;

                                case 'DoStopSound':
                                    await this.ExecSoundpad(`DoStopSound()`);
                                    break;

                                case 'DoTogglePause':
                                    await this.ExecSoundpad(`DoTogglePause()`);
                                    break;

                                default:
                                    let ListSoundPad = await this.ListAudiosSoundPad();
                                    let soundP = ListSoundPad.find(f => f.hash == App.hash);
                                    if (soundP) await this.ExecSoundpad(`DoPlaySound(${soundP.index})`);
                                    break;
                            }
                        }
                        break;

                    case 'Discord':
                    case 'discord':
                        if (this.ClientDiscordService) {
                            switch (App.path) {

                                case 'toggle-mute-unmute-mic':
                                    this.ClientDiscordService.ToggleMute();
                                    break;

                                case 'toggle-mute-unmute-audio':
                                    this.ClientDiscordService.ToggleDeafen();
                                    break;

                                case 'mute-mic':
                                    this.ClientDiscordService.Mute();
                                    break;

                                case 'unmute-mic':
                                    this.ClientDiscordService.UnMute();
                                    break;

                                case 'mute-audio':
                                    this.ClientDiscordService.Deafen();
                                    break;

                                case 'unmute-audio':
                                    this.ClientDiscordService.UnDeafen();
                                    break;

                                default:
                                    console.log(App);
                                    break;
                            }
                        }
                        else {
                            console.log('Client Not Started')
                        }
                        break;

                    case 'OptionsOs':
                    case 'options_os':
                        if (App.path) {
                            try {
                                if (App.modifier) return robotjs.keyTap(App.path, App.modifier);
                                robotjs.keyTap(App.path);
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }
                        break;

                    case 'ObsWss':
                    case 'obs_wss':
                        if (!this.ObsService || !this.ObsService.IsConnected || typeof this.ProcessObsEvents != 'function') {
                            return false;
                        }
                        switch (App.obsOption) {

                            case 'scene':
                                let DataScenes = await this.ObsService.ListAllScenes();
                                if (!Array.isArray(DataScenes.scenes)) DataScenes = { scenes: [] };
                                let scene = DataScenes.scenes.find(f => f.sceneUuid == App.obsAction);
                                if (scene) {
                                    this.ProcessObsEvents({ stage: 'select_scene', sceneName: scene.sceneName, id: scene.sceneUuid })
                                }
                                break;

                            case 'audio':
                                let DataAudios = await this.ObsService.GetInputList();
                                if (!Array.isArray(DataAudios.inputs)) DataAudios = { inputs: [] };
                                let audio = DataAudios.inputs.find(f => f.inputUuid == App.obsAction);
                                if (audio) {
                                    if (DAO.OBS.get(`input_muted-${audio.inputUuid}`) == true) {
                                        await DAO.OBS.set(`input_muted-${audio.inputUuid}`, false);
                                    }
                                    else {
                                        await DAO.OBS.set(`input_muted-${audio.inputUuid}`, true);
                                    }
                                    this.ProcessObsEvents({ stage: 'MuteInputAudio', notify: false, inputMuted: await DAO.OBS.get(`input_muted-${audio.inputUuid}`), inputName: audio.inputName, inputUuid: audio.inputUuid })
                                }
                                break;

                            case 'options':
                            case 'obs_options':
                                this.ProcessObsEvents({ stage: App.obsAction, notify: false });
                                break;

                            default:
                                break;
                        }
                        break;

                    default:
                        console.log(App);
                        break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async ExecSoundpad(command) {
        let pathSoundPadExe = await DAO.DB.get('pathSoundPad');
        if (await fs.existsSync(pathSoundPadExe)) await exec(`${pathSoundPadExe} -rc ${command}`, (e) => { });
    }

    async GetSoundPadPath() {
        return await DAO.DB.get('pathSoundPad') || '';
    }

    async ListAudiosSoundPad() {
        return new Promise(async (resolve) => {
            var SoundPadPathFileXml = path.join(process.env.APPDATA, 'Leppsoft', 'soundlist.spl');
            try {
                if (fs.existsSync(SoundPadPathFileXml)) {
                    var xml = await fs.readFileSync(SoundPadPathFileXml, 'utf8');
                    var result = convert.xml2json(xml, { compact: true, spaces: 4 });
                    var json = JSON.parse(result), cont = 0;
                    var soundList = json.Soundlist.Sound.map(sound => {
                        cont++;
                        return {
                            index: cont,
                            addedOn: sound._attributes.addedOn,
                            artist: sound._attributes.artist,
                            name: sound._attributes.title,
                            duration: sound._attributes.duration,
                            hash: sound._attributes.hash,
                            path: sound._attributes.url,
                        }
                    });
                    resolve(soundList);
                }
            } catch (error) { }
            resolve([]);
        });
    }

    async UpdateSoundPadPath(filePath) {
        return await DAO.DB.set('pathSoundPad', filePath);
    }

    async UpdateAppsPositions(listPositions) {
        if (Array.isArray(listPositions)) {
            let listApps = await this.GetApps();
            listApps = listApps.map(App => {
                var dtr = listPositions.find(f => f.uuid == App.uuid);
                if (dtr && dtr.pos) App.pos = dtr.pos;
                return App;
            });
            await DAO.ProgramsExe.set('list_programs', listApps.sort(function (a, b) { if (a.pos < b.pos) { return -1; } if (a.pos > b.pos) { return 1; } return 0; }));
        }
        return await this.GetApps();
    }

    async SerializeSynchronizedConfig(data, callback) {

        if (Array.isArray(data.dataSynchronized)) {
            let DataConverted = [];
            let AppsIconsToUpdate = [];
            let PageIconsToUpdate = [];
            for (const dtr of data.dataSynchronized) {
                let convertedValue = {};
                let convertedFiles = [];
                try { convertedValue = await JSON.parse(dtr.value); } catch (error) { }
                try { convertedFiles = await JSON.parse(dtr.json_files_cloud); } catch (error) { }
                delete dtr.json_files_cloud;
                delete dtr.value;
                await DataConverted.push({
                    ...dtr,
                    data: convertedValue,
                    files: convertedFiles
                });
            }

            const totalItems = DataConverted.length;
            for (let i = 0; i < totalItems; i++) {
                let dto = DataConverted[i];

                if (dto.key.includes('WEBDECK.json') || dto.key.includes('ProgramsExe.json')) {
                    for (const dtoF of dto.files) {
                        if ((dtoF.type === "APPSUD" || dtoF.type === "IWUD") && Array.isArray(dtoF.files)) {
                            const totalFiles = dtoF.files.length;
                            for (let j = 0; j < totalFiles; j++) {
                                const fileDtata = dtoF.files[j];
                                const isApp = dtoF.type === "APPSUD" && dto.key.includes('ProgramsExe.json');
                                const isWebDeck = dtoF.type === "IWUD" && dto.key.includes('WEBDECK.json');
                                let dirFIle = path.join(BASE_PATHS.APP_PATH, "/Domain/src/img/underbot_logo.png"); // Default Icon
                                let downloadFile = false;

                                // Calcula a porcentagem de progresso combinada
                                const basePercent = (i / totalItems) * 100;
                                const fileProgress = totalFiles > 0 ? ((j + 1) / totalFiles) * (100 / totalItems) : 0;
                                const overallProgress = Math.min(basePercent + fileProgress, 100);
                                if (typeof this.SendFrontDataCallback === 'function') {
                                    this.SendFrontDataCallback('PercentageProgressUpdateSettings', { percentage: overallProgress, html: `${parseInt(overallProgress)}%` });
                                }

                                if (fileDtata.url) {
                                    if (isApp) {
                                        dirFIle = path.join(BASE_PATHS.ICONS_EXE, `${fileDtata.fileName}`);
                                        downloadFile = true;
                                    } else if (isWebDeck) {
                                        dirFIle = path.join(BASE_PATHS.ICONS_WEBPAGES, `${fileDtata.fileName}`);
                                        downloadFile = true;
                                    }

                                    if (downloadFile) {
                                        try {
                                            const response = await axios.get(fileDtata.url, { responseType: 'arraybuffer' });
                                            if (response.status === 200) {
                                                await fs.promises.writeFile(dirFIle, response.data);
                                            } else {
                                                // Se o download falhar (ex: status 404), usa o ícone padrão
                                                dirFIle = path.join(BASE_PATHS.APP_PATH, "/Domain/src/img/underbot_logo.png");
                                            }
                                        } catch (error) {
                                            console.error(`Falha ao baixar o ícone: ${fileDtata.url}`, error);
                                            dirFIle = path.join(BASE_PATHS.APP_PATH, "/Domain/src/img/underbot_logo.png");
                                        }
                                    }
                                }

                                if (isApp && dto.data.list_programs) {
                                    AppsIconsToUpdate = AppsIconsToUpdate.filter(item => item.uuid !== fileDtata.uuid);
                                    AppsIconsToUpdate.push({
                                        uuid: fileDtata.uuid,
                                        icon: dirFIle
                                    });
                                } else if (isWebDeck && dto.data.pages) {
                                    PageIconsToUpdate = PageIconsToUpdate.filter(item => item.id !== fileDtata.id);
                                    PageIconsToUpdate.push({
                                        id: fileDtata.id,
                                        icon: dirFIle
                                    })
                                }
                            }
                        }
                    }
                    if (dto.data.list_programs) {
                        dto.data.list_programs = dto.data.list_programs.map(item => {
                            let iToUp = AppsIconsToUpdate.find(f => f.uuid === item.uuid);
                            if (iToUp) {
                                item.icon = iToUp.icon;
                            }
                            if (item.icon === 'underbot_logo.png') {
                                item.icon = path.join(BASE_PATHS.APP_PATH, "/Domain/src/img/underbot_logo.png");
                            }
                            return item;
                        });
                    }
                    if (dto.data.pages) {
                        dto.data.pages = dto.data.pages.map(item => {
                            let iToUp = PageIconsToUpdate.find(f => f.id === item.id);
                            if (iToUp) {
                                item.icon = iToUp.icon;
                            }
                            return item;
                        });
                    }
                }

                // Garante que a porcentagem chegue a 100% no final do item
                const finalPercent = ((i + 1) / totalItems) * 100;
                if (typeof this.SendFrontDataCallback === 'function') {
                    this.SendFrontDataCallback('PercentageProgressUpdateSettings', { percentage: finalPercent, html: `${parseInt(finalPercent)}%` });
                }

                const filePath = path.join(BASE_PATHS.UN_DATA, dto.path, dto.key);
                await fs.promises.writeFile(filePath, JSON.stringify(dto.data, null, 2));
                await new Promise(resolve => setTimeout(resolve, 250));
            }
            callback();
        }
        else {
            callback();
        }
    }

    async SerializeFromLocalFile(data, callback) {
        const totalItems = data.length;

        for (let i = 0; i < totalItems; i++) {
            const itemNow = data[i];
            try {
                const bufferFile = Buffer.from(itemNow.data, 'base64');
                const baseDataPath = path.join(DAO.DB_DIR, 'UN-DATA');
                const directoryPath = path.join(baseDataPath, ...itemNow.paths);
                const filePath = path.join(directoryPath, itemNow.fileName);

                // Cria o diretório de forma assíncrona e recursiva, se não existir.
                await fs.promises.mkdir(directoryPath, { recursive: true });

                // Escreve o arquivo de forma assíncrona.
                await fs.promises.writeFile(filePath, bufferFile);

            } catch (error) {
                console.error(`Falha ao processar o arquivo local: ${itemNow.fileName}`, error);
                // Continua para o próximo item mesmo se um falhar.
            }

            // Atualiza a barra de progresso após cada item.
            const percent = ((i + 1) / totalItems) * 100;
            if (typeof this.SendFrontDataCallback === 'function') {
                this.SendFrontDataCallback('PercentageProgressUpdateSettings', { percentage: percent, html: `${parseInt(percent)}%` });
            }
        }

        // Chama o callback no final, quando tudo estiver concluído.
        callback(true);
    }

    async ExecMacro(Macro) {
        switch (Macro.type) {
            case 'APP':
                if (Macro.idProgram) {
                    let listApps = await this.GetApps();
                    let App = listApps.find(f => f.uuid == Macro.idProgram);
                    if (App) await this.ExecutApp(App);
                }
                break;

            default:
                console.log(Macro);
                break;
        }
    }
}

module.exports = ServiceUnderDeck;