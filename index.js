require('dotenv').config({ path: './Repository/.env' });
const DfaultCommun = require('./Domain/Communs/Default.js');
const { app } = require('electron');

app.whenReady().then(async () => {
    await DfaultCommun.CheckEssentialFiles();
    console.log('App is ready');
    require('./Domain/Communs/GlobalsFuncs.js');
    require('./App/App.js');
});