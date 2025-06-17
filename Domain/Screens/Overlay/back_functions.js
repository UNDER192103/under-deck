const { ipcRenderer } = require("electron");

const BACKEND = {
  Update_lang: async (lang) => {
    return await ipcRenderer.invoke('update_lang', lang);
  },
  Send: async (type, data) => {
    return ipcRenderer.invoke(type, data);
  }
}