$(document).ready(async () => {
    DiscordControler.Connect();

    $(document).on('click', '.open-url-Discord-Developer-Portal', async () => {
        exec(`start ${conf.DISCORD.URL_APPS}`);
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