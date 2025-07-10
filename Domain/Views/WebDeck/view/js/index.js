var _all = { data_user: null, L_programs: null, json_data: null, isFullScreen: false }, isRotetionMode = '';
var webDeckPage = 1,
    WebDeckCustomPage = null,
    _NW = {
        formatView: 'none',
        formatListView: 'none',
        pages: [],
    };

$(document).ready(function () {
    start_get_data();

    $(document).on('click', '.bnt-fullscreen', (r) => {
        var elem = document.documentElement;

        function openFullscreen() {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }

            _all.isFullScreen = true;
        }

        function closeFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            _all.isFullScreen = false;
        }

        if (!_all.isFullScreen)
            openFullscreen();
        else
            closeFullscreen()
    });

    $(document).on('click', '.bnt-refreshList', (r) => {
        _all = { data_user: null, L_programs: null, json_data: null, isFullScreen: _all.isFullScreen };
        webDeckPage = 1;
        LoadAppsInScreen();
    })

    $(document).on('click', '.bnt-rotetionMode', (r) => {
        $('.set-rotetionS').removeClass(isRotetionMode);

        switch (isRotetionMode) {
            case '':
                isRotetionMode = 'horizontalMode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-vertical"></i>');
                break;

            case 'horizontalMode':
                isRotetionMode = 'originalTopMode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-horizontal"></i>');
                break;

            case 'originalTopMode':
                isRotetionMode = 'horizontal2Mode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-vertical"></i>');
                break;

            default:
                isRotetionMode = '';
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-horizontal"></i>');
                break;
        }
    });

    $(document).on('click', '.changePageWebDeck', (e) => {
        e.preventDefault();
        WebDeckCustomPage = e.currentTarget.dataset.id;
        LoadAppsInScreen();
    });

    $("#range-volume").change((e) => {
        setWindowsVolume($("#range-volume").val());
    });

    $("#range-volume").on('input', function () {
        $("#range-volume-demo").html(this.value);
    });
});

const start_get_data = async () => {
    try {
        $.post(`${location.origin}/get_data_user`, async (data) => {
            if (data != null) {
                _all.data_user = data;
                if (await CheckIsUpdateList(data)) {
                    if (_NW.formatView != _all.data_user.web.formatView)
                        webDeckPage = 1;
                    _all.json_data = await JSON.stringify(data.programs);
                    _all.L_programs = _all.data_user.programs;
                    LoadAppsInScreen();
                }

                if (parseFloat($("#range-volume").val()) != parseFloat(_all.data_user.windows.volume)) {
                    $("#range-volume").val(_all.data_user.windows.volume);
                    $("#range-volume-demo").html(_all.data_user.windows.volume);
                }
                $("#custom-style").html(data.css);
            }
            setTimeout(start_get_data, 1000);
        });
    } catch (error) {
        console.error(error);
        setTimeout(start_get_data, 5000);
    }
}

const CheckIsUpdateList = async (data) => {
    return new Promise(async (resolve) => {
        if (await JSON.stringify(data.programs) != _all.json_data) resolve(true);
        if (_NW.formatView != _all.data_user.web.formatView) resolve(true);
        if (_NW.formatListView != _all.data_user.web.formatListView) resolve(true);
        if (_NW.pages && JSON.stringify(_NW.pages) != JSON.stringify(_all.data_user.web.pages)) resolve(true);
        resolve(false);
    });
}

const setWindowsVolume = (volume) => {
    $.ajax({
        url: `${location.origin}/set_volume`,
        data: JSON.stringify({ volume: volume }),
        type: 'POST',
        contentType: 'application/json',
        success: function (data) {
            //console.log(data);
        }
    });
}

const execut_exe = async (id) => {
    $(`#item-exe-${id}`).css("scale", "1.05");
    setTimeout(() => { $(`#item-exe-${id}`).css("scale", ""); }, 200);
    var item = await _all.L_programs.filter(f => f._id == id)[0];
    if (item != null) {
        var json = JSON.stringify(item);
        $.ajax({
            url: `${location.origin}/execute_exe`,
            data: json,
            type: 'POST',
            contentType: 'application/json',
            success: function (data) {
                //console.log(data);
            }
        });
    }
}

const back_webdeck_page = async (id) => {
    $(`#item-exe-${id}`).css("scale", "1.05");
    setTimeout(() => { $(`#item-exe-${id}`).css("scale", ""); }, 200);
    if (webDeckPage > 1) webDeckPage--;
    LoadAppsInScreen();
}

const next_webdeck_page = async (id) => {
    $(`#item-exe-${id}`).css("scale", "1.05");
    setTimeout(() => { $(`#item-exe-${id}`).css("scale", ""); }, 200);
    webDeckPage++;
    LoadAppsInScreen();
}

