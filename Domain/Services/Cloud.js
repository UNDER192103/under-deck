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
        filesToUpload.push({ 
            type: 'APPSUD',
            files: DAO.List_programs.filter(e => e.icon && fs.existsSync(e.icon) && !e.icon.includes('underbot_logo.png')).map(e => {
                return {
                    ...e,
                    dirFile: e.icon,
                    fileName: path.basename(e.icon)
                }
            })
        });
        filesToUpload.push({
            type: 'IWUD',
            files: DAO.WEBDECKDATA.pages.filter(e => e.icon && fs.existsSync(e.icon) && !e.icon.includes('underbot_logo.png')).map(e => {
                return {
                    ...e,
                    dirFile: e.icon,
                    fileName: path.basename(e.icon)
                }
            })
        });
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
                        // Não é mais necessário modificar o caminho do ícone aqui.
                        // O caminho completo será preservado.
                    }
                    else if(data.pages){
                        data.pages = data.pages.map(e => {
                            if(e.OldIcon) delete e.OldIcon; // Mantém a limpeza de dados antigos
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