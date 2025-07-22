document.getElementById('isEnableCloudIntegrations').checked = DAO.CLOUD.get('isEnbCloudIntegrations');
document.getElementById('isActivateOverlay').checked = DAO.DB.get('isActivateOverlay');
document.getElementById('start-with-system').checked = DAO.DB.get('startWithSystem');
document.getElementById('key-macro').checked = DAO.DB.get('keyEvent');
document.getElementById('notifications_on_windows').checked = DAO.DB.get('App_notification_windows');
document.getElementById('isMinimizeToBar').checked = DAO.DB.get('isMinimizeToBar');
document.getElementById('autoupdateonestart').checked = DAO.DB.get('AutoUpdateApp');
document.getElementById('isNotValidFirstSearchUpdateApp').checked = DAO.DB.get('isNotValidFirstSearchUpdateApp');
$(".key-overlay-r").html(DAO.DB.get('keys-overlay') ? DAO.DB.get('keys-overlay').join(' + ') : "N/A");

$(document).ready(async () => {
    changeInputColor();
    changeUrlRemoteUnderDeck();

    $("#BTN_cloud_stc").attr('disabled', DAO.CLOUD.get('isEnbCloudIntegrations') ? false : true);
    $("#BTN_cloud_sfc").attr('disabled', DAO.CLOUD.get('isEnbCloudIntegrations') ? false : true);

    $('#notifications_on_windows').click(async function () {
        await DAO.DB.set('App_notification_windows', document.getElementById('notifications_on_windows').checked);
    });

    $('#isMinimizeToBar').click(async function () {
        await DAO.DB.set('isMinimizeToBar', document.getElementById('isMinimizeToBar').checked);
    });

    $('#start-with-system').click(async function () {
        //await DAO.DB.set('startWithSystem', document.getElementById('start-with-system').checked);
        await BACKEND.Send('SetStartWithSystem', document.getElementById('start-with-system').checked);
    });

    $('#isEnableCloudIntegrations').click(async function () {
        $("#BTN_cloud_stc").attr('disabled', document.getElementById('isEnableCloudIntegrations').checked ? false : true);
        $("#BTN_cloud_sfc").attr('disabled', document.getElementById('isEnableCloudIntegrations').checked ? false : true);
        await DAO.CLOUD.set('isEnbCloudIntegrations', document.getElementById('isEnableCloudIntegrations').checked);
    });

    $('#isActivateOverlay').click(async function () {
        await DAO.DB.set('isActivateOverlay', document.getElementById('isActivateOverlay').checked);
    });

    //Cloud

    $("#BTN_cloud_stc").click(async () => {
        if (DAO.USER) {
            if (await B_are_you_sure()) {
                IsFirstPercentSUDP = true;
                $("body").modalLoading('show', false);
                $("#BTN_cloud_stc").prop('disabled', true);
                $("#BTN_cloud_dcs").prop('disabled', true);
                $("#BTN_cloud_sfc").prop('disabled', true);
                $("#isEnableCloudIntegrations").prop('disabled', true);
                BACKEND.Send('sync-user-data').then((response) => {
                    $("#BTN_cloud_stc").prop('disabled', false);
                    $("#BTN_cloud_dcs").prop('disabled', false);
                    $("#BTN_cloud_sfc").prop('disabled', false);
                    $("#isEnableCloudIntegrations").prop('disabled', false);
                    $(".progressBarCloud").hide('slow');
                    $("#DVIL_percentage_cloud").addClass('hidden');
                    $("body").modalLoading('hide', false);
                    toaster.success(getNameTd('.Data_synchronized_successfully'));
                });
            }
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $("#BTN_cloud_sfc").click(async () => {
        if (DAO.USER) {
            if (await B_are_you_sure()) {
                $("#BTN_cloud_sfc").attr('disabled', true);
                $("body").modalLoading('show', false);
                BACKEND.Send('get-synchronized-data').then(async (response) => {
                    if (response.dataSynchronized && response.dataSynchronized.length > 0) {
                        $("body").modalLoading('hide', false);
                        $(".progressBarCloud").show('slow');
                        $("#DVIL_percentage_cloud").removeClass('hidden');
                        toaster.warning(getNameTd('.please_wait'));
                        const USERDATAJSONBCKP = JSON.stringify(await DAO.DBUSER.get('user'));
                        updateUNDATAjsons(response, async () => {
                            $("#DVIL_percentage_cloud").addClass('hidden');
                            toaster.success(getNameTd('.Data_synchronized_successfully'));
                            let countTRR = 4;
                            let srtr = null;
                            srtr = setInterval(() => {
                                $('.delayToRelaunch').html(countTRR);
                                if (countTRR <= 0) {
                                    location.reload();
                                    clearInterval(srtr);
                                }
                                countTRR--;
                            }, 1000);
                            try {
                                await DAO.DB.set('checkThemes', true);
                                await DAO.DB.set('checkLanguage', true);
                                await DAO.DBUSER.set('user', JSON.parse(USERDATAJSONBCKP));
                            } catch (error) { }
                            bootbox.dialog({
                                title: `<h5>${getNameTd('.Tawri5ststc')}</h5>`,
                                message: '<h1 class="delayToRelaunch">5</h1>',
                                closeButton: false,
                            });
                        });
                    }
                    else {
                        $("body").modalLoading('hide', false);
                        $("#BTN_cloud_sfc").attr('disabled', false);
                        toaster.danger(getNameTd('.You_do_not_have_data_to_sync'));
                    }
                });
            }
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $("#BTN_cloud_dcs").click(async () => {
        if (DAO.USER) {
            if (await B_are_you_sure()) {
                $("body").modalLoading('show', false);
                BACKEND.Send('clear-synchronized-data').then((response) => {
                    $("body").modalLoading('hide', false);
                    toaster.success(getNameTd('.Data_deleted_successfully'));
                });
            }
        }
        else {
            toaster.danger(getNameTd('.this_feature_is_only_available_when_logged_into_an_account_text'));
        }
    });

    $(document).on('change', '#UNDCFISFALF', async (e) => {
        if (e.target.files.length > 0) {
            let file = e.target.files[0];
            let splitName = file.name.split('.');
            if (splitName[splitName.length - 1] == 'undcf') {
                if (await B_are_you_sure()) {
                    $("body").modalLoading('show', false);
                    try {
                        var listDBB = JSON.parse(Buffer.from(fs.readFileSync(file.path, 'utf8'), 'base64').toString('utf8'));
                        $("body").modalLoading('hide', false);
                        $(".progressBarCloud").show('slow');
                        toaster.warning(getNameTd('.please_wait'));
                        const USERDATAJSONBCKP = JSON.stringify(await DAO.DBUSER.get('user'));
                        updateUNDATAByLocalFile(listDBB, async () => {
                            toaster.success(getNameTd('.Data_synchronized_successfully'));
                            let countTRR = 4;
                            let srtr = null;
                            srtr = setInterval(() => {
                                $('.delayToRelaunch').html(countTRR);
                                if (countTRR <= 0) {
                                    location.reload();
                                    clearInterval(srtr);
                                }
                                countTRR--;
                            }, 1000);
                            try {
                                await DAO.DB.set('checkThemes', true);
                                await DAO.DB.set('checkLanguage', true);
                                if (USERDATAJSONBCKP != null && USERDATAJSONBCKP != 'null')
                                    await DAO.DBUSER.set('user', JSON.parse(USERDATAJSONBCKP));
                            } catch (error) { }
                            bootbox.dialog({
                                title: `<h5>${getNameTd('.Tawri5ststc')}</h5>`,
                                message: '<h1 class="delayToRelaunch">5</h1>',
                                closeButton: false,
                            });
                        });
                    } catch (error) {
                        $(e.target).val('');
                        $("body").modalLoading('hide', false);
                        toaster.danger(getNameTd('.Please_select_the_file_correctly'));
                    }
                }
                else {
                    $(e.target).val('');
                }
            }
            else {
                $(e.target).val('');
                toaster.danger(getNameTd('.Please_select_the_file_correctly'));
            }
        }
        else {
            $(e.target).val('');
        }
    });

    $("#UNDEXPORTFILECF").click(async () => {
        bootbox.confirm(
            {
                closeButton: false,
                title: getNameTd('.Export_settings_to_a_local_file_icon'),
                message: getNameTd('.Dywtetititbf'),
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> ' + getNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> ' + getNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: function (result) {
                    $("body").modalLoading('show', false);
                    ExportUNDConfigFile('', result).then((isExported) => {
                        $("body").modalLoading('hide', false);
                        if (isExported)
                            toaster.success(getNameTd('.File_exported_successfully'));
                    });
                }
            }
        );
    });

    $("#key-overlay").click(() => {
        key_sequence_press = [];
        $("#key-overlay").html(getNameTd(".recording_text")).addClass("pulse-red");
        BACKEND.Send('get_combo_keys', null).then((listKeys) => {
            key_sequence_press = listKeys.map( key => { return { key: key, nameKey: key, keyCode: key, shiftKey: key, ctrlKey: key, altKey: key, metaKey: key, } });
            $("#key-overlay").blur().removeClass("pulse-red").html(getNameTd(".edit_shortcut_text"));
            $(".key-overlay-r").html(listKeys.join(' + '));
            DAO.DB.set('keys-overlay', listKeys);
        });
    });
});

async function updateUNDATAjsons(data, callback, count = 0) {
    let itemNow = data.dataSynchronized[count], percent;
    if (itemNow) {
        try {
            var ___DTRR = JSON.parse(itemNow.value);
            var ___PATHDB = path.join(DAO.DB_DIR, 'UN-DATA');
            var ___PATHDBFILE = path.join(___PATHDB, itemNow.path, itemNow.key);
            const writeFileData = (dataWrite) =>{
                fs.writeFile(___PATHDBFILE, dataWrite, function (err) {
                    setTimeout(() => {
                        percent = (count / data.dataSynchronized.length) * 100;
                        $(".l_percentage_cloud").html(`<span class="ms-1">${percent}%.</span>`);
                        $("#DprogressBarCloud").css('width', `${percent}%`).html(`${percent}%`);
                        count++;
                        updateUNDATAjsons(data, callback, count);
                    }, 250);
                })
            }
            if(itemNow.json_files_cloud){
                try {
                    if(itemNow.key.includes('WEBDECK.json') || itemNow.key.includes('ProgramsExe.json')){
                        let files = JSON.parse(itemNow.json_files_cloud);
                        let convertedValue = JSON.parse(itemNow.value);
                        for (let index = 0; index < files.length; index++) {
                            const dtoF = files[index];
                            if(dtoF.type === "APPSUD" || dtoF.type === "IWUD"){
                                for (let index = 0; index < dtoF.files.length; index++) {
                                    const fileDtata = dtoF.files[index];
                                    const ext = fileDtata.fileName.split('.').pop();
                                    var downloadFile = false, dirFIle = null;
                                    
                                    if(dtoF.type === "APPSUD" && itemNow.key.includes('ProgramsExe.json')){
                                        if(convertedValue.list_programs && Array.isArray(convertedValue.list_programs)){
                                            if(!fileDtata.dirFile.includes(APP_PATH)){
                                                dirFIle = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-exe', `${fileDtata.fileName}`);
                                                downloadFile = true;
                                            }
                                            else{
                                                dirFIle = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
                                                downloadFile = false;
                                            }
                                            convertedValue.list_programs = convertedValue.list_programs.map(item =>{
                                                if(item._id === fileDtata._id){
                                                    item.iconCustom = dirFIle;
                                                }
                                                return item;
                                            });
                                        }
                                    }
                                    else if(dtoF.type === "IWUD" && itemNow.key.includes('WEBDECK.json')){
                                        if(convertedValue.pages && Array.isArray(convertedValue.pages)){
                                             if(!fileDtata.dirFile.includes(APP_PATH)){
                                                dirFIle = path.join(DAO.DB_DIR, 'UN-DATA', 'icons-webpages', `${fileDtata.fileName}`);
                                                downloadFile = true;
                                            }
                                            else{
                                                dirFIle = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
                                                downloadFile = false;
                                            }
                                            convertedValue.pages = convertedValue.pages.map(item =>{
                                                if(item.id === fileDtata.id){
                                                    item.icon = dirFIle;
                                                }
                                                return item;
                                            });
                                        }
                                    }

                                    if(downloadFile && dirFIle){
                                        try {
                                            var response = await axios.get(fileDtata.url, { responseType: 'blob' });
                                            if(response.status === 200){
                                                let blobFile = await new Blob([response.data], { type: response.data.type });
                                                let buffer = await Buffer.from(await blobFile.arrayBuffer());
                                                await fs.writeFileSync(dirFIle, buffer);
                                            }   
                                        } catch (error) {
                                            if(dtoF.type === "APPSUD" && itemNow.key.includes('ProgramsExe.json')){
                                                if(convertedValue.list_programs && Array.isArray(convertedValue.list_programs)){
                                                    dirFIle = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
                                                    convertedValue.list_programs = convertedValue.list_programs.map(item =>{
                                                        if(item._id === fileDtata._id){
                                                            item.iconCustom = dirFIle;
                                                        }
                                                        return item;
                                                    });
                                                }
                                            }
                                            else if(dtoF.type === "IWUD" && itemNow.key.includes('WEBDECK.json')){
                                                if(convertedValue.pages && Array.isArray(convertedValue.pages)){
                                                    dirFIle = path.join(APP_PATH, "/Domain/src/img/underbot_logo.png");
                                                    convertedValue.pages = convertedValue.pages.map(item =>{
                                                        if(item.id === fileDtata.id){
                                                            item.icon = dirFIle;
                                                        }
                                                        return item;
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        itemNow.value = JSON.stringify(convertedValue);
                    }
                    writeFileData(itemNow.value);
                } catch (error) {
                    console.log(error);
                    writeFileData(itemNow.value);
                }
            }
            else{
                writeFileData(itemNow.value);
            }
        } catch (error) {
            percent = (count / data.dataSynchronized.length) * 100;
            $(".l_percentage_cloud").html(`<span class="ms-1">${percent}%.</span>`);
            $("#DprogressBarCloud").css('width', `${percent}%`).html(`${percent}%`);
            count++;
            updateUNDATAjsons(data, callback, count);
        }
    }
    else {
        percent = (count / data.dataSynchronized.length) * 100;
        $(".l_percentage_cloud").html(`<span class="ms-1">${percent}%.</span>`);
        $("#DprogressBarCloud").css('width', `${percent}%`).html(`${percent}%`);
        callback();
    }
}

async function changeInputColor() {
    let background = await DAO.WEBDECK.get('exe-background');
    let color_text = await DAO.WEBDECK.get('exe-color-text');

    $("#webdeck_background_color").val(background);
    $("#webdeck_color_text").val(color_text);
}

function changeUrlRemoteUnderDeck() {
    if (DAO.USER && DAO.PC) {
        let url = `${process.env.API_URL}/client/?ng=webdeck/invite/${DAO.PC.id}/`;
        $(".underdeck_url_invite_remote_version").html(url).val(url);
    }
    else
        $(".underdeck_url_invite_remote_version").html('N/A').val('N/A');
}

async function updateUNDATAByLocalFile(data, callback, count = 0) {
    let itemNow = data[count];
    if (itemNow) {
        try {
            let bufferFile = Buffer.from(itemNow.data, 'base64');
            var ___PATHDB = path.join(DAO.DB_DIR, 'UN-DATA');
            var ___PATHDBFILE = path.join(___PATHDB, itemNow.paths.join('\\'), itemNow.fileName);
            let __ccPath = ___PATHDB;
            itemNow.paths.forEach(pathFF => {
                __ccPath = path.join(__ccPath, pathFF);
                if (!fs.existsSync(__ccPath))
                    fs.mkdirSync(__ccPath);
            });
            fs.writeFile(___PATHDBFILE, bufferFile, function (err) {
                setTimeout(() => {
                    $("#DprogressBarCloud").css('width', `${(count / data.length) * 100}%`).html(`${parseInt((count / data.length) * 100)}%`);
                    count++;
                    updateUNDATAByLocalFile(data, callback, count);
                }, 150);
            });
        } catch (error) {
            $("#DprogressBarCloud").css('width', `${(count / data.length) * 100}%`).html(`${parseInt((count / data.length) * 100)}%`);
            count++;
            updateUNDATAjsons(data, callback, count);
        }
    }
    else {
        $("#DprogressBarCloud").css('width', `${(count / data.length) * 100}%`).html(`${parseInt((count / data.length) * 100)}%`);
        callback();
    }
}

async function ExportUNDConfigFile(_fileName = null, isExportImgs = false) {
    return new Promise(resolve => {
        if (_fileName == null || _fileName == '') _fileName = `Backup Under Deck - ${new Date().toLocaleDateString().replaceAll('/', '-')}`;

        var ___PATHDB = path.join(DAO.DB_DIR, 'UN-DATA');
        ListAllFilesInFolder(___PATHDB).then(async filesToBackup => {
            filesToBackup = filesToBackup.filter(f => !f.includes(path.join(___PATHDB, 'themes')));
            if (!isExportImgs) filesToBackup = filesToBackup.filter(f => f.includes('.json'));
            var files_exported = await filesToBackup.map((file) => {
                let pathFile = file.replace(___PATHDB + '\\', '');
                let splitPath = pathFile.split('\\');
                splitPath.pop();
                let fileName = pathFile.split('\\').pop();
                return {
                    paths: splitPath,
                    mainPath: splitPath[0],
                    fileName: fileName,
                    ext: path.extname(file),
                    size: fs.statSync(file).size,
                    data: fs.readFileSync(file, 'base64'),
                };
            });

            BACKEND.Send('Dialog--SaveFileToPath', {
                data: Buffer.from(await JSON.stringify(files_exported)).toString('base64'),
                ext: ['undcf'],
                nameFile: _fileName,
            }).then(resolve);
        });
    });
}