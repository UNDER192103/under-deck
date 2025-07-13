

$(document).ready(async () => {
    $(`.nav-item[data-id="${localStorage.getItem('page')}"] a`).addClass('active');
    if (localStorage.getItem('page') != "app-main" && localStorage.getItem('page') != null) {
        selectMenu(localStorage.getItem('page'));
    }
})

$(document).on('click', '#MenuSideMenus li.nav-item', async function (e) {
    e.preventDefault();
    selectMenu(e.currentTarget.dataset.id);
});


async function selectMenu(id, uC = false) {
    if(!id || id === '') return;
    if (tempBlockSelecMenu == true) return;
    $(`.navs-item-sm`).removeClass('active');
    $(`.nav-item[data-id="${id}"] a`).addClass('active');

    if (localStorage.getItem('page') != id) {
        if (DAO.DB.get('isEnableAnimations') == true) {
            if (DAO.DB.get('modelAnimation') == 'random' || DAO.DB.get('animation') == 'random') {
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                stylesAnimmetedC = shuffleArray(stylesAnimmetedC);
                styleNowstylesAnimmetedC = stylesAnimmetedC[Math.floor((Math.random() * stylesAnimmetedC.length))];
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
            else {
                $(".container-animated-style").removeClass(styleNowstylesAnimmetedC);
                styleNowstylesAnimmetedC = DAO.DB.get('animation');
                $(".container-animated-style").addClass(styleNowstylesAnimmetedC);
            }
        }
    }

    if (await localStorage.getItem('page') != id || !uC) {
        $(`.container-hide-control`).removeClass('hidden').hide();
        let page = "";
        if($(`.nav-item[data-id="${id}"]`)[0] && $(`.nav-item[data-id="${id}"]`)[0].dataset) page = $(`.nav-item[data-id="${id}"]`)[0].dataset.did;
        if(page) $(page).removeClass('hidden').fadeIn(500);
    }
    localStorage.setItem('page', id);
    $(".toastify .toast-close").click();
};