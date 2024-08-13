const { ipcRenderer } = require("electron");
const { events } = require("lepikevents");

const BACKEND = {
  Update_lang: (lang)=>{
    return ipcRenderer.postMessage('update_lang', lang);
  },
  New_window: (data)=>{
    return ipcRenderer.postMessage('new_window', data);
  }
}

//Functions
ipcRenderer.on('selectMenu', (events, dt)=>{
  if(selectMenu){
    selectMenu(dt)
  }
});