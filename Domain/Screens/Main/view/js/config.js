

$(document).ready(async () => {
    changeInputColor();
    
    $(document).on('change', '#webdeck_background_color', async (e) => {
        await DAO.WEBDECK.set('exe-background', $("#webdeck_background_color").val());
    });

    $(document).on('change', '#webdeck_color_text', async (e) => {
        await DAO.WEBDECK.set('exe-color-text', $("#webdeck_color_text").val());
    });

    $("#reset_to_default_webdeck_colors").click(async ()=>{
        $("#reset_to_default_webdeck_colors").prop('disabled', true);
        await DAO.WEBDECK.set('exe-background', '#370179');
        await DAO.WEBDECK.set('exe-color-text', '#ffffff');
        changeInputColor();
        $("#reset_to_default_webdeck_colors").prop('disabled', false);
        toaster.success(getNameTd('.successfully_reset_text'));
    });
});

async function changeInputColor() {
    let background = await DAO.WEBDECK.get('exe-background');
    let color_text = await DAO.WEBDECK.get('exe-color-text');

    $("#webdeck_background_color").val(background);
    $("#webdeck_color_text").val(color_text);
}