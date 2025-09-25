const DfaultCommun = require('./Domain/Communs/Default.js');
const { app } = require('electron');
require('dotenv').config({ path: `${app.getAppPath()}/Repository/.env` });

app.whenReady().then(async () => {
    await DfaultCommun.CheckEssentialFiles();
    require('./Domain/Communs/GlobalsFuncs.js');
    require('./App/App.js');
});