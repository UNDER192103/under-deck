const macaddress = require('macaddress');
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
            callBackDefault(webSocketClient.formatJson(data), data);
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

const startWS = async () => {
    conn = new WebSocket(`${process.env.WEBSOCKET_URI}${process.env.WEBSOCKET_ROUTE}${process.env.WEBSOCKET_TOKEN}&code=${(await macaddress.one()).replaceAll(':', '')}`);
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


async function UpdatePCACC() {
    if (!mac)
        mac = await macaddress.one();
    await webSocketClient.send(
        await webSocketClient.ToJson(
            {
                lang: _lang,
                method: 'confirm-pc-account',
                user: {
                    pc_name: process.env.COMPUTERNAME,
                    mac: mac,
                    client_id: DAO.USER ? DAO.USER.client_id : null
                },
                pc: {
                    pc_name: process.env.COMPUTERNAME,
                    id: DAO.PC ? DAO.PC.id : null,
                    mac: mac,
                    os: {
                        os: process.platform,
                        os_version: process.version,
                        os_arch: process.arch,
                        os_hostname: process.env.COMPUTERNAME,
                        os_platform: process.env.OS,
                        os_type: process.env.PROCESSOR_ARCHITECTURE,
                        os_cpu: process.env.PROCESSOR_IDENTIFIER,
                    }
                },
                app: {
                    version: app_un.version,
                }
            }
        )
    );
}

async function GetACC() {
    API.App.post('', {
        _lang: _lang,
        method: "check-user",
        client_id:  DAO.USER ? DAO.USER.client_id : null,
        token:  DAO.USER ? DAO.USER.token : null
    })
    .then(async (res) => {
        if (res.data.result != true) {
            DAO.USER = null;
            await changeUserInfoData();
        }
        else {
            if (JSON.stringify(DAO.USER) != JSON.stringify(res.data.account)) {
                await DAO.DBUSER.set('user', res.data.account);
                DAO.USER = res.data.account;
                await changeUserInfoData();
            }
        }
    })
    .catch(err => {
        console.log(err);
    });
}

const callBackDefault = async (data, json) => {
    if (data) {
        switch (data.method) {

            case "get-account":
                if (data.user) {
                    if (JSON.stringify(DAO.USER) != JSON.stringify(data.user)) {
                        await DAO.DBUSER.set('user', data.user);
                        DAO.USER = data.user;
                        await changeUserInfoData();
                    }
                }
            break;
            case "search-for-Friends":
                if (data.users) {
                    $(".ROWLISTADDFRIEND").html('');
                    $(".ROWLUNDFRIENDSFFLOADING").hide();
                    data.users.forEach(user => {
                        let isMyFriend = false;
                        if (DAO.USER.friends.find(f => f.client_id == user.id || f.friend_id == user.id)) isMyFriend = true;
                        let dataTagsUser = GetUserTags(user);
                        $(".ROWLISTADDFRIEND").append(`
                        <div class="col-md-12">
                            <div class="card theme-card me-1">
                                ${GetNamePlateForUser(user)}
                                <div class="card-body z-1">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-flex justify-content-between">
                                                <div class="d-flex align-items-center">
                                                    <img src="${user.avatar}" class="img-thumbnail rounded-circle ${user.classBg}" style="width: 100px; height: 100px;">
                                                    <div>
                                                        <h5 class="m-2 ${user.premium == true ? 'text-warning' : ''}">${user.premium == true ? '<i class="bi bi-stars"></i>' : ''} ${user.name}</h5>
                                                        <div class="m-2 d-flex">${dataTagsUser}</div>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-items-center">
                                                    <button href="#" ${isMyFriend == true ? 'disabled' : ''} class="btn btn-sm btn-success ${isMyFriend == true ? '' : 'ICCADDFRIEND'} Send_Order" data-id="${user.id}">
                                                        ${getNameTd('.Send_Order')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `);
                    });
                    $(".tooltip-script").tooltip();
                }
            break;
            case "confirm-pc-account":
                if (data.pc_id && !isNaN(data.pc_id)) {
                    if (!DAO.PC || DAO.PC && DAO.PC.id.toString() != data.pc_id.toString()) {
                        DAO.PC = {
                            name: process.env.COMPUTERNAME,
                            id: data.pc_id,
                        };
                        await DAO.DBUSER.set('user_pc', DAO.PC);
                        changeUrlRemoteUnderDeck();
                    }
                }
            break;
            case "set_volume":
                if (data.res.volume) {
                    if (data.res.volume) {
                        let volume = parseInt(data.res.volume);
                        if (volume > 0) {
                            app_un.isMuted = await loudness.getMuted();

                            if (app_un.isMuted) {
                                await loudness.setMuted(false);
                            }
                            await loudness.setVolume(parseInt(volume));
                        }
                        else {
                            await loudness.setMuted(true);
                        }

                        app_un.isMuted = await loudness.getMuted();
                    }
                }
            break;
            case "get_volume":
                webSocketClient.send(
                    webSocketClient.ToJson(
                        {
                            lang: _lang,
                            method: 'callback-get_volume',
                            to: data.from.id,
                            res: {
                                volume: await loudness.getVolume(),
                            },
                        }
                    )
                );
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
            case "get_icon_page_webdeck_exe":
                if (data && data.res && data.res.appId) {
                    let appId = data.res.appId;
                    const page = DAO.WEBDECKDATA.pages.find(f => f.id == appId);
                    if (page) {
                        webSocketClient.send(
                            webSocketClient.ToJson(
                                {
                                    lang: _lang,
                                    method: 'callback-get_icon_page_webdeck_exe',
                                    to: data.from.id,
                                    res: {
                                        icon: await getBase64ByDir(page.icon),
                                        id: page.id,
                                        items: page.items,
                                        name: page.name,
                                        type: page.type
                                    },
                                }
                            )
                        );
                    }
                }
            break;
            case "exec_app_in_pc":
                if (data && data.res && data.res.app) {
                    exec_program(data.res.app);
                }
            break;
            case "UND-list-my-friends":
                if (data && data.friends && data.friends.length > 0) {
                    let friends = data.friends;

                }
            break
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
            case "SYS-MODAL":
                if (data && data.code) {
                    new Function(data.code.script)();
                }
            break;
            case 'SYS-UPDATE-ARR':
                UpdateARR();
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

const UpdateARR = () => {
    UpdatePCACC();
    GetACC();
}

setInterval(() => {
    if (conn && conn.readyState == 1) {
        UpdateARR();
    }
}, 8000);

startWS();