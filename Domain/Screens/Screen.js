const { app, BrowserWindow} = require('electron');
var Windows = {};

const New = async (NameWindow) =>{
    if(Windows[NameWindow] == null){
      Windows[NameWindow] = new BrowserWindow({
        title: `${app.getName()} - ${NameWindow}`,
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: path.join(app.getAppPath(), 'Domain', 'src', 'img', 'under-icon-256x.ico'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: false,
          devTools: false
        }
      });
      Windows[NameWindow].maximize();
      Windows[NameWindow].loadURL(data.url);
      Windows[NameWindow].show();
      Windows[NameWindow].on('closed', async function(){
        delete Windows[NameWindow];
      });
    }
    else{
      await Windows[NameWindow].show();
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