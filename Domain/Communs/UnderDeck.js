const fs = require('fs');
const path = require('path');
const { app } = require("electron");
const loudness = require("loudness");
const { del } = require('superagent');
var FormTListCRT = { list: new Array(), listPrograms: new Array() };

function uuidv4() { return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16) ); }

const ListProgramsForRemote = async () => {
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
            pages: await FormatListPagesToRemote(),
        },
        programs: await FormatListProgramsToRemote(),
    }
    return data;
}

const ListProgramsForLocal = async () => {
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

const FormatListPagesToRemote = async () => {
    const List = await DAO.WEBDECK.get('pages');
    return List.map(element => {
        let split = element.icon.split('\\');
        element.icon = split[split.length - 1];
        return element;
    });
}

const FormatListProgramsToRemote = async () => {
    let List = await DAO.ProgramsExe.get('list_programs');
    if (JSON.stringify(FormTListCRT.list) != JSON.stringify(List)) {
        FormTListCRT.list = DAO.ProgramsExe.get('list_programs');
        FormTListCRT.listPrograms = List.map(element => {
            let split = element.iconCustom.split('\\');
            element.iconCustom = split[split.length - 1];
            return element;
        });
    }

    return FormTListCRT.listPrograms;
}

async function ConvetFileToBase64(filePath) {
    const fileBuffer = await fs.readFileSync(filePath);
    const fileObject = {
        name: path.basename(filePath),
        size: fileBuffer.length,
        type: 'application/octet-stream',
        data: await BufferToBlob(fileBuffer)
    };
    return fileObject;
}

async function BufferToBlob(buffer) {
    return buffer.toString('base64');
}

async function GetAppIconByUuid(uuid) {
    try {
        let list = await DAO.ProgramsExe.get('list_programs');
        if(!Array.isArray(list)) list = new Array();
        let AppReturn = list.find(f => f.uuid == uuid || f._id == uuid);
        if (AppReturn && AppReturn.iconCustom) {
            return {
                uuid: uuid,
                file: await ConvetFileToBase64(AppReturn.iconCustom),
            };
        }
    } catch (error) { }
    return {
        uuid: uuid,
        data: null,
    };
}

async function GetPageIconById(id) {
    try {
        const page = DAO.WEBDECKDATA.pages.find(f => f.id == id);
        if (page && page.icon) {
            return {
                id: id,
                file: await ConvetFileToBase64(page.icon),
            };
        }
    } catch (error) { }
    return {
        id: id,
        file: null,
    };
}

async function GetWindowsVolume() {
    try {
      return await loudness.getVolume();
    } catch (error) {
      return false;
    }
}

async function SetWindowsVolume(volume) {
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

async function ListAppThemes() {
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

async function GetAppThemes() {
    let list = await ListAppThemes();
    let themeNow = await DAO.DB.get('bd_theme');
    return {
        list: list,
        animations: {
            enabled: await DAO.DB.get('isEnableAnimations') || true,
            model: await DAO.DB.get('modelAnimation') || 'random',
            animation: await DAO.DB.get('animation') || 'random',
            duration: await DAO.DB.get('AnimationDuration') || 1000,
        },
        enabledAnimationsHover: await DAO.DB.get('isEnableAnimationsHover') || true,
        selected: list.find(t => t.tid == themeNow),
    };
}

async function SetAppTheme(Theme) {
    let list = await ListAppThemes();
    if(Theme && Theme.tid && list.find(t => t.tid == Theme.tid)){
        await DAO.DB.set('bd_theme', Theme.tid);
        return true;
    }
    return false;
}

async function GetAllAppData() {
    var data = {
        AppPath: app.getAppPath(),
        AppName: app.getName(),
        AppVersion: app.getVersion(),
        Language: await TRANSLATOR.GetLang(),
        Languages: await TRANSLATOR.GetListLanguages(),
        Apps: await DAO.ProgramsExe.get('list_programs'),
        KeysMacros: await DAO.List_macros.get('macros'),
        WebPages: await DAO.DB.get("web_page_saved"),
        AppTheme: await GetAppThemes(),
        Settings: {
            EnableCloudIntegration: await DAO.CLOUD.get('isEnbCloudIntegrations'),
            EnabledKeyOverlay: await DAO.DB.get('isActivateOverlay'),
            StartWithSystem: await DAO.DB.get('startWithSystem'),
            EnabledKeysMacro: await DAO.DB.get('keyEvent'),
            NotificationsOnWindows: await DAO.DB.get('App_notification_windows'),
            AppMinimizeToBar: await DAO.DB.get('isMinimizeToBar'),
            AppAutoUpdate: await DAO.DB.get('AutoUpdateApp'),
        }
    };
    if(!Array.isArray(data.Apps)){
        data.Apps = [];
        await DAO.ProgramsExe.set('list_programs', data.Apps);
    }
    if(!Array.isArray(data.KeysMacros)){
        data.KeysMacros = [];
        await DAO.ProgramsExe.set('macros', data.KeysMacros);
    }
    if(!Array.isArray(data.WebPages)){
        data.WebPages = [];
        await DAO.ProgramsExe.set('web_page_saved', data.WebPages);
    }
    let UpdateApps = false;
    data.Apps = data.Apps.map(item => {
        if(!item.icon){
            UpdateApps = true;
            item.icon = item.iconCustom;
            delete item.iconCustom;
        }
        if(item.positon_l) {
            UpdateApps = true;
            item.pos = item.positon_l;
            delete item.positon_l;
        }
        if(item.type_exec) {
            UpdateApps = true;
            item.typeExec = item.type_exec;
            delete item.type_exec;
        };
        if(item._id) delete item._id;
        if(!item.uuid){
            UpdateApps = true;
            item.uuid = uuidv4();
        }
        return item;
    });
    if(UpdateApps){
        await DAO.ProgramsExe.set('list_programs', data.Apps);
    }
    return data;
}

module.exports = {
    uuidv4,
    GetAllAppData,
    SetAppTheme,
    GetAppThemes,
    ListProgramsForLocal,
    GetWindowsVolume,
    SetWindowsVolume,
    GetAppIconByUuid,
    GetPageIconById,
    ConvetFileToBase64,
    BufferToBlob,
    ListProgramsForRemote,
    FormatListProgramsToRemote,
    Executation: {
        ExecutApp: (uuid) => {
            
        }
    }
}