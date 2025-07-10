var ListSoundPad = [], pathSoundPadExe = DAO.DB.get('pathSoundPad');
if (pathSoundPadExe != null && pathSoundPadExe != '')
    $("#local-path-soundpad").val(pathSoundPadExe);
else
    $("#local-path-soundpad").val(getNameTd('.select_path_SoundPad_text'));

$(document).ready(async () => {
    pathSoundPadExe = await DAO.DB.get('pathSoundPad');
    $(document).on('click', '#bnt_soundpad_get_list', async () => {
        $("body").modalLoading('show', false);
        GetSoundPadListAudios().then((List) => {
            BACKEND.Send('OV-Update-data', {type: 'soundpad', data: List});
            $("body").modalLoading('hide', false);
            ListSoundPad = List;
            ChangeListSoundPad();
        });
    });

    $("#btn-select-soundpad-exe").click(() => { $("#input-exe-soundpad").click() })

    $("#input-exe-soundpad").change(async () => {
        if ($("#input-exe-soundpad")[0].files[0]) {
            let pathFile = $("#input-exe-soundpad")[0].files[0].path;
            if (pathFile.toLowerCase().includes('soundpad')) {
                pathSoundPadExe = pathFile;
                $("#local-path-soundpad").val(pathFile);
                toaster.success(getNameTd('.PswSpeiisycutic_SUCC_text'));
                await DAO.DB.set('pathSoundPad', pathFile);
            }
            else {
                if (pathSoundPadExe != null && pathSoundPadExe.toLowerCase().includes('soundpad')) {
                    $("#local-path-soundpad").val(pathSoundPadExe);
                }
                else {
                    $("#local-path-soundpad").val(getNameTd('.select_path_SoundPad_text'));
                    pathSoundPadExe = null;
                    await DAO.DB.set('pathSoundPad', null);
                }
                bootbox.alert(getNameTd('.PswSpeiisycutic_ERRO1_text'));
            }
        }
    });

    $("#check-soundpad-exe").click(async () => {
        if (await fs.existsSync(pathSoundPadExe)) {
            exec(`${pathSoundPadExe} -v`, (e) => {
                if (e == null)
                    toaster.success("SoundPad OK!");
                else
                    toaster.danger(getNameTd('.PswSpeiisycutic_ERRO1_text'));
            });
        }
    });

    $(document).on('click', '.btn_play-soundpad', async (e) => {
        exec_soundpad(pathSoundPadExe, e.currentTarget.id);
    });

    $(document).on('click', '.btn_addappplay-soundpad', async (e) => {
        let item = ListSoundPad.find(f => f.index == e.currentTarget.id);
        if (item) {
            add_app.type_exec = "soundpad_audio";
            add_app_for_soundpad_audio(item.hash, null, item.name);
        }
    });

    $('#select-soundpad-audio').change(function () {
        let f = ListSoundPad.filter(f => f.hash == $('#select-soundpad-audio').val());
        if (f[0] != undefined) {
            $("#name-exe-modal-6").val(f[0].name);
        }
    });

    $('#bnt_soundpad_get_list').click();

    setInterval(() => {
        GetSoundPadListAudios().then((List) => {
            ListSoundPad = List;
            ChangeListSoundPad();
        });
    }, 60000 * 5);
});

const ChangeListSoundPad = async () => {
    $("#list-sounds-soundpad").html('');
    $("#select-soundpad-audio .ssa").remove();
    ListSoundPad.forEach(sound => {
        $("#list-sounds-soundpad").append(`
            <tr class="hover-color-primary animate__animated animate__headShake">
                <td>${sound.index}</td>
                <td>${sound.name}</td>
                <td>${sound.artist}</td>
                <td>${sound.duration}</td>
                <td>${sound.addedOn}</td>
                <td>
                    <a id="${sound.index}" class="btn btn-light btn-xs btn_play-soundpad Play_icon_text">${getNameTd('.Play_icon_text')}</a>
                    <a id="${sound.index}" class="btn btn-light btn-xs btn_addappplay-soundpad Add_App_icon_text">${getNameTd('.Add_App_icon_text')}</a>
                </td>
            </tr>
        `);
        $("#select-soundpad-audio").append(`
            <option class="ssa" value="${sound.hash}">${sound.name}</option>
        `)
        if (sound == ListSoundPad[ListSoundPad.length - 1]) {
            var table = $('.footable').footable();
            table.trigger('footable_resize');
        }
    });
}

const GetSoundPadListAudios = async () => {
    return BACKEND.Send('get-list-soundpad-audios');
}