const { ipcRenderer } = require("electron");
const BACKEND = {
  Update_lang: async (lang) => {
    return await ipcRenderer.invoke('update_lang', lang);
  },
  New_window: async (data) => {
    return await ipcRenderer.invoke('new_window', data);
  },
  Send: async (type, data) => {
    return ipcRenderer.invoke(type, data);
  }
}