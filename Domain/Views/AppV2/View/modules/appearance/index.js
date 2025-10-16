
export async function initialize(isLogger = false) {
  if (isLogger) console.log("Inicializando modulo!");
  LoadEventsAparence();
  RGSFC('ListCustomThemes', []);
  setTimeout(LoadDataAparence, 200);
}

RGSFC('LoadEventsAparence', async function () {
  window.api.on('ProgressDownloadTheme', (percentage) => {
    console.log(percentage);
  })
})

RGSFC('LoadDataAparence', async function () {
  if (GlobalValues.AppData.AppTheme.animations) {
    $("#s-Manimations option.RM").remove();
    $("#s-animation option.RM").remove()
    GlobalValues.AppData.AppTheme.animations.list.forEach(Item => {
      if (GlobalValues.AppData.AppTheme.animations.enabled) {
        $("#s-Manimations").append(`
            <option class="RM" ${GlobalValues.AppData.AppTheme.animations.model == Item.id ? 'selected' : ''} value="${Item.id}">${Item.name}</option>
        `);
        if (GlobalValues.AppData.AppTheme.animations.model == Item.id) {
          Item.list.forEach(f => {
            $("#s-animation").append(`<option ${GlobalValues.AppData.AppTheme.animations.animation == 'animate__' + f.id ? 'selected' : ''} value="${f.id}" class="RM">${f.name}</option>`);
          });
        }
      }
    });
    EnableAnimations(GlobalValues.AppData.AppTheme.animations.enabled);
  }
})

RGSFC('SetDurationAnimation', async function () {
  if (!GlobalValues.AppData.AppTheme.animations.duration) {
    GlobalValues.AppData.AppTheme.animations.duration = 500;
  }
  GlobalValues.AppData.AppTheme.animations.duration = parseFloat(GlobalValues.AppData.AppTheme.animations.duration);
  $("#sAnimationDr").html(`
      :root {
          --animate-duration: ${GlobalValues.AppData.AppTheme.animations.duration}ms;
      }
  `);
  $("#animation-duration").val(GlobalValues.AppData.AppTheme.animations.duration);
})

RGSFC('EnableAnimations', async function (isEnb) {
  if (isEnb == "true" || isEnb == true) {
    GlobalValues.AppData.AppTheme.animations.enabled = true;
    $("#animation-duration").prop("disabled", false);
    $("#btn-animation-duration").prop("disabled", false);
    $(".container-animated-style").addClass(GlobalValues.AppData.AppTheme.animations.model);
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
    await SetDurationAnimation();
  }
  else {
    GlobalValues.AppData.AppTheme.animations.enabled = false;
    $("#animation-duration").prop("disabled", true);
    $("#btn-animation-duration").prop("disabled", true);
    $(".container-animated-style").removeClass(GlobalValues.AppData.AppTheme.animations.model);
    $("#s-enAnimations option[value='false']").prop("selected", true);
    $("#s-Manimations").prop("disabled", true);
    $("#s-animation").prop("disabled", true);
    await SetDurationAnimation();
  }
})

RGSFC('SelectModelAnimation', async function (type) {
  if (type != "random" && type != null) {
    $("#animation-duration").prop("disabled", false);
    $("#btn-animation-duration").prop("disabled", false);

    if (GlobalValues.AppData.AppTheme.animations.enabled == true) {
      $("#s-Manimations").prop("disabled", false);
      $("#s-animation").prop("disabled", false);
    }
    $("#s-animation option.RM").remove();
    let filt = GlobalValues.AppData.AppTheme.animations.list.filter(f => f.id == type)[0];
    if (filt) {
      await SelectAnimation('random');
      filt.list.forEach(f => {
        $("#s-animation").append(`<option value="${f.id}" class="RM">${f.name}</option>`);
      });
    }
    $("#s-Manimations option[value='" + type + "']").prop("selected", true);
    GlobalValues.AppData.AppTheme.animations.model = type;
  }
  else {
    GlobalValues.AppData.AppTheme.animations.model = 'random';
    $("#s-animation option.RM").remove();
    await SelectAnimation('random');
    if (GlobalValues.AppData.AppTheme.animations.enabled == false) $("#s-Manimations").prop("disabled", true);
    $("#s-animation").prop("disabled", true);
    $("#s-Manimations option[value='random']").prop("selected", true);
  }
})

RGSFC('SelectAnimation', async function (type) {
  if (type != "random" && type != null) {
    $("#s-animation option[value='" + type + "']").prop("selected", true);
    GlobalValues.AppData.AppTheme.animations.animation = "animate__" + type;
  }
  else {
    GlobalValues.AppData.AppTheme.animations.animation = 'random';
    $("#s-animation option[value='random']").prop("selected", true);
  }
})

$(document).on('change', '#s-Manimations', async (Event) => {
  await SelectModelAnimation($('#s-Manimations').val());
  await window.api.invoke('UpdateAppThemeAnimations', { ...GlobalValues.AppData.AppTheme.animations, list: [] });
  await GlobalValues.GetAllAppData()
  LoadDataAparence();
})

