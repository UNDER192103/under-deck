const fs = require('fs');
const fsPromises = require('fs').promises;
const icon = require('file-icon-extractor');
const { exec } = require('child_process');
const { notify } = require('superagent');

var rand = function() {
    return Math.random().toString(32).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand() + rand() + rand(); // to make it longer
};


async function listAllFilesInFolder(diretorio, arquivos) {

    if(!arquivos)
        arquivos = [];

    let listaDeArquivos = await fsPromises.readdir(diretorio);
    for(let k in listaDeArquivos) {
        let stat = await fsPromises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if(stat.isDirectory())
            await listAllFilesInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '\\' + listaDeArquivos[k]);
    }

    return arquivos;

}

async function listAllFoldersInFolder(diretorio, arquivos) {

    if(!arquivos)
        arquivos = [];

    let listaDeArquivos = await fsPromises.readdir(diretorio);
    for(let k in listaDeArquivos) {
        let stat = await fsPromises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if(stat.isDirectory())
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else if(stat.isDirectory() && diretorio.includes("node_modules") == true){
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        }
        else{
            if(!diretorio.includes("node_modules")){
                if(await arquivos.filter(file => file == diretorio)[0] == null)
                arquivos.push(diretorio);
            }
        }
    }

    return arquivos;

}

const Get_file_name = async (filePath)=>{
    return new Promise( async resolve => {
	    const filePaths = filePath => [].concat(filePath);
	    filePaths(filePath).forEach(element => {	
            resolve(`${path.basename(element, path.extname(element))}`);
	    });
    });
}

const get_icon_by_exe = async (exe, dir) => {
    try {
        await icon.extract(exe, dir, "png");
        var name_f = await Get_file_name(exe);
        return `${dir}${name_f}.png`;
    } catch (error) {
        return null;
    }
};

const exec_program = async (data, type = null) =>{
    if(data != null){
        if(type == null){
            if(data.type_exec != null)
                type = data.type_exec;
            else
                type = "exe";
        }

        let name = data.name;
        if(data.nameCustom != null)
            name = data.nameCustom;

        if(type == "exe"){
            console.log(`App: ${name} Iniciado!`)
            exec(`"${data.path}"`, () => {});
        }
        else if(type == "web_page"){
            console.log(`Pagina web aberta, Nome: ${name} Iniciado!`)
            exec(`start "" "${data.path}"`, () => {});
        }
        else if(type == "cmd"){
            console.log(`Comando executado, Nome: ${name} Iniciado!`)
            exec(`${data.path}`, () => {});
        }
        else if(type == 'audio'){
            var audio_token = await token();
            $("#audios_instaces").append(`
                <audio id="${audio_token}-player" class="hidden" controls='false'>
                    <source id="${audio_token}-src" src="${data.path}">
                </audio>
            `);
            try {
                var instace_audio = $(`#${audio_token}-player`)[0];
                await instace_audio.load();
                $(`#${audio_token}-player`).on('ended', function() {
                    $(`#${audio_token}-player`).remove();
                });
                instace_audio.play();
            } catch (error) {
                $(`#${audio_token}-player`).remove();
            }
        }
        else if(type == "obs_wss"){
            if(data.obsOption == 'scene')
                await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', sceneName: data.scene.sceneName, id: data.scene.sceneUuid});
            else{
                BACKEND.Send('Obs_wss_p', {stage: data.obsOption, notify: false});
            }
        }
    }
}

module.exports = {
    listAllFilesInFolder,
    listAllFoldersInFolder,
    Get_file_name,
    get_icon_by_exe,
    exec_program,
    token,
};