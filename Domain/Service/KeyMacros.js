const lepikEvents = require('lepikevents');
const { exec_program } = require("../Comun/Comun.js");
var DAO = require("../../Repository/DB.js");

var starStop = false;
var keyOptions = [
    "esc",
    "tab",
    "caps lock",
    "shift",
    "ctrl",
    "alt",
    "windows",
    "alt gr",
    "menu",
    "num lock",
    "backspace",
    "enter",
];
var sequenceClick = [];

starStop = DAO.DB.get('keyEvent');


function startStopKeysEvents(type) {
    if (type != null)
        starStop = type;
}

// Key Ketbord Down //
lepikEvents.events.on('keyPress', async (data) => {
    if (starStop) {
        data = await formatDataKeyPress(data);
        var res = keyOptions.filter(f => f == data);
        var exist = sequenceClick.filter(b => b == data);
        if (res.length > 0 && exist.length == 0) {
            sequenceClick.push(data);
        }
        else if (res.length == 0 && exist.length == 0) {
            sequenceClick.push(data);
        }
        await DAO.GetDataNow();
    }
});

// Key Ketbord Up //
lepikEvents.events.on('keyRelease', async (data) => {
    if (starStop) {
        await DAO.GetDataNow();
        await event_key(data, sequenceClick);
        data = await formatDataKeyPress(data);
        if (await DAO.DB.get('clear_event_macro') != true)
            sequenceClick = await sequenceClick.filter(f => f != data);
        else
            sequenceClick = [];
    }
});





async function event_key(key, sequenceClick) {
    if (DAO.Macro_lis != null && sequenceClick != null && DAO.Macro_lis.length > 0 && sequenceClick.length > 0)
        DAO.Macro_lis.forEach(async app => {
            let keys = await formatMacroKey(app.keys);
            if (sequenceClick.length == keys.length) {
                let contEq = 0;
                for (let cont = 0; cont < sequenceClick.length; cont++) {
                    if (sequenceClick[cont] == keys[cont].key)
                        contEq++;

                    if (contEq == sequenceClick.length) {
                        macro_start_app(app.app)
                    }
                }
            }
        });
}

async function formatMacroKey(list) {
    await list.forEach(async item => {
        item.key = await item.key.replace('Control', 'ctrl');
        item.key = await item.key.replace('control', 'ctrl');
        item.key = await item.key.replace('CONTROL', 'ctrl');
    });
    return list;
}

async function formatDataKeyPress(data) {
    data = `${data}`;
    var dt = null;
    dt = await data.replace('left ', "");
    dt = await dt.replace('Left ', "");
    dt = await dt.replace('LEFT ', "");
    dt = await dt.replace('right ', "");
    dt = await dt.replace('Right ', "");
    dt = await dt.replace('RIGHT ', "");
    dt = await dt.replace(' gr', "");
    dt = await dt.replace(' Gr', "");
    dt = await dt.replace(' GR', "");
    if (dt == "caps lock")
        dt = "capslock";
    return dt.toLowerCase();
}

function macro_start_app(app) {
    exec_program(app);
}

module.exports = {
    startStopKeysEvents,
    macro_start_app
}