$(document).on('change', '#s-animation', async (Event) => {
  await SelectAnimation($("#s-animation").val());
  await window.api.invoke('UpdateAppThemeAnimations', { ...GlobalValues.AppData.AppTheme.animations, list: [] });
  await GlobalValues.GetAllAppData()
  LoadDataAparence();
});

$(document).on('change', '#s-enAnimations', async (Event) => {
  await EnableAnimations($('#s-enAnimations').val());
  await window.api.invoke('UpdateAppThemeAnimations', { ...GlobalValues.AppData.AppTheme.animations, list: [] });
  await GlobalValues.GetAllAppData();
  LoadDataAparence();
})

$(document).on('click', '#btn-animation-duration', async (Event) => {
  GlobalValues.AppData.AppTheme.animations.duration = $("#animation-duration").val()
  await SetDurationAnimation();
  await window.api.invoke('UpdateAppThemeAnimations', { ...GlobalValues.AppData.AppTheme.animations, list: [] });
  await GlobalValues.GetAllAppData();
  LoadDataAparence();
});

$(document).on('change', '.s-themes', function (e) {
  e.preventDefault();
  SelectAppTheme($(this).val());
});

RGSFC('SelectAppTheme', async function (type) {
  GlobalValues.SetAppTheme({ tid: type });
});

RGSFC('GetListThemes', async function () {
  try {
    await window.api.invoke('GetThemes').then((data) => {
      if (data && data.appThemes) {
        $("#list-themes-to-download").html('');
        ListCustomThemes = data.appThemes;
        data.appThemes.forEach(async Item => {
          let is_installed = await GlobalValues.appTheme.list.find(x => x.tid == Item.tid);
          let isLocatedPc = 'N/A';
          if (is_installed) {
            if (is_installed.isLocal == true) {
              isLocatedPc = GetNameTd('.locally_text');
            }
            else {
              isLocatedPc = GetNameTd('.remoted_text');
            }
          }
          $("#list-themes-to-download").append(`
            <tr class="hover-color-primary animate__animated animate__headShake footable-even" style="">
              <td>${Item.name}</td>
              <td>${Item.size} MB</td>
              <td class="isLocated_in" id="${Item.tid}">${isLocatedPc}</td>
              <td>
                ${is_installed && Item.tid != GlobalValues.appTheme.idTheme ? `<button id="${Item.tid}" type="button" class="btn btn-xs btn-success isDownloaded btn-apply-themeD apply_icon_text">${GetNameTd('.apply_icon_text')}</button>` : `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-apply-themeD apply_icon_text">${GetNameTd('.apply_icon_text')}</button>` }
                ${is_installed ? `<button id="${Item.tid}" type="button" class="btn btn-xs btn-danger btn-uninstall-themeD remove_icon">${GetNameTd('.remove_icon')}</button>` : `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-danger btn-uninstall-themeD remove_icon">${GetNameTd('.remove_icon')}</button>` }
                ${!is_installed ? `<button id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-addnew-themeD add_text_icon">${GetNameTd('.add_text_icon')}</button>` : `<button style="display: none;" id="${Item.tid}" type="button" class="btn btn-xs btn-success btn-addnew-themeD add_text_icon">${GetNameTd('.add_text_icon')}</button>`}
              </td>
            </tr>
          `);
          if (Item == data.appThemes[data.appThemes.length - 1]) {
            setTimeout(() => {
              $("#list-themes-to-download").parent().footable().trigger('footable_resize');
            }, 200);
          }
        });
      }
    })
  } catch (error) {
  }
});

$(document).on('click', '#get_list_themes', async function (e) {
  setTimeout(async () => {
    if ($("#collapseLThemes").hasClass('show')) {
      await GetListThemes();
    }
    else {
      $("#list-themes-to-download").html('');
      $("#list-themes-to-download").parent().footable().trigger('footable_resize');
    }
  }, 500)
});

$(document).on('click', '.btn-apply-themeD', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  let theme = GlobalValues.appTheme.list.find(f => f.tid == $(this).attr('id'));
  if(theme){
    await GlobalValues.SetAppTheme(theme);
    await GetListThemes();
    toaster.success(GetNameTd('.theme_successfully_removed_text'));
  }
});

$(document).on('click', '.btn-uninstall-themeD', async function (Event) {
  Event.preventDefault();
  Event.stopPropagation();
  let theme = GlobalValues.appTheme.list.find(f => f.tid == $(this).attr('id'));
  if(theme){
    GlobalValues.ModalConfirmAreYouSure().then(async (result) => {
        if (result) {
            $(".isLocated_in#" + $(this).attr('id')).html('N/A');
            $(".btn-uninstall-themeD#" + $(this).attr('id')).hide();
            $(".btn-addnew-themeD#" + $(this).attr('id')).show();
            if (GlobalValues.appTheme.idTheme == theme.tid) {
              await GlobalValues.SetAppTheme({ tid: 'light' });
            }
            else{
              GlobalValues.LoadAppTheme()
            }
            await GetListThemes();
            toaster.success(GetNameTd('.theme_successfully_removed_text'));
        }
    });
  }
});