const LoadAppsInScreen = async (type = _all.data_user.web.formatView) => {
    ClearAppsInScreen();
    _NW = _all.data_user.web;
    switch (type) {
        case '3x2':
        case '5x3':
        case '8x4':
            SetAppsInScreenModeSTDECK();
            break;

        default:
            _NW.formatView = _all.data_user.web.formatView;
            _NW.formatListView = _all.data_user.web.formatListView;
            $("#contentDefault").show();
            $("html").removeClass('WUD-portrait');
            _all.L_programs.forEach(item => {
                var name = item.name.replace('.exe', '');
                var icone = location.origin + "/src/img/underbot_logo.png";
                if (item.nameCustom.length > 0)
                    name = item.nameCustom;

                let contentText = name;
                /*if (contentText.length >= 14) {
                    contentText = `<marquee>${name}</marquee>`;
                }*/
                $('.exe-list').append(`<li id="item-exe-${item._id}" onclick="execut_exe(${item._id})" class="col exe-item xwh-1 set-rotetionS mb-2 ${isRotetionMode}">
                    <div class="card full-w-h rounded-3 border border-2 rounded cc-border">
                        <div class="exe-item-content">
                            <div class="exe-item-content-icon">
                                <img id="icon-${item._id}" src="${icone}" class="exe-icon">
                            </div>
                            <div class="exe-item-content-text text-center">${contentText}</div>
                        </div>
                    </div>
                </li>`);
                $.ajax({
                    url: `${location.origin}/get_base64`,
                    data: JSON.stringify({ icon: item.iconCustom }),
                    type: 'POST',
                    contentType: 'application/json',
                    success: function (data) {
                        if (data != "")
                            $(`#icon-${item._id}`).attr('src', data);
                    }
                });
            });
            break;
    }
}

const addOPGridCMBack = () => {
    $("#contentGrid .WUD-grid").append(`
        <div class="WUD-grid-item set-rotetionS ${isRotetionMode}" onclick="back_webdeck_page()">
            <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                <div class="exe-item-content">
                    <div class="exe-item-content-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `);
}

const addOPGridCMNext = () => {
    $("#contentGrid .WUD-grid").append(`
        <div class="WUD-grid-item set-rotetionS ${isRotetionMode}" onclick="next_webdeck_page()">
            <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                <div class="exe-item-content">
                    <div class="exe-item-content-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `);
}

const ClearAppsInScreen = async () => {
    $("#contentGrid").hide();
    $("#contentDefault").hide();
    $('.exe-list').html("");
    $("#contentGrid .WUD-grid").html('');
    $("#contentGrid .WUD-grid").removeClass(`m${_NW.formatView}`);
}

const SetAppsInScreenModeSTDECK = async () => {
    $("#contentGrid").show();
    $("html").addClass('WUD-portrait');
    $("#contentGrid .WUD-grid").removeClass(`m${_NW.formatView}`);
    $("#contentGrid .WUD-grid").addClass(`m${_all.data_user.web.formatView}`);
    _NW = _all.data_user.web;
    if (_NW.formatListView == 'default') {
        switch (_all.data_user.web.formatView) {
            case '3x2':
            case '5x3':
            case '8x4':
                break;

            default:
                return LoadAppsInScreen('default');
        };

        LoaditensGridDFWebDeck();
    }
    else {
        switch (_all.data_user.web.formatView) {
            case '3x2':
            case '5x3':
            case '8x4':
                break;

            default:
                return LoadAppsInScreen('default');
        };

        LoadGridPagesWebDeck();
    }
}

