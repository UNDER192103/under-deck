const fs = require('fs');
const fsPromises = require('fs').promises;
const icon = require('file-icon-extractor');
const { exec } = require('child_process');
const { notify } = require('superagent');
const path = require('path');
const MAIN_DIR = __dirname.split('\\Domain')[0];
var DAO = require(MAIN_DIR + "/Repository/DB.js");

var rand = function () {
    return Math.random().toString(32).substr(2); // remove `0.`
};

var token = function () {
    return rand() + rand() + rand() + rand(); // to make it longer
};


async function listAllFilesInFolder(diretorio, arquivos) {

    if (!arquivos)
        arquivos = [];

    let listaDeArquivos = await fsPromises.readdir(diretorio);
    for (let k in listaDeArquivos) {
        let stat = await fsPromises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await listAllFilesInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '\\' + listaDeArquivos[k]);
    }

    return arquivos;

}

async function listAllFoldersInFolder(diretorio, arquivos) {

    if (!arquivos)
        arquivos = [];

    let listaDeArquivos = await fsPromises.readdir(diretorio);
    for (let k in listaDeArquivos) {
        let stat = await fsPromises.stat(diretorio + '\\' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        else if (stat.isDirectory() && diretorio.includes("node_modules") == true) {
            await listAllFoldersInFolder(diretorio + '\\' + listaDeArquivos[k], arquivos);
        }
        else {
            if (!diretorio.includes("node_modules")) {
                if (await arquivos.filter(file => file == diretorio)[0] == null)
                    arquivos.push(diretorio);
            }
        }
    }

    return arquivos;

}

async function ListAllFilesInFolder(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '\\' + files[i];
        if (fs.statSync(name).isDirectory()) {
            await ListAllFilesInFolder(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

const Get_file_name = async (filePath) => {
    return new Promise(async resolve => {
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

const exec_program = async (data, type = null) => {
    try {
        if (data != null) {
            if (type == null) {
                if (data.type_exec != null)
                    type = data.type_exec;
                else
                    type = "exe";
            }

            let name = data.name;
            if (data.nameCustom != null)
                name = data.nameCustom;

            if (type == "discord") {
                if (DiscordRPCLogged) {
                    if (data.path == "toggle-mute-unmute-mic") {
                        MuteOrUnmuteMic();
                    }
                    else if (data.path == "toggle-mute-unmute-audio") {
                        MuteOrUnmuteAudio();
                    }
                }
                else {
                    toaster.danger(getNameTd('.This_action_cannot_be_performed_because_the_Discord_integration_is_not_connected_please_check_if_it_is_connected'))
                }
            }
            else if (type == "exe") {
                console.log(`App: ${name} Iniciado!`)
                exec(`"${data.path}"`, () => { });
            }
            else if (type == "web_page") {
                console.log(`Pagina web aberta, Nome: ${name} Iniciado!`)
                exec(`start "" "${data.path}"`, () => { });
            }
            else if (type == "cmd") {
                console.log(`Comando executado, Nome: ${name} Iniciado!`)
                exec(`${data.path}`, () => { });
            }
            else if (type == 'audio') {
                var audio_token = await token();
                $("#audios_instaces").append(`
                    <audio id="${audio_token}-player" class="hidden" controls='false'>
                        <source id="${audio_token}-src" src="${data.path}">
                    </audio>
                `);
                try {
                    var instace_audio = $(`#${audio_token}-player`)[0];
                    await instace_audio.load();
                    $(`#${audio_token}-player`).on('ended', function () {
                        $(`#${audio_token}-player`).remove();
                    });
                    instace_audio.play();
                } catch (error) {
                    $(`#${audio_token}-player`).remove();
                }
            }
            else if (type == "obs_wss") {
                if (data.obsOption == 'scene')
                    await BACKEND.Send('Obs_wss_p', { stage: 'select_scene', sceneName: data.scene.sceneName, id: data.scene.sceneUuid });
                else if (data.obsOption == "audioinput_mute" && data.audioInput != null) {
                    if (DAO.OBS.get(`input_muted-${data.audioInput.inputUuid}`) == true) {
                        await DAO.OBS.set(`input_muted-${data.audioInput.inputUuid}`, null);
                        await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', notify: false, inputMuted: false, inputName: data.audioInput.inputName, inputUuid: data.audioInput.inputUuid });
                    }
                    else {
                        await DAO.OBS.set(`input_muted-${data.audioInput.inputUuid}`, true);
                        await BACKEND.Send('Obs_wss_p', { stage: 'MuteInputAudio', notify: false, inputMuted: true, inputName: data.audioInput.inputName, inputUuid: data.audioInput.inputUuid });
                    }
                }
                else {
                    BACKEND.Send('Obs_wss_p', { stage: data.obsOption, notify: false });
                }
            }
            else if (type == "soundpad_audio") {
                if (ListSoundPad.length > 0) {
                    let soundP = ListSoundPad.filter(f => f.hash == data.hash)[0];
                    if (soundP) {
                        exec_soundpad(pathSoundPadExe, soundP.index)
                    }
                }

            }
            else if(type == "options_os"){
                console.log({key: data.path})
                await BACKEND.Send('Robotjs_keyTap', {key: data.path}).the(console.log);
            }
            else {

            }
        }
    } catch (error) {

    }
}

const exec_soundpad = async (pathSoundPad, index) => {
    if (await fs.existsSync(pathSoundPad))
        exec(`${pathSoundPad} -rc DoPlaySound(${index})`, (e) => { });
}

function getMyIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        if (devName.includes('Ethernet') || devName.includes('Wi-Fi') || devName.includes('Wi Fi') || devName.includes('WiFi')) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

module.exports = {
    getMyIPAddress,
    ListAllFilesInFolder,
    listAllFilesInFolder,
    listAllFoldersInFolder,
    Get_file_name,
    get_icon_by_exe,
    exec_program,
    exec_soundpad,
    token,
};