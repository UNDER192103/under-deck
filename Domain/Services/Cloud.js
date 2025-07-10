const API = require('../../Repository/Api');
const Commun = require('../../Domain/Communs/Commun');
const path = require('path');
const { app } = require('electron');
const fs = require("fs");
const BasePath = app.getPath('userData');
const BasePathData = path.join(BasePath, 'UN-DATA');
const BasePathDataDB = path.join(BasePathData, 'DB');
const BasePathDataIcons = path.join(BasePathData, 'icons-exe');
const BasePathDataIconsWebPages = path.join(BasePathData, 'icons-webpages');
const BasePathDataThemes = path.join(BasePathData, 'themes');

const GetJsonDataUpload = async (USER) => {
    return new Promise(async (resolve) => {
        Commun.ListAllFilesInFolder(BasePathDataDB).then((listFilesDB) => {
            let Itens = [];
            listFilesDB.forEach(async FilePath => {
                let splitFpath = FilePath.replaceAll('/', '\\').split('\\');
                let nameFile = splitFpath[splitFpath.length - 1];
                let nameSplit = nameFile.split('.');
                let typeFile = nameSplit[nameSplit.length - 1];
                let data = fs.readFileSync(FilePath, 'utf8');

                data = data.replaceAll(BasePathDataIcons, '{{{appdata-icons-exe-path}}}');
                data = data.replaceAll(BasePathDataIconsWebPages, '{{{appdata-icons-webpages-path}}}');
                data = data.replaceAll(BasePathDataThemes, '{{{appdata-themes-path}}}');
                data = data.replaceAll(BasePathDataDB, '{{{appdata-db-path}}}');
                data = data.replaceAll(BasePathData, '{{{appdata-un-data-path}}}');

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

                if (FilePath == listFilesDB[listFilesDB.length - 1]) {
                    resolve(JSON.stringify(Itens));
                }
            });
        });
    });
}

module.exports = {
    SyncUserData: async (USER, _lang) => {
        return new Promise(async (resolve, reject) => {
            GetJsonDataUpload(USER).then((Json) => {
                try {
                    API.Cloud.post('', {
                        _lang: _lang ? _lang : 'en_us',
                        method: 'to-sync-data',
                        client_id: USER.client_id,
                        token: USER.token,
                        json: Json,
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