const LoaditensGridDFWebDeck = async () => {
    let split, rows, cols, posAddBack, countPerPage, count, pages, start, end, L_programs = [];
    split = _all.data_user.web.formatView.split('x');
    rows = parseInt(split[0]);
    cols = parseInt(split[1]);
    posAddBack = rows * (cols - 1);
    countPerPage = rows * cols;
    count = _all.L_programs.length;
    if (webDeckPage == 1) {
        start = 0;
        end = (countPerPage - 1);
        pages = Math.ceil(count / (countPerPage - 1));
        countPerPage = (countPerPage - 1);
    }
    else if (webDeckPage > 1) {
        start = (countPerPage - 1);
        end = start + ((webDeckPage - 1) * (countPerPage - 2));
        if (webDeckPage > 2)
            start = end - (start - 1);
        pages = Math.ceil(count / (countPerPage - 2));
        countPerPage = (countPerPage - 2);
    }

    L_programs = _all.L_programs.slice(start, end);
    if (L_programs.length < countPerPage) posAddBack = 0;
    if (L_programs.length == 0) addOPGridCMBack();

    L_programs.forEach(item => {
        if (webDeckPage != 1) {
            if (L_programs[posAddBack] == item) {
                addOPGridCMBack();
            }
        }

        let name = item.name.replace('.exe', '');
        let icone = location.origin + "/src/img/underbot_logo.png";
        if (item.nameCustom.length > 0)
            name = item.nameCustom;
        let contentText = name;

        $("#contentGrid .WUD-grid").append(`
            <div class="WUD-grid-item set-rotetionS ${isRotetionMode}" id="item-exe-${item._id}" onclick="execut_exe(${item._id})">
                <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                    <div class="exe-item-content">
                        <div class="exe-item-content-icon">
                            <img id="icon-${item._id}" src="${icone}" class="exe-icon">
                        </div>
                        <div class="exe-item-content-text text-center">${contentText}</div>
                    </div>
                </div>
            </div>
        `);

        $.ajax({
            url: `${location.origin}/get_base64`,
            data: JSON.stringify({ icon: item.iconCustom }),
            type: 'POST',
            contentType: 'application/json',
            success: function (data) {
                if (data != "")
                    $(`#icon-${item._id}`).attr('src', data);
            }
        });

        if (webDeckPage < pages && _all.L_programs.slice(end, _all.L_programs.length).length > 0) {
            if (L_programs[L_programs.length - 1] == item) {
                addOPGridCMNext();
            }
        }
    });
}

const LoadGridPagesWebDeck = async () => {
    var pages = _NW.pages;
    if (WebDeckCustomPage == null) WebDeckCustomPage = pages[0].id;

    var Page = pages.find(f => f.id == WebDeckCustomPage);
    if (Page == null) {
        WebDeckCustomPage = pages[0].id;
        Page = pages.find(f => f.id == WebDeckCustomPage);
    }

    Page.items.forEach(item => {
        var app = null;
        if (item.app != null) {
            app = _all.L_programs.find(f => f._id == item.app._id);
            if (app == null) app = _NW.pages.find(f => f.id == item.app._id);
        }
        let icone = location.origin + "/src/img/underbot_logo.png";

        if (app == null) {
            $("#contentGrid .WUD-grid").append(`
                <div class="WUD-grid-item set-rotetionS ${isRotetionMode}">
                    <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                        <div class="exe-item-content">
                            <div class="exe-item-content-icon">
                                
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
        else {
            if (app.type == 'page' || app.type == 'home') {
                $("#contentGrid .WUD-grid").append(`
                    <div class="WUD-grid-item changePageWebDeck set-rotetionS ${isRotetionMode}" data-id="${app.id}">
                        <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                            <div class="exe-item-content">
                                <div class="exe-item-content-icon">
                                    <img id="icon-page-${app.id}" src="${icone}" class="exe-icon">
                                </div>
                                <div class="exe-item-content-text text-center">
                                    <div><i class="bi bi-folder-symlink-fill"></i> ${app.name}</div>
                                    <div style="display: none;"><marquee><i class="bi bi-folder"></i> ${app.name}</marquee></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                $.ajax({
                    url: `${location.origin}/get_base64`,
                    data: JSON.stringify({ icon: app.icon }),
                    type: 'POST',
                    contentType: 'application/json',
                    success: function (data) {
                        if (data != "")
                            $(`#icon-page-${app.id}`).attr('src', data);
                    }
                });
            }
            else {
                let name = app.name.replace('.exe', '');
                if (app.nameCustom.length > 0)
                    name = app.nameCustom;
                $("#contentGrid .WUD-grid").append(`
                    <div class="WUD-grid-item set-rotetionS ${isRotetionMode}" id="item-exe-${app._id}" onclick="execut_exe(${app._id})">
                        <div class="full-w-h rounded-3 border border-2 rounded cc-border">
                            <div class="exe-item-content">
                                <div class="exe-item-content-icon">
                                    <img id="icon-${app._id}" src="${icone}" class="exe-icon">
                                </div>
                                <div class="exe-item-content-text text-center">
                                    <div><i class="bi bi-filetype-exe"></i> ${name}</div>
                                    <div style="display: none;"><marquee><i class="bi bi-filetype-exe"></i> ${name}</marquee></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                $.ajax({
                    url: `${location.origin}/get_base64`,
                    data: JSON.stringify({ icon: app.iconCustom }),
                    type: 'POST',
                    contentType: 'application/json',
                    success: function (data) {
                        if (data != "")
                            $(`#icon-${app._id}`).attr('src', data);
                    }
                });
            }
        }
    });
}