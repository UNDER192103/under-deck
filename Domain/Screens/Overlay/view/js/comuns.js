///      Constants      ///
const { create } = require('domain');
const Electron = require('electron');
const MAIN_DIR = __dirname.split('\\Domain')[0];
const _dirname = MAIN_DIR;
const path = require('path');
const Comun = require(MAIN_DIR + "/Domain/Comun/Comun.js");
const Toaster = require(MAIN_DIR + "/Domain/src/js/toaster.js");
var DAO = require(MAIN_DIR + "/Repository/DB.js");
///      Constants      ///

var WidgetsOpens = {}, ListSoundPad = [], ListAllApps = [];


function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

///      App ready      //
$(document).ready(async () => {
    $(document).on('click', '.overlay-close .close', async () => {
        await Electron.ipcRenderer.invoke('hide');
    });

    setTimeout(() => {
        $(".tooltip-script").tooltip();
    }, 500);


    $(document).on('click', '.o_p_apps', async (e) => {
        if(WidgetsOpens['o_p_apps']){
            destroyWidgets('o_p_apps');
        }else{
            createWidgets('o_p_apps');
        }
    });

    $(document).on('click', '.soundpoad-ex', async (e) => {
        BACKEND.Send('exec-soundpad-by-index', e.currentTarget.dataset.id);
    });

    $(document).on('click', '.apps-exc', async (e) => {
        console.log(e.currentTarget.dataset.id);
        BACKEND.Send('exec-apps-_id', e.currentTarget.dataset.id);
    });

    $(document).on('click', '.o_p_keysmacro', async (e) => {
        if(WidgetsOpens['o_p_keysmacro']){
            destroyWidgets('o_p_keysmacro');
        }else{
            createWidgets('o_p_keysmacro');
        }
    });

    $(document).on('click', '.o_p_discord', async (e) => {
        if(WidgetsOpens['o_p_discord']){
            destroyWidgets('o_p_discord');
        }else{
            createWidgets('o_p_discord');
        }
    });

    $(document).on('click', '.o_p_soundpad', async (e) => {
        if(WidgetsOpens['o_p_soundpad']){
            destroyWidgets('o_p_soundpad');
        }else{
            createWidgets('o_p_soundpad');
        }
    });

    $(document).on('click', '.o_p_obsstudio', async (e) => {
        if(WidgetsOpens['o_p_obsstudio']){
            destroyWidgets('o_p_obsstudio');
        }else{
            createWidgets('o_p_obsstudio');
        }
    });

    $(document).on('click', '.o_p_webpages', async (e) => {
        if(WidgetsOpens['o_p_webpages']){
            destroyWidgets('o_p_webpages');
        }else{
            createWidgets('o_p_webpages');
        }
    });

    let listToOpen = await DAO.DB.get('open_overlays');
    if(listToOpen && listToOpen[0]){
        listToOpen.forEach(item => {
            createWidgets(item.type, item.styles);
        });
    }
    setTimeout(async () => {
        $("#preload-overlay").fadeOut(250);
        $("#main-overlay").fadeIn(500);
    }, 100);
});

const destroyWidgets = async (type) => {
    if(WidgetsOpens[type]){
        WidgetsOpens[type].element.remove();
    }
    $(`.${type}`).removeClass('active').tooltip('hide');
    WidgetsOpens[type] = null;
    $(`.${type}`).removeClass('active').tooltip('hide');
    delete WidgetsOpens[type];
    await saveAllPositions();
}

const createWidgets = async (type, styles = null) => {
    let id = await uuidv4();
    $(`.${type}`).addClass('active').tooltip('hide');
    switch (type) {
        case 'o_p_apps':
            startWidget(styles == null ? true : false, {id: id, class: "pb-3", type: type, styles: styles, title: getNameTd('.apps_name')}, `
                <div class="list-all-apps overflow-auto pt-3">

                </div>
            `);
            ChangeListAllApps();
        break;

        case 'o_p_discord':
            startWidget(styles == null ? true : false, {id: id, class: "pb-3", type: type, styles: styles, title: getNameTd('.discord_text')}, `
                <div class="custom-cards overflow-auto pt-3">
                    <div id="" class="card-custom-cards tooltip-script" title="${getNameTd('.discord_toggle_mute_unmute_mic_text')}">
                        <div class="card-custom-cards-back">
                            <span class="card-title">${getNameTd('.discord_toggle_mute_unmute_mic_text')}</span>
                        </div>
                    </div>
                    <div id="" class="card-custom-cards tooltip-script" title="${getNameTd('.discord_toggle_mute_unmute_audio_text')}">
                        <div class="card-custom-cards-back">
                            <span class="card-title">${getNameTd('.discord_toggle_mute_unmute_audio_text')}</span>
                        </div>
                    </div>
                </div>
            `);
    $(".tooltip-script").tooltip();
        break;

        case 'o_p_soundpad':
            startWidget(styles == null ? true : false, {id: id, class: "pb-3", type: type, styles: styles == null ? { height: "400px", width: "325px", left: 'calc(50% - 163px)' } : styles, title: getNameTd('.soundpad')}, `
                <div class="list-sounds-soundpad overflow-auto pt-3">

                </div>
            `);
            ChangeListSoundPad();
        break;

        case 'o_p_obsstudio':
            startWidget(styles == null ? true : false, {id: id, type: type, styles: styles, title: getNameTd('.obs_studio_n_text')}, ``);
        break;

        case 'o_p_webpages':
            startWidget(styles == null ? true : false, {id: id, type: type, styles: styles, title: getNameTd('.web_pages_text')}, ``);
        break;
    }

}

