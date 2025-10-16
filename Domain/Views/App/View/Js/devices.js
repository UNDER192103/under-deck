var DevicesEsp32 = [], DevicesEsp32Remote = [];

ipcRenderer.on('Esp32Connected', async (events, data) => {
    console.log('Esp32Connected', data);
});

ipcRenderer.on('Esp32disconnected', async (events, data) => {
    console.log('Esp32disconnected', data);
});

ipcRenderer.on('Esp32disconnected', async (events, data) => {
    console.log('data', Esp32Data);
});


$(document).ready(async () => {
    ListDevices();

    $("#button-list-device").click(async function(e){
        e.preventDefault();
        $(this).attr('disabled', true);
        await ListDevices();
        $(this).attr('disabled', false);
    });

    $(document).on('click', ".EditDLP",function(e){
        e.preventDefault();
        EditEsp32Device(DevicesEsp32.find(f => f.info.hostname == $(this).data('id')));
    });
});

const ListDevices = async () => {
    DevicesEsp32 = await BACKEND.Send('esp32DiscoverDevices');
    let DevicesEsp32Remote = await DAO.DEVICES.get('Remotes');
    if(!Array.isArray(DevicesEsp32Remote)) DevicesEsp32Remote = [];
    $(".CLD_DevicesEsp32").html('');
    DevicesEsp32.forEach(device => {
        AddImViewDevice(device);
    });
}

const AddImViewDevice = async (Device, isRemote = false) => {
    let Id = Device.info.hostname;
    let dto = await DAO.DEVICES.get(Id);
    if(!dto){
        dto = {info: Device.info, name: Device.info.hostname, icon: path.join(APP_PATH, "/Domain/src/img/underbot_logo.png")};
        await DAO.DEVICES.set(Id, dto);
    }
    let name = dto && dto.name ? dto.name : Device.info.hostname;
    let icone =  dto && dto.icon ? dto.icon : path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");

    $('.CLD_DevicesEsp32').append(`
        <div class="m-0 col-md-4 col-xl-2 transition-all col animate__animated animate__fadeIn" id="DL-${Id}">
            <div class="card rounded-3 rigth-click-exe hover-exes border border-4 rounded">
                <div class="d-btn-exe-F m-1 d-flex flex-row-reverse">
                    <span class="dropdown-toggle dropdown-toggle-c fillter-shadow-text hover-icon-edit" data-bs-auto-close="*" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <a class="nav-link tooltip-script hover_rotation" title="${getNameTd(".tooltip_config_t")}" data-toggle="tooltip" href="#"><i class="bi bi-gear-wide"></i></a>
                    </span>
                    <ul class="dropdown-menu fillter-shadow-box">
                        <li class="EditDLP" data-id="${Id}" type="button"><a class="dropdown-item" href="#"><i class="bi bi-pen text-success"></i> ${getNameTd(".edit_text")}</a></li>
                        ${isRemote ?`<li><a class="dropdown-item ligth" href="#"><i class="bi bi-trash3 text-danger"></i> ${getNameTd(".delete_text")}</a></li>` : ''}
                    </ul>
                </div>
                <img src="${icone}" class="DLP_icon-${Id} card-img-top w-100 mh-iconapp mb-0 auto-left-right" alt="...">

                <div class="d-footer-exe card-body text-center">
                    <h5 class="card-title text-light tooltip-script u-format-max-text exeT m-0 cursor-pointer" title="${name}" data-toggle="tooltip">${name}</h5>
                </div>
            </div>
        </div>
    `);
    $(".tooltip-script").tooltip();
}


async function EditEsp32Device(Device) {
    if (Device) {
        let Id = Device.info.hostname;
        let dto = await DAO.DEVICES.get(Id);
        let name = dto && dto.name ? dto.name : Id;
        let icone =  dto && dto.icon ? dto.icon : path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
        $(".bootbox-close-button").click();
        bootbox.dialog({
            title: `<i class="bi bi-pen text-success"></i> ${getNameTd('.edit_text')}`,
            message: `
                <div id="colDLP-${Id}" class="col-md-12">
                    <div class="card theme-card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex align-items-center">
                                            <img src="${icone}" class="img-thumbnail rounded" style="width: 100px; height: 100px;">
                                            <h5 class="m-2">${name}</h5>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <h5 class="m-2">${Id}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            closeButton: false,
            buttons: {
                changeIcon: {
                    label: getNameTd('.Change_icon_icon'),
                    className: "btn btn-primary Change_icon_icon",
                    callback: async function () {
                        ModalGetImagem(true, async (file, default_image) => {
                            let NewIcon = file != null ? await convertImageToBase64(file) : default_image;
                            if(!dto) dto = {};
                            dto.icon = NewIcon;
                            await DAO.DEVICES.set(Id, dto);
                            $(`.DLP_icon-${Id}`).attr('src', `${NewIcon}`);
                            EditEsp32Device(Device);
                        }, icone);
                    }
                },
                changeName: {
                    label: getNameTd('.Change_name_icon'),
                    className: "btn btn-primary Change_name_icon",
                    callback: async function () {
                        getNewNameEsp32Device(async (NewName) => {
                            if(!dto) dto = {};
                            dto.name = NewName;
                            await DAO.DEVICES.set(Id, dto);
                            ListDevices();
                            EditEsp32Device(Device);
                        }, name, () => {
                            EditEsp32Device(Device);
                        });
                    }
                },
                save: {
                    label: getNameTd('.close_icon'),
                    className: "btn btn-danger close_icon",
                    callback: async function () {
                        //await ListDevices();
                    }
                },
            }
        });
    }
}

function getNewNameEsp32Device(callback, name = '', callback_cancel = null) {
    bootbox.dialog({
        title: `${getNameTd('.requere_name_add_app')}`,
        message: `<form class="bootbox-form"><input id="requerename" value="${name}" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text"></form>`,
        closeButton: false,
        buttons: {
            danger: {
                label: getNameTd('.cancel_icon_text'),
                className: "btn btn-danger",
                callback: function () {
                    if (callback_cancel) callback_cancel();
                }
            },
            success: {
                label: getNameTd('.save_icon_text'),
                className: "btn btn-success",
                callback: function () {
                    var result = $("#requerename").val();
                    callback(result);
                }
            }
        }
    });
}