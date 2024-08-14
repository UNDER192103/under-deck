const { ipcRenderer } = require("electron");
const { events } = require("lepikevents");

const BACKEND = {
  Update_lang: async (lang)=>{
    return await ipcRenderer.invoke('update_lang', lang);
  },
  New_window: async (data)=>{
    return await ipcRenderer.invoke('new_window', data);
  }
}

//Functions
ipcRenderer.on('selectMenu', (events, dt)=>{
  if(selectMenu){
    selectMenu(dt)
  }
});