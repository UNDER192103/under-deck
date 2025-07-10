ipcRenderer.on('OV-Update-data', (events, data) => {
  switch (data.type) {
    case 'soundpad':
      ListSoundPad = data.data;
      ChangeListSoundPad();
    break;

    case 'apps':
      ChangeListAllApps();
    break;

    case 'webpages':
      ChangeListWebPages();
    break;

    case 'obsstudio':
      console.log(data.data);
      ChangeListObsStudio(null, data.data);
    break;
  
    default:
    break;
  }
});