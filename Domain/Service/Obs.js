const { OBSWebSocket } = require("obs-websocket-js");
const Socket = new OBSWebSocket();

const SocketConnect = async (Ip, Port, Password = undefined)=>{
    return Socket.connect(`ws://${Ip}:${Port}`, Password);
}

const StartStream = async () =>{
    return Socket.call('StartStream');
}
const StopStream = async () =>{
    return Socket.call('StopStream');
}

const ListAllScenes = async () =>{
    return Socket.call('GetSceneList');
}

const SelectScene = async (SceneName) =>{
    return Socket.call('SetCurrentProgramScene', {sceneName: SceneName});
}

const MuteInput = async (inputUuid, inputMuted = false) =>{
    return Socket.call('SetInputMute', {inputUuid: inputUuid, inputMuted: inputMuted});
}

const GetInputList = async () =>{
    return Socket.call('GetInputList');
}

const Disconnect = async ()=>{
    return Socket.disconnect()
}

const Disconnected = async (callback) => {
    Socket.on('ConnectionClosed', callback);
}

module.exports = {
    Socket: Socket,
    Connect: SocketConnect,
    StartStream: StartStream,
    StopStream: StopStream,
    ListAllScenes: ListAllScenes,
    SelectScene: SelectScene,
    MuteInput: MuteInput,
    GetInputList: GetInputList,
    Disconnect: Disconnect,
    Disconnected: Disconnected,
};