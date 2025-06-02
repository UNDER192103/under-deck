let stylesAnimmetedC = ['animate__slideInDown', /*'animate__slideInLeft',*/ 'animate__slideInRight', 'animate__slideInUp'];
let styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
let listThemesToDownload = [];
let animations = {
    config: {
        duration: 1000,
        delay: 0,
    },
    list: require(MAIN_DIR + "/Repository/data/animations-list.json").list,
}

if (DAO.DB.get('isEnableAnimations') == true) {
    $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
}

// Pre loads //
loadOptions();
// Pre loads //

$(document).ready(async () => {

    $("#s-enAnimations").change(async () => {
        enbAnimations($("#s-enAnimations").val());
    });

    $("#s-Manimations").change(async () => {
        selectModelAnimation($("#s-Manimations").val());
    });

    $("#s-animation").change(async () => {
        selectAnimation($("#s-animation").val());
    });

    $("#btn-animation-duration").click(async () => {
        setDurationAnimation($("#animation-duration").val());
    });

    $("#get_list_themes").click(async () => {
        if ($("#collapseLThemes").hasClass('collapse show')) {
            $("#list-themes-to-download").html('');
            $("#list-themes-to-download").footable().trigger('footable_resize');
        }
        else
            await GetListThemes();
    });

    $(document).on('click', '.btn-uninstall-themeD', (e) => {
        B_are_you_sure().then(async (result) => {
            if (result) {
                let theme = DAO.ThemesData.list.find(x => x.tid == e.target.id);
                let themesLocal = await DAO.THEMES.get('local');
                let themesRemote = await DAO.THEMES.get('remote');
                await DAO.THEMES.set('local', themesLocal.filter(x => x.tid != e.target.id));
                await DAO.THEMES.set('remote', themesRemote.filter(x => x.tid != e.target.id));
                $(".isLocated_in#" + e.target.id).html('N/A');
                $(".btn-uninstall-themeD#" + e.target.id).hide();
                $(".btn-addnew-themeD#" + e.target.id).show();
                if (await DAO.DB.get('bd_theme') == theme.tid) {
                    await DAO.DB.set('bd_theme', 'light');
                }
                loadThemesOptions(true);
                await GetListThemes();
                if (theme.isLocal) {
                    fs.rmSync(path.join(DAO.THEME_DIR, path.dirname(theme.css)), { recursive: true, force: true });
                }
                toaster.success(getNameTd('.theme_successfully_removed_text'));
            }
        });

    });

    $(document).on('click', '.btn-apply-themeD', (e) => {

        selectTheme(e.target.id);
        $(".btn-apply-themeD#" + e.target.id).hide('slow');
        toaster.success(getNameTd('.theme_successfully_removed_text'));

    });

    $(document).on('click', '.btn-addnew-themeD', (e) => {
        let theme = listThemesToDownload.find(x => x.tid == e.target.id);
        bootbox.dialog({
            title: `<h3>${getNameTd('.Notice_text')}</h3>`,
            message: `
                ${getNameTd('.theme_add_description_text')}
                <br>
                ${theme.description}
            `,
            buttons: {
                remote: {
                    label: getNameTd('.remoted_link_text_icon'),
                    className: 'btn-info ',
                    callback: function () {
                        SetRemoteTheme(e.target.id);
                    }
                },
                download: {
                    label: getNameTd('.download_text_icon'),
                    className: 'btn-success download_text_icon',
                    callback: function () {
                        StartDownloadTheme(e.target.id);
                    }
                }
            },
        });
    });

    if (DAO.DB.get('checkThemes') == true) {
        if (DAO.ThemesData && DAO.ThemesData.list.length > 0) {
            try {
                API.App.post('', {
                    _lang: await DAO.DB.get('lang_selected'),
                    method: "list-themes",
                })
                    .then(async (res) => {
                        var response = res.data;
                        if (response && response.result) {
                            listThemesToDownload = response.result;
                            DAO.ThemesData.list.forEach((theme, index) => {
                                if (theme.isLocal) {
                                    let dirFileCss = path.join(DAO.THEME_DIR, theme.name, 'style.css');
                                    let dirFileBck = path.join(DAO.THEME_DIR, theme.name, theme.filename);
                                    if (!fs.existsSync(dirFileCss) || !fs.existsSync(dirFileBck)) {
                                        setTimeout(() => {
                                            StartDownloadTheme(theme.tid, true);
                                        }, (index + 1) * 1000);
                                    }

                                }
                            });
                            await DAO.DB.set('checkThemes', false);
                        }
                    })
                    .catch(error => { });
            } catch (error) {
            }
        }
    }
});

