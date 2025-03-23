
$(document).ready(async () => {
    if (!app_un.version)
        app_un.version = await BACKEND.Send('get_version');
    $(".version_app").html(app_un.version);

    $("#button-search-updates").click(() => {
        toaster.warning(getNameTd('.looking_for_updates'));

        $("#button-search-updates").html(`
            <div class="card-content-spinner m-1 ps-5 pe-5">
                <div class="hollow-dots-spinner spinner-center spinnerStyle">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `).prop('disabled', true);

        BACKEND.Send('check_app_update', null).then(response => {
            //$("#button-search-updates").html(getNameTd('.search_updates_text')).prop('disabled', false);
            console.log(response)
        });

    });

    $(`button[data-target="#collapseUpdates"]`).click(async () => {
        if (!$("#collapseUpdates").hasClass('show')) {
            $("#webViewUpdatesGitHub").html(`
                <Iframe class="border rounded iframeUpdate" id="webViewUpdatesGitHubIFrame" src=""
                    width="100%"
                    height="600px"
                    id=""
                    className=""
                    display="block"
                    position="relative"
                />
            `);
            fetch("https://github.com/UNDER192103/under-deck/releases", {
                method: 'GET',
                headers: {
                    'frame-ancestors': '*'
                }
            }).then(async res => {
                console.log(res);
                const blob = await res.blob();
                const urlObject = URL.createObjectURL(blob);
                document.querySelector('iframe').setAttribute("src", urlObject);
            })
                .catch(erro => {
                    console.error(erro)
                    document.querySelector('iframe').setAttribute("src", `${MAIN_DIR}\\Domain\\Screens\\html\\404.html?err=${erro.toString().replaceAll('TypeError:', '')}`);
                });
        }
        else {
            $("#webViewUpdatesGitHub").html('');
        }
    })
});