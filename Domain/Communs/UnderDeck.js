const fs = require('fs');
const path = require('path');
const { app } = require("electron");
const loudness = require("loudness");
var FormTListCRT = { list: new Array(), listPrograms: new Array() };

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

module.exports = {
    GetWindowsVolume,
    SetWindowsVolume,
    GetAppIconByUuid,
    GetPageIconById,
    ConvetFileToBase64,
    BufferToBlob,
    ListProgramsForRemote,
    FormatListProgramsToRemote,
}