async function SetRemoteTheme(id) {
    let theme = listThemesToDownload.find(x => x.tid == id);
    if (theme) {
        let listNow = await DAO.THEMES.get('remote');
        $(".isLocated_in#" + id).html(getNameTd('.remoted_text'));
        if (listNow.find(x => x.tid == theme.tid)) {
            $(".btn-uninstall-themeD#" + id).show();
            $(".btn-addnew-themeD#" + id).hide();
            bootbox.alert({
                title: `<h3>${getNameTd('.warning_text')}</h3>`,
                message: `${getNameTd('.theme_already_added_text')}`
            });
            return;
        }
        else {
            theme.isLocal = false;
            await DAO.THEMES.push('remote', theme);
            $(".btn-uninstall-themeD#" + id).show();
            $(".btn-addnew-themeD#" + id).hide();
            toaster.success(getNameTd('.Added_successfully'));
            loadThemesOptions();
            await GetListThemes();
        }
    }
}

async function StartDownloadTheme(id, forceDownload = false) {
    let theme = listThemesToDownload.find(x => x.tid == id);
    if (theme) {
        let listNow = await DAO.THEMES.get('local');
        if (!listNow.find(x => x.tid == theme.tid) || forceDownload == true) {
            toaster.primary(getNameTd('.downloading_theme_text'));
            CreateFolderTheme(theme).then(async (theme) => {
                DownloadThemeCss(theme).then(async (theme) => {
                    DownloadThemeBackground(theme).then(async (theme) => {
                        theme.isLocal = true;
                        if (DAO.ThemesData.list.find(x => x.tid == id) == null)
                            await DAO.THEMES.push('local', theme);
                        toaster.success(getNameTd('.theme_download_completed_text'));
                        $(".btn-uninstall-themeD#" + theme.tid).show();
                        $(".btn-addnew-themeD#" + theme.tid).hide();
                        $(".isLocated_in#" + theme.tid).html(getNameTd('.locally_text'));
                        loadThemesOptions();
                        await GetListThemes();

                        if (forceDownload == true && DAO.DB.get('bd_theme') == id) {
                            selectTheme(id);
                        }
                    }).catch(async (err) => {
                        console.log(err);
                        toaster.danger(getNameTd('.error_downloading_theme_text'));
                    });
                }).catch(async (err) => {
                    console.log(err);
                    toaster.danger(getNameTd('.error_downloading_theme_text'));
                });
            });
        }
        else {
            $(".btn-uninstall-themeD#" + id).show();
            $(".btn-addnew-themeD#" + id).hide();
            bootbox.alert({
                title: `<h3>${getNameTd('.warning_text')}</h3>`,
                message: `${getNameTd('.theme_already_added_text')}`
            });
        }
    }
}

async function CreateFolderTheme(theme) {
    return new Promise(async (resolve) => {
        let dir = path.join(theme.name);
        let dirToS = path.join(DAO.THEME_DIR, dir);
        if (!fs.existsSync(dirToS)) {
            await fs.mkdirSync(dirToS, { recursive: true });
        }
        theme.dir = dir;
        theme.THEME_DIR = DAO.THEME_DIR;
        resolve(theme);
    });
}

async function DownloadThemeCss(theme) {
    return new Promise(async (resolve, reject) => {
        axios.get(theme.uri_css, {
            responseType: 'blob'
        }).then(async response => {
            let dirFileCss = path.join(theme.THEME_DIR, theme.dir, 'style.css');
            let blobFile = await new Blob([response.data], { type: response.data.type });
            let buffer = await Buffer.from(await blobFile.arrayBuffer());
            await fs.writeFileSync(dirFileCss, buffer);
            theme.css = path.join(theme.dir, 'style.css');;
            resolve(theme);
        }).catch(err => {
            reject(null);
        });
    });
}

async function DownloadThemeBackground(theme) {
    return new Promise(async (resolve, reject) => {
        axios.get(theme.uri_bck, {
            responseType: 'blob'
        }).then(async response => {
            let dirFileBck = path.join(theme.THEME_DIR, theme.dir, theme.filename);
            let blobFile = await new Blob([response.data], { type: response.data.type });
            let buffer = await Buffer.from(await blobFile.arrayBuffer());
            await fs.writeFileSync(dirFileBck, buffer);
            theme.uri = path.join(theme.dir, theme.filename);
            delete theme.THEME_DIR;
            delete theme.dir;
            resolve(theme);
        }).catch(err => {
            reject(null);
        });
    });
}

async function setDurationAnimation(duration) {
    if (!duration) {
        duration = 500;
    }
    duration = parseFloat(duration);
    $("#sAnimationDr").html(`
        :root {
            --animate-duration: ${duration}ms;
        }
    `);
    $("#animation-duration").val(duration);
    await DAO.DB.set('AnimationDuration', duration);
}

function enbAnimations(isEnb) {
    if (isEnb == "true" || isEnb == true) {
        $("#animation-duration").prop("disabled", false);
        $("#btn-animation-duration").prop("disabled", false);
        $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
        $("#s-enAnimations option[value='true']").prop("selected", true);
        $("#s-Manimations").prop("disabled", false);
        let value = $("#s-Manimations").val();
        if (value != "random") {
            $("#s-animation").prop("disabled", false);
        }
        else {
            $("#s-animation").prop("disabled", true);
            $("#s-animation option[value='random']").prop("selected", true);
        }
        setDurationAnimation(DAO.DB.get('AnimationDuration'));
        DAO.DB.set('isEnableAnimations', true);
    }
    else {
        $("#animation-duration").prop("disabled", true);
        $("#btn-animation-duration").prop("disabled", true);
        $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
        $("#s-enAnimations option[value='false']").prop("selected", true);
        $("#s-Manimations").prop("disabled", true);
        $("#s-animation").prop("disabled", true);
        DAO.DB.set('isEnableAnimations', false);
    }
}

