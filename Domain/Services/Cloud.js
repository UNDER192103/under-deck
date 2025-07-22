const DAO = require('../../Repository/DB');
const API = require('../../Repository/Api');
const FormData = require('form-data');
const Commun = require('../../Domain/Communs/Commun');
const path = require('path');
const { app } = require('electron');
const fs = require("fs");
const { url } = require('inspector');
const { type } = require('os');
const BasePath = app.getPath('userData');
const BasePathData = path.join(BasePath, 'UN-DATA');
const BasePathDataDB = path.join(BasePathData, 'DB');
const BasePathDataIcons = path.join(BasePathData, 'icons-exe');
const BasePathDataIconsWebPages = path.join(BasePathData, 'icons-webpages');
const BasePathDataThemes = path.join(BasePathData, 'themes');

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

const UploadFiles = async (USER, FilesToUpload, callBackpercent = null) => {
    return new Promise(async (resolve) => {
        if(FilesToUpload.length > 0){
            let countTotalFiles = 0, countUploadedFiles = 0;
            FilesToUpload.forEach(Item => {
                countTotalFiles += Item.files.length;
            });
            let storage_id = null;
            for (let index1 = 0; index1 < FilesToUpload.length; index1++) {
                const Item = FilesToUpload[index1];
                var filesUploadeds = new Object();
                if(Item.files.length > 0){
                    for (let index2 = 0; index2 < Item.files.length; index2++) {
                        const DataItem = Item.files[index2];
                        if(!filesUploadeds[DataItem.dirFile]){
                            var formData = new FormData();
                            const fileName = path.basename(DataItem.dirFile);
                            formData.append('file', fs.createReadStream(DataItem.dirFile), fileName);
                            formData.append('method', 'upload--file-to-cloud');
                            formData.append('client_id', USER.client_id);
                            formData.append('token', USER.token);
                            if(storage_id){
                                formData.append('storage_id', storage_id);
                            }
                            try {
                                var result = await API.Cloud.post('', formData, {
                                    headers: {
                                        ...formData.getHeaders(),
                                    },
                                    maxBodyLength: Infinity,
                                    maxContentLength: Infinity,
                                });

                                if(result.data && result.data.url){
                                    if(result.data.storage_id) storage_id = result.data.storage_id;
                                    filesUploadeds[DataItem.dirFile] = result.data.url;
                                    Item.files[index2].url = result.data.url;
                                }
                                else{
                                    delete Item.files[index2];
                                }
                            } catch (error) {
                                delete FilesToUpload[index1];
                            }
                        }
                        else{
                            Item.files[index2].url = filesUploadeds[DataItem.dirFile];
                        }

                        if(callBackpercent){
                            countUploadedFiles++;
                            let percent1 = Math.round((index1 + 1) / FilesToUpload.length * 100);
                            let percent2 = Math.round((countUploadedFiles + 1) / countTotalFiles * 100);
                            callBackpercent({
                                percent: parseFloat(percent2) > 100 ? 100 : parseFloat(percent2),
                                pos1: index1,
                                posMax1: FilesToUpload.length,
                                pos2: index2,
                                posMax2: Item.files.length,
                            });
                        }
                    }
                }
                FilesToUpload[index1] = Item;
            }
            resolve(FilesToUpload);
        }
        else{
            resolve(FilesToUpload);
        }
    })
}

module.exports = {
    SyncUserData: async (USER, _lang, callback = null) => {
        return new Promise(async (resolve, reject) => {
            GetDataToUpload().then(Data => {
                UploadFiles(USER, Data.FilesToUpload, callback).then((DataFiles)=>{
                    API.Cloud.post('', {
                        _lang: _lang ? _lang : 'en_us',
                        method: 'to-sync-data',
                        client_id: USER.client_id,
                        token: USER.token,
                        json: JSON.stringify(Data.Itens),
                        jsonFilesCloud: JSON.stringify(DataFiles),
                    }).then(async (res) => {
                        resolve(res.data);
                    }).catch(error => {
                        if (reject)
                            reject(error);
                        else
                            resolve(null, error);
                    });
                });
            });
        })
    },
    GETSynchronizedData: async (USER, _lang) => {
        return new Promise(async (resolve, reject) => {
            try {
                API.Cloud.post('', {
                    _lang: _lang ? _lang : 'en_us',
                    method: 'get-synchronized-data',
                    client_id: USER.client_id,
                    token: USER.token,
                }).then(async (res) => {
                    resolve(res.data);
                }).catch(error => {
                    if (reject)
                        reject(error);
                    else
                        resolve(null, error);
                });
            } catch (error) {
                if (reject)
                    reject(error);
                else
                    resolve(null, error);
            }
        })
    },
    ClearCloudSynchronized: async (USER, _lang) => {
        return new Promise(async (resolve, reject) => {
            try {
                API.Cloud.post('', {
                    _lang: _lang ? _lang : 'en_us',
                    method: 'clear-synchronized-data',
                    client_id: USER.client_id,
                    token: USER.token,
                }).then(async (res) => {
                    resolve(res.data);
                }).catch(error => {
                    if (reject)
                        reject(error);
                    else
                        resolve(null, error);
                });
            } catch (error) {
                if (reject)
                    reject(error);
                else
                    resolve(null, error);
            }
        })
    },
}