$(document).ready(async () => {
    DiscordControler.Connect();

    $(document).on('click', '.open-url-Discord-Developer-Portal', async () => {
        exec(`start ${process.env.DISCORD_URL_APPS}`);
    });
    $("#button-login-discord-rpc").click(async () => {
        if (!DiscordControler.isConnected) {
            $("#dc-rpc-clientId").val(await DAO.DISCORD.get('clientId'));
            $("#dc-rpc-clientSecret").val(await DAO.DISCORD.get('clientSecret'));
            $("#modal_discord_integration").modal('show');
        }
        else {
            $("#modal_discord_integration").modal('hide');
            await DAO.DISCORD.set('accessToken', null);
            DiscordControler.Disconnect();
        }
    });
});

async function LoginDiscord() {
    var clientId = $("#dc-rpc-clientId").val();
    var clientSecret = $("#dc-rpc-clientSecret").val();
    $("#dc-rpc-form-alert").hide('slow').html();
    if (clientId.length == 19 && clientSecret.length == 32) {
        await DAO.DISCORD.set('clientId', clientId);
        await DAO.DISCORD.set('clientSecret', clientSecret);
        await DAO.DISCORD.set('accessToken', null);
        $("#modal_discord_integration").modal('hide');
        bootbox.alert(`<h4>${getNameTd('.Please_check_the_discord_application_installed_on_your_machine')}</h4>`);
        DiscordControler.Connect(true);
    }
    else {
        $("#dc-rpc-form-alert").show('slow').html(
            getNameTd('.Please_check_if_the_Client_ID_Application_ID_and_Client_Secret_have_been_entered_correctly')
        );
    }
}