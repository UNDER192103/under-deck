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
const ToggleStream = async () => {
    return Socket.call('ToggleStream');
}

const StartRecord = async () => {
    return Socket.call('StartRecord');
}
const StopRecord = async () => {
    return Socket.call('StopRecord');
}
const ToggleRecordPause = async () => {
    return Socket.call('ToggleRecordPause');
}
const PauseRecord = async () => {
    return Socket.call('PauseRecord');
}
const ResumeRecord = async () => {
    return Socket.call('ResumeRecord');
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
    IsConnected: false,
    Socket: Socket,
    Connect: SocketConnect,
    ToggleStream: ToggleStream,
    StartStream: StartStream,
    StopStream: StopStream,
    StartRecord: StartRecord,
    StopRecord: StopRecord,
    ToggleRecordPause: ToggleRecordPause,
    PauseRecord: PauseRecord,
    ResumeRecord: ResumeRecord,
    ListAllScenes: ListAllScenes,
    SelectScene: SelectScene,
    MuteInput: MuteInput,
    GetInputList: GetInputList,
    Disconnect: Disconnect,
    Disconnected: Disconnected,
};