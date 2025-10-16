const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function ListAllFilesInFolder(diretorio, arquivos) {
    if (!arquivos) arquivos = [];
    let listaDeArquivos = await fsPromises.readdir(diretorio);
    for (let k in listaDeArquivos) {
        let stat = await fsPromises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await ListAllFilesInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '\\' + listaDeArquivos[k]);
    }
    return arquivos;
}

module.exports = {
    ListAllFilesInFolder,
}