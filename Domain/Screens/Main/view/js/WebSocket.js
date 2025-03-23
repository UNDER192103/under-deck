const macaddress = require('macaddress');
const conf = require(MAIN_DIR + '/Repository/data/conf.json');
const WS = require('ws');
var conn = null, ws10Segundos = false, inGetPermissions = [];

const webSocketClient = {
    callback: null,
    callback2: null,
    callback3: null,
    callbackAPS: null,

    ToJson: (data) => {
        try {
            return JSON.stringify(data);
        } catch (error) {
            return '';
        }
    },
    send: (json, callback = null) => {
        if (callback != null)
            this.callback = callback;
        if (conn.readyState != 1) {
            return 'off';
        }
        else if (conn.readyState == 1)
            return conn.send(json);
    },
    receiver: (data) => {
        try {
            this.callback(webSocketClient.formatJson(data));
        } catch (error) { }
        try {
            callBackDefault(webSocketClient.formatJson(data));
        } catch (error) { }
        if (this.callback2 != null)
            this.callback2(webSocketClient.formatJson(data));
        if (this.callback3 != null)
            this.callback3(webSocketClient.formatJson(data));
    },
    formatJson: (string) => {
        try {
            return JSON.parse(string);
        } catch (error) {
            return string;
        }
    }
}

const startWS = () => {
    conn = new WebSocket(`${conf.WEBSOCKET.URI}${conf.WEBSOCKET.ROUTE}${conf.WEBSOCKET.TOKEN}`);
    conn.onmessage = function (e) {
        webSocketClient.receiver(e.data);
    };
    conn.onopen = async function (e) {
        console.log("WebSocket Is Open");
        UpdatePCACC();
    };
    conn.onclose = function (e) {
        startWs10Segundos()
    };
    conn.onerror = function (e) {
        startWs10Segundos()
    }
}

function startWs10Segundos() {
    if (ws10Segundos == false) {
        ws10Segundos = true;
        setTimeout(() => {
            startWS();
            ws10Segundos = false;
        }, 3000);
    }
}


function UpdatePCACC() {
    macaddress.one().then(function (mac) {
        webSocketClient.send(
            webSocketClient.ToJson(
                {
                    lang: _lang,
                    method: 'confirm-pc-account',
                    user: {
                        pc_name: process.env.COMPUTERNAME,
                        mac: mac,
                        client_id: DAO.USER ? DAO.USER.client_id : 0
                    }
                }
            )
        );
    });
}

const callBackDefault = async (data) => {
    if (data) {
        switch (data.method) {

            case "confirm-pc-account":
                if (data.pc_id && !isNaN(data.pc_id)) {
                    if (!DAO.PC || DAO.PC && DAO.PC.id.toString() != data.pc_id.toString()) {
                        DAO.PC = {
                            name: process.env.COMPUTERNAME,
                            id: data.pc_id,
                        };
                        await DAO.DB.set('user_pc', DAO.PC);
                        changeUrlRemoteUnderDeck();
                    }
                }
                break;

            case "get_apps":
                webSocketClient.send(
                    webSocketClient.ToJson(
                        {
                            lang: _lang,
                            method: 'callback-get_apps',
                            to: data.from.id,
                            res: await GetDataListProgramsForWebSocket(),
                        }
                    )
                );
                break;

            case "get_icon_app_exe":
                if (data && data.res && data.res.appId) {
                    let appId = data.res.appId;
                    let AppReturn = FormTListCRT.list.filter(f => f._id == appId)[0];
                    if (AppReturn) {
                        AppReturn.iconCustom = await getBase64ByDir(AppReturn.iconCustom);
                        webSocketClient.send(
                            webSocketClient.ToJson(
                                {
                                    lang: _lang,
                                    method: 'callback-get_icon_app_exe',
                                    to: data.from.id,
                                    res: AppReturn,
                                }
                            )
                        );
                    }
                }
                break;

            case "exec_app_in_pc":
                if (data && data.res && data.res.app) {
                    Comun.exec_program(data.res.app);
                }
                break;

            case "UND-request-remote-permission-acess-this-pc":
                if (data.res.user_request && data.res.user_request.name) {
                    let dataUserRQ = data.res.user_request;
                    if (!inGetPermissions[dataUserRQ.client_id]) {
                        inGetPermissions[dataUserRQ.client_id] = data;
                        bootbox.confirm({
                            title: `<h3>${getNameTd('.Notice_text')}</h3>`,
                            message: `
                                ${getNameTd('.confirm_new_acess_remote_1_text').replaceAll('{{user}}', dataUserRQ.name)}
                                <br><br>
                                ${getNameTd('.Attention_text')}:<br>
                                ${getNameTd('.confirm_new_acess_remote_2_text')}
                                <br><br>
                                OBS:<br>
                                ${getNameTd('.confirm_new_acess_remote_3_text')}
                            `,
                            buttons: {
                                confirm: {
                                    label: getNameTd('.To_accept_text'),
                                    className: 'btn-success To_accept_text'
                                },
                                cancel: {
                                    label: getNameTd('.To_deny_text'),
                                    className: 'btn-danger To_deny_text'
                                }
                            },
                            callback: async (res) => {
                                let dataToRes = inGetPermissions[dataUserRQ.client_id];
                                if (res) {
                                    await webSocketClient.send(
                                        await webSocketClient.ToJson(
                                            {
                                                lang: _lang,
                                                method: 'callback-UND-request-remote-permission-acess-this-pc',
                                                to: dataToRes.from.id,
                                                res: {
                                                    pc_id: DAO.PC.id,
                                                    isAccept: true,
                                                    user_request: dataToRes.res.user_request,
                                                    acessToken: dataToRes.newAcessToken
                                                }
                                            }
                                        )
                                    );
                                    toaster.success(getNameTd('.You_successfully_accept_the_request_text'));
                                    delete inGetPermissions[dataUserRQ.client_id];
                                }
                                else {
                                    await webSocketClient.send(
                                        await webSocketClient.ToJson(
                                            {
                                                lang: _lang,
                                                method: 'callback-UND-request-remote-permission-acess-this-pc',
                                                to: dataToRes.from.id,
                                                res: {
                                                    pc_id: DAO.PC.id,
                                                    isAccept: false,
                                                    user_request: dataToRes.res.user_request,
                                                    acessToken: null
                                                }
                                            }
                                        )
                                    );
                                    toaster.warning(getNameTd('.You_successfully_declined_the_request_text'));
                                    delete inGetPermissions[dataUserRQ.client_id];
                                }
                            }
                        });
                    }
                    else {
                        inGetPermissions[dataUserRQ.client_id] = data;
                    }

                }
                break;

            default:
                console.log(data);
                break;
        }
    }
}

async function revokeAllPermissionAcessThisPC() {
    if (DAO.USER && DAO.PC) {
        let mac = await macaddress.one();
        await webSocketClient.send(
            await webSocketClient.ToJson(
                {
                    lang: _lang,
                    method: 'revoke-all-permissions-for-this-pc',
                    mac: mac,
                    pc: DAO.PC,
                    user: {
                        client_id: DAO.USER.client_id,
                        token: DAO.USER.token,
                    }
                }
            )
        );
    }
}

setInterval(() => {
    if (conn && conn.readyState == 1) {
        UpdatePCACC();
    }
}, 2000);

startWS();