const startWidget = async (isSaveOnStart, options, html) => {
    $("#overlay_widgets_content").append(`
        <div id="${options.id}" class="widgets border border-dark">
            <div class="widget-header border-bottom border-dark">
                <div class="widget-header-title">
                    <h5 class="widget-title">
                        <span class="widget-title-text">${options.title}</span>
                        <span class="widget-close">
                            <i class="bi bi-x-lg"></i>
                        </span>
                    </h5>
                </div>
            </div>
            <div class="widget-body child-div-to-disable ${options.class ? options.class : ""}">
                ${html}
            </div>
        </div>
    `);
    
    $(`#${options.id}`).draggable({
        containment: "#overlay_widgets_content",
        cancel: ".child-div-to-disable",
        drag: function(event, ui) {
            $("#overlay_widgets_content .widgets").css("z-index", 0);
            $(`#${options.id}`).css("z-index", 1061);
        },
        stop: function(event, ui) {
            saveAllPositions();
        }
    })
    .resizable({
        handles: "all",
        minWidth: 160,
        minHeight: 200,
        maxWidth: '100%',
        maxHeight: '100%',
        resize: function(event, ui) {
            $("#overlay_widgets_content .widgets").css("z-index", 0);
            $(`#${options.id}`).css("z-index", 1061);
        },
        stop: function(event, ui) {
            saveAllPositions();
        }
    })
    .click((e)=>{
        $("#overlay_widgets_content .widgets").css("z-index", 0);
        $(`#${options.id}`).css("z-index", 1061);
    })
    .on('click', '.widget-close', (e) => {
        destroyWidgets(options.type);
    })
    .ready(async () => {
        if(options.styles != null)
                $(`#${options.id}`).css(options.styles);
    });
    WidgetsOpens[options.type] = {
        id: options.id,
        type: options.type,
        element: $(`#${options.id}`),
    }

    if(isSaveOnStart)
        saveAllPositions();
}

const saveAllPositions = async () => {
    await DAO.DB.set('open_overlays', Object.keys(WidgetsOpens).map(type => {
        let item = WidgetsOpens[type];
        return {
            type: item.type,
            styles:{
                "top": WidgetsOpens[type].element.css('top'),
                "left": WidgetsOpens[type].element.css('left'),
                "height": WidgetsOpens[type].element.css('height'),
                "width": WidgetsOpens[type].element.css('width'),
                "z-index": WidgetsOpens[type].element.css('z-index')
            }
        };
    }));
}

const getListSoundPad = async () => {
    if(ListSoundPad.length > 0) return ListSoundPad;
    ListSoundPad = BACKEND.Send('get-list-soundpad-audios');
    return ListSoundPad;
}

const getListAllApps = async () => {
    let listApps = await DAO.ProgramsExe.get('list_programs');
    if(!listApps) listApps = [];
    return listApps;
}

const ChangeListAllApps = async () => {
    ListAllApps = await getListAllApps();
    $(".list-all-apps").html('');
    console.log(ListAllApps);
    ListAllApps.forEach(app => {
        let nameApp = app.nameCustom ? app.nameCustom : app.name;
        $(".list-all-apps").append(`
            <div data-id="${app._id}" class="apps-exc card-all-apps tooltip-script" title="${nameApp}">
                <div class="card-all-apps-back ${app.positon_l % 2 == 0 ? 's-3':''}">
                    <img src="${app.iconCustom}" alt="${nameApp}" class="card-img-full-size">
                    <span class="card-title">${nameApp}</span>
                </div>
            </div>
        `);
    });
    $(".tooltip-script").tooltip();
}

const ChangeListSoundPad = async () => {
    ListSoundPad = await getListSoundPad();
    $(".list-sounds-soundpad").html('');
    ListSoundPad.forEach(sound => {
        $(".list-sounds-soundpad").append(`
            <div data-id="${sound.index}" class="soundpoad-ex card-sounds-soundpad tooltip-script" title="${sound.name}">
                <div class="card-sounds-soundpad-back ${sound.index % 2 == 0 ? 's-3':''}">
                    <span class="card-title">${sound.name}</span>
                </div>
            </div>
        `);
    });
    $(".tooltip-script").tooltip();
}