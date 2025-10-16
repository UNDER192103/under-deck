let stylesAnimmetedC = ['animate__slideInDown','animate__slideInRight', 'animate__slideInUp'];

export default {
    stylesAnimmetedC: stylesAnimmetedC,
    styleNowstylesAnimmetedC: stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))],
    page: localStorage.getItem('page'),
    language: null,
    AppData: null,
    languages: [],
    appTheme: {
        list: [],
        animations: {
            enabled: true,
            model: 'random',
            animation: 'random',
        },
        enabledAnimationsHover: false,
        selected: null
    },

    PathJoin(...args){ return args.join('\\').replaceAll('/','\\'); },

    async InitialGets(){
        await this.GetLanguages();
        await this.GetAllAppData();
        $(document).on('change', '.s-languages', async function (e) {
            e.preventDefault();
            await GlobalValues.SetLanguage($(this).val());
        });
    },

    async GetAllAppData(){
        this.AppData = await window.api.invoke('GetAllAppData');
    },

    async InitialChanges(){
        await this.ChangeLanguage();
        await this.LoadAppTheme();
        await this.LoadLastPageOpen();
        await $('.footable').footable();
        $(".version_app").html(this.AppData.AppVersion);
        $('button[data-toggle="collapse"]').click((e) => {
            var id = $(e.target).attr("aria-controls");
            $(`#${id}`).collapse('toggle');
        });
    },

    async GetLanguages() {
        this.language = await window.api.invoke('LANG_LIST');
        this.languages = await window.api.invoke('LIST_LANGS');
    },

    async ChangeLanguage(){
        $(".icone-selected-lang").attr("src", this.language.icon);
        $(".s-languages").html('');
        $.each(this.languages, (lang_id) => {
            let lang = this.languages[lang_id];
            $(".s-languages").append(`<option value="${lang_id}" ${this.language.id == lang_id ? 'selected' : ''}>${lang.name}</option>`);
            $(`.dir-icon-${lang_id}`).attr('src', lang.icon);
        });
        this.language.data.forEach(item => {
            if (item.type == "tooltip_t") {
                try { $(item.id).tooltip('dispose') } catch (error) { }
                $(item.id).attr("title", item.text).tooltip();
            }
            else {
                if (item.css != null) $(item.id)[item.type](item.text).css(item.css); else $(item.id)[item.type](item.text);
            }
        });
    },

    async SetLanguage(Lang){
        await this.GetLanguages();
        if(this.languages[Lang && Lang.id ? Lang.id : Lang]){
            this.language = this.languages[Lang && Lang.id ? Lang.id : Lang];
            await window.api.invoke('SET_LANG', this.language.id);
            try {
                $.post("https://undernouzen.shop?ng=language/select/", { lang: this.language.id })
                .done(function (data) { });   
            } catch (error) {}
        }
        await this.ChangeLanguage();
    },

    async SetAppTheme(Theme){
        await window.api.invoke('SetAppTheme', Theme);
        if ($("#collapseLThemes").hasClass('show')) {
            await GetListThemes();
        }
        await this.LoadAppTheme();
    },

    async LoadAppTheme(){
        this.appTheme = await window.api.invoke('GetAppTheme');
        $(".s-themes option.RDM").remove();
        if(Array.isArray(this.appTheme.list)){
            this.appTheme.list.forEach(item => {
                $(".s-themes").append(`<option class="RDM" value="${item.tid}">${item.name}</option>`);
            });
        }
        $("body").removeClass().addClass('full-page');
        if(this.appTheme.selected) {
            // Função de codificação robusta para garantir que todos os caracteres especiais sejam tratados.
            const encodePath = (path) => {
                if (!path) return '';
                return path.replaceAll('\\', '/').split('/').map(segment => encodeURIComponent(segment)).join('/');
            };

            if(this.appTheme.selected.type != null) {
                if(this.appTheme.selected.isLocal == true){
                    if(this.appTheme.selected.type == "VIDEO"){
                        $("#custom-theme-stylesheet").attr('href', `syspaththmes://${encodePath(this.appTheme.selected.css)}`);
                        $("#theme-bckI video source").attr('src', `syspaththmes://${encodePath(this.appTheme.selected.uri)}`);
                    }
                    else {
                        $("#custom-theme-stylesheet").attr('href', `syspaththmes://${encodePath(this.appTheme.selected.css)}`);
                        $("#theme-bckI img").attr('src', `syspaththmes://${encodePath(this.appTheme.selected.uri)}`);
                    }
                }
                else{
                    if (this.appTheme.selected.type == "VIDEO") {
                        $("#custom-theme-stylesheet").attr('href', this.appTheme.selected.uri_css);
                        $("#theme-bckI video source").attr('src', this.appTheme.selected.uri_bck);
                    }
                    else {
                        $("#custom-theme-stylesheet").attr('href', this.appTheme.selected.uri_css);
                        $("#theme-bckI img").attr('src', this.appTheme.selected.uri_bck);
                    }
                }
                if (this.appTheme.selected.type == "VIDEO") {
                    $("#theme-bckI img").attr('src', '').hide();
                    $("#theme-bckI video").show().get(0).load();
                    $("#theme-bckI").show();
                }
                else {
                    $("#theme-bckI img").show();
                    $("#theme-bckI video").hide().get(0).load();
                    $("#theme-bckI").show();
                }
            }
            else{
                $("#custom-theme-stylesheet").attr('href', '');
                $("#theme-bckI video source").attr('src', '');
                $("#theme-bckI img").attr('src', '').hide();
                $("#theme-bckI video").get(0).load();
                $("#theme-bckI").hide();
            }

            $(".btn-apply-themeD#" + this.appTheme.selected.tid).hide('slow');
            $("body").addClass('theme-' + this.appTheme.selected.class);
        }
        else{
            $("#custom-theme-stylesheet").attr('href', '');
            $("#theme-bckI video source").attr('src', '');
            $("#theme-bckI img").attr('src', '').hide();
            $("#theme-bckI video").get(0).load();
            $("#theme-bckI").hide();
            $("body").addClass('theme-' + this.appTheme.idTheme);
        }
        
        if(GlobalValues.AppData.AppTheme.animations.enabled){
            $("body").addClass('enb-animations');
        }
        else{
            $("body").removeClass('enb-animations');
        }
        $(`#s-themes option[value="${this.appTheme.idTheme}"]`).prop('selected', true);
        if (this.appTheme.enabledAnimationsHover == "true" || this.appTheme.enabledAnimationsHover == true) { $("body").addClass('enb-animations'); } else { $("body").removeClass('enb-animations'); }
        if(this.appTheme.selected) $(`#s-themes option[value="${this.appTheme.selected.tid}"]`).prop('selected', true);
    },

    async SideBarMenuSelect(MenuId, uC = false){
        if(!MenuId || MenuId === '') return;
        //if (tempBlockSelecMenu == true) return;
        $(`.navs-item-sm`).removeClass('active');
        $(`.nav-item[data-id="${MenuId}"] a`).addClass('active');

        if (localStorage.getItem('page') != MenuId) {
            await this.GetAllAppData();
            if (this.appTheme.animations.enabled == true) {
                if (this.appTheme.animations.model == 'random' || this.appTheme.animations.animation == 'random') {
                    $(".container-animated-style").removeClass(this.styleNowstylesAnimmetedC);
                    stylesAnimmetedC = this.ShuffleArray(stylesAnimmetedC);
                    this.styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
                    $(".container-animated-style").addClass(this.styleNowstylesAnimmetedC);
                }
                else {
                    $(".container-animated-style").removeClass(this.styleNowstylesAnimmetedC);
                    this.styleNowstylesAnimmetedC = this.appTheme.animations.animation;
                    $(".container-animated-style").addClass(this.styleNowstylesAnimmetedC);
                }
            }
            else{
                $(".container-animated-style").removeClass(this.styleNowstylesAnimmetedC);
            }
        }

        if (await localStorage.getItem('page') != MenuId || !uC) {
            $(`.container-hide-control`).removeClass('hidden').hide();
            let page = "";
            if($(`.nav-item[data-id="${MenuId}"]`)[0] && $(`.nav-item[data-id="${MenuId}"]`)[0].dataset) page = $(`.nav-item[data-id="${MenuId}"]`)[0].dataset.did;
            if(page) $(page).removeClass('hidden').fadeIn(500);
        }
        localStorage.setItem('page', MenuId);
        $(".toastify .toast-close").click();
    },

    ShuffleArray(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    async LoadLastPageOpen(){
        $(`.nav-item[data-id="${localStorage.getItem('page')}"] a`).addClass('active');
        if (localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null) {
            this.SideBarMenuSelect(localStorage.getItem('page'));
        }
    },

    async ExecAppByUuid(uuid){
        let App = this.AppData.Apps.find( a => a.uuid == uuid);
        if(App){
            await window.api.invoke('ExecAppByUuid', App.uuid);
        }
        else{
            console.log(...LogerCLR(`App uuid not found`));
        }
    },

    async SendBCUpdateOV(){
        await window.api.invoke('OV-Update-data', {type: 'apps', data: []});
    },

    async UpdateAppsPositions(ListPositions){
        return await window.api.invoke('UpdateAppsPositions', ListPositions);
    },

    AppPath(){
        return window.api.invoke('AppPath');
    },

    SrcAppPathImg(){
        return window.api.invoke('SrcAppPathImg');
    },

    async DialogSelectFile(Types = ['*']){
        return await window.api.invoke('Dialog--SelectFile', {types: Types});
    },

    async ModalConfirmAreYouSure(){
        return new Promise(async resolve => {
            bootbox.confirm({
                message: `<h4 class="are_you_sure_of_that_text">${GetNameTd('.are_you_sure_of_that_text')}</h4>`,
                buttons: {
                    confirm: {
                        label: '<i class="bi bi-check2"></i> ' + GetNameTd('.yes'),
                        className: 'btn-success yes'
                    },
                    cancel: {
                        label: '<i class="bi bi-x-lg"></i> ' + GetNameTd('.no'),
                        className: 'btn-danger not'
                    }
                },
                callback: resolve
            });
        });
    }
}