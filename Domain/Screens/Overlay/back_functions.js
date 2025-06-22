const { ipcRenderer } = require("electron");

const BACKEND = {
  Update_lang: async (lang) => {
    return await ipcRenderer.invoke('update_lang', lang);
  },
  Send: async (type, data) => {
    return ipcRenderer.invoke(type, data);
  }
}

ipcRenderer.on('OV-Update-data', (events, data) => {
  console.log(data);
  switch (data.type) {
    case 'soundpad':
      ListSoundPad = data.data;
      ChangeListSoundPad();
    break;

    case 'apps':
      ChangeListAllApps();
    break;
  
    default:
    break;
  }
});