const DfaultCommun = require('./Domain/Communs/Default.js');
const { app } = require('electron');
require('dotenv').config({ path: `${app.getAppPath()}/Repository/.env` });

app.whenReady().then(async () => {
    await DfaultCommun.CheckEssentialFiles();
    console.log('App is ready');
    require('./Domain/Communs/GlobalsFuncs.js');
    require('./App/App.js');
});