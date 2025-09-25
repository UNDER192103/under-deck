const DAO = require('../../Repository/DB.js');
const Commun = require('../../Domain/Communs/Commun.js');
const path = require('path');
const { app } = require('electron');
const fs = require("fs");
const BasePath = app.getPath('userData');
const BasePathData = path.join(BasePath, 'UN-DATA');
const BasePathDataDB = path.join(BasePathData, 'DB');

const GetDataToUpload = async () => {
    return new Promise(async (resolve) => {
        await DAO.GetData();
        var filesToUpload = new Array();
        filesToUpload.push({ type: 'APPSUD', files: DAO.List_programs.map(e => { return { _id: e._id, positon_l: e.positon_l, url: '', dirFile: e.iconCustom, fileName: e.iconCustom.replaceAll('/', '\\').split('\\')[e.iconCustom.replaceAll('/', '\\').split('\\').length - 1] }} )});
        filesToUpload.push({ type: 'IWUD', files: DAO.WEBDECKDATA.pages.map(e => { return { id: e.id, url: '', dirFile: e.icon, fileName: e.icon.replaceAll('/', '\\').split('\\')[e.icon.replaceAll('/', '\\').split('\\').length - 1] }} ) });
        Commun.ListAllFilesInFolder(BasePathDataDB).then((listFilesDB) => {
            let Itens = [];
            listFilesDB.forEach(async FilePath => {
                let splitFpath = FilePath.replaceAll('/', '\\').split('\\');
                let nameFile = splitFpath[splitFpath.length - 1];
                let nameSplit = nameFile.split('.');
                let typeFile = nameSplit[nameSplit.length - 1], data = null;
                try {
                    data = JSON.parse(fs.readFileSync(FilePath, 'utf8'));
                    if(data.list_programs){
                        data.list_programs = data.list_programs.map(e => {
                            e.iconCustom = e.iconCustom.replaceAll('/', '\\').split('\\')[e.iconCustom.replaceAll('/', '\\').split('\\').length - 1];
                            return e;
                        });
                    }
                    else if(data.pages){
                        data.pages = data.pages.map(e => {
                            if(e.OldIcon) delete e.OldIcon;
                            e.icon = e.icon.replaceAll('/', '\\').split('\\')[e.icon.replaceAll('/', '\\').split('\\').length - 1];
                            return e;
                        });
                    }
                    data = JSON.stringify(data);
                } catch (error) {
                    data = '';
                }
                if(data){
                    Itens.push(
                        {
                            identifier: "UnderDeck-DBS",
                            name: nameFile,
                            size: fs.statSync(FilePath).size,
                            date: fs.statSync(FilePath).birthtime,
                            type: typeFile,
                            data: data,
                        }
                    );
                }
                
                if (FilePath == listFilesDB[listFilesDB.length - 1]) {
                    resolve({FilesToUpload: filesToUpload, Itens: Itens});
                }
            });
        });
    });
}

module.exports = {
    GetDataToUpload
}