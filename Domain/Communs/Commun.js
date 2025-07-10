const fs = require('fs');
var convert = require('xml-js');
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

const ListAudiosSoundPad = async () => {
    return new Promise(async (resolve) => {
      var SoundPadPathFileXml = path.join(process.env.APPDATA, 'Leppsoft', 'soundlist.spl');
      try {
          if (fs.existsSync(SoundPadPathFileXml)) {
              var xml = await fs.readFileSync(SoundPadPathFileXml, 'utf8');
              var result = convert.xml2json(xml, { compact: true, spaces: 4 });
              var json = JSON.parse(result), cont = 0;
              var soundList = json.Soundlist.Sound.map(sound => {
                  cont++;
                  return {
                      index: cont,
                      addedOn: sound._attributes.addedOn,
                      artist: sound._attributes.artist,
                      name: sound._attributes.title,
                      duration: sound._attributes.duration,
                      hash: sound._attributes.hash,
                      path: sound._attributes.url,
                  }
              });
              resolve(soundList);
          }
          else {
              resolve([]);
          }
      } catch (error) {
          resolve([]);
      }
    });
}

module.exports = {
    ListAllFilesInFolder,
    ListAudiosSoundPad,
}