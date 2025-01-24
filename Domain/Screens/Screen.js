const { app, BrowserWindow} = require('electron');
const path = require("path");
var Windows = {};

const New = async (data) =>{
  if(Windows[data.name] == null){
    Windows[data.name] = new BrowserWindow({
      title: `${app.getName()} - ${data.name}`,
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        devTools: true
      }
    });
    Windows[data.name].maximize();
    Windows[data.name].loadURL(data.url);
    Windows[data.name].show();
    Windows[data.name].on('closed', async function(){
      delete Windows[data.name];
    });
  }
  else{
    await Windows[data.name].show();
  }
}

const Close = async (NameWindow) => {
  if(Windows[NameWindow] == null) return null;

  try{ await Windows[NameWindow].close() }catch(error){ return false };

  return true;
}

module.exports = {
  New,
  Close
}