var typeOld = "default";

$(document).ready(async () => {
    $("#change-webdeck-view").on("change", async () => {
        var type = $("#change-webdeck-view").val();
        ChangeSelectWebdeckView(type);
    });

    let type = await DAO.WEBDECK.get('format_view');
    if (type == null) type = "8x4";
    $(`#change-webdeck-view option[value="${type}"]`).prop('selected', true);
    ChangeSelectWebdeckView(type);
});

const ChangeSelectWebdeckView = async (type) => {
    $(".wendeckpreview")
        .removeClass(typeOld)
        .addClass(`m-${type}`);
    if (type != 'default') {
        let split = type.split("x");
        setPreviewWebdeck(parseInt(split[0]) * parseInt(split[1]));
    }
    else {
        setPreviewWebdeck(3);
    }
    await DAO.WEBDECK.set('format_view', type);
    typeOld = `m-${type}`;
}

const setPreviewWebdeck = async (count) => {
    $(".wendeckpreview").html(``);
    for (let index = 0; index < count; index++) {
        $(".wendeckpreview").append(`
            <div class="card-oracle-card">
               <div class="card-oracle-card-body card-oracle-back rounded"></div>
            </div>
        `);
    }
}