async function selectModelAnimation(type) {
    if (type != "random" && type != null) {
        $("#animation-duration").prop("disabled", false);
        $("#btn-animation-duration").prop("disabled", false);

        if (DAO.DB.get('isEnableAnimations') == true) {
            $("#s-Manimations").prop("disabled", false);
            $("#s-animation").prop("disabled", false);
        }
        $("#s-animation option.RM").remove();
        let filt = animations.list.filter(f => f.id == type)[0];
        if (filt) {
            await selectAnimation('random');
            filt.list.forEach(f => {
                $("#s-animation").append(`<option value="${f.id}" class="RM">${f.name}</option>`);
            });
        }
        $("#s-Manimations option[value='" + type + "']").prop("selected", true);
        DAO.DB.set('modelAnimation', type);
    }
    else {
        DAO.DB.set('modelAnimation', 'random');
        $("#s-animation option.RM").remove();
        await selectAnimation('random');
        if (DAO.DB.get('isEnableAnimations') == false)
            $("#s-Manimations").prop("disabled", true);
        $("#s-animation").prop("disabled", true);
        $("#s-Manimations option[value='random']").prop("selected", true);
    }
}

async function selectAnimation(type) {
    if (type != "random" && type != null) {
        $("#s-animation option[value='" + type + "']").prop("selected", true);
        await DAO.DB.set('animation', "animate__" + type);
    }
    else {
        DAO.DB.set('animation', 'random');
        $("#s-animation option[value='random']").prop("selected", true);
    }
}

async function GetListThemes() {
    try {
        API.App.post('', {
            _lang: await DAO.DB.get('lang_selected'),
            method: "list-themes",
        })
            .then(async (res) => {
                var response = res.data;
                if (response && response.result) {
                    listThemesToDownload = response.result;
                    $("#list-themes-to-download").html('');
                    listThemesToDownload.forEach(async Item => {
                        let is_installed = await DAO.ThemesData.list.find(x => x.tid == Item.tid);
                        let isLocatedPc = 'N/A';
                        if (is_installed) {
                            if (is_installed.isLocal == true) {
                                isLocatedPc = getNameTd('.locally_text');
                            }
                            else {
                                isLocatedPc = getNameTd('.remoted_text');
                            }
                        }
                        $("#list-themes-to-download").append(`
                            <tr class="hover-color-primary animate__animated animate__headShake footable-even" style="">
                                <td>${Item.name}</td>
                                <td>${Item.size} MB</td>
                                <td class="isLocated_in" id="${Item.tid}">${isLocatedPc}</td>
                                <td>
                            ${is_installed ?
                                `<button id="${Item.tid}" type="button" class="btn btn-xs btn-success isDownloaded btn-apply-themeD apply_icon_text">${getNameTd('.apply_icon_text')}</button>` :
                                `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-apply-themeD apply_icon_text">${getNameTd('.apply_icon_text')}</button>`
                            }
                            ${is_installed ?
                                `<button id="${Item.tid}" type="button" class="btn btn-xs btn-danger btn-uninstall-themeD remove_icon">${getNameTd('.remove_icon')}</button>` :
                                `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-danger btn-uninstall-themeD remove_icon">${getNameTd('.remove_icon')}</button>`
                            }
                            ${!is_installed ?
                                `<button id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-addnew-themeD add_text_icon">${getNameTd('.add_text_icon')}</button>` :
                                `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-addnew-themeD add_text_icon">${getNameTd('.add_text_icon')}</button>`
                            }
                                </td>
                            </tr>
                        `);
                        if (Item == listThemesToDownload[listThemesToDownload.length - 1]) {
                            setTimeout(() => {
                                $("#list-themes-to-download").footable().trigger('footable_resize');
                            }, 200);
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    } catch (error) {
    }

}

async function loadOptions() {
    enbAnimations(DAO.DB.get('isEnableAnimations'));
    animations.list.forEach(Item => {
        $("#s-Manimations").append(`
            <option value="${Item.id}">${Item.name}</option>
        `);
    });
    let opt = await DAO.DB.get('modelAnimation');
    let typeAnimation = await DAO.DB.get('animation');
    if (opt != 'random' && opt != null) {
        $("#s-Manimations").prop("disabled", false);
        $("#s-animation").prop("disabled", false);
        $("#s-Manimations option[value='" + opt + "']").prop("selected", true);
        let filt = animations.list.filter(f => f.id == opt)[0];
        if (filt) {
            filt.list.forEach(f => {
                let isSelected = "";
                if ("animate__" + f.id == typeAnimation) {
                    isSelected = "selected";
                }
                $("#s-animation").append(`<option value="${f.id}" ${isSelected} class="RM">${f.name}</option>`);
            });
        }
    }
}