///      Pre-load server      ///

localServer.start_server(DAO.DB.get('isStartLocalServer'), (r, list) => {
    //console.log(r);
    list_routs = list;
});

///      Pre-load server      ///


///      App ready      ///

$(document).ready(async () => {

    $('#btn-port-local-server').click(async function () {
        let port = $('#port-local-server').val();
        if (port.length == 4 && !isNaN(port)) {
            $('.alert-por-local-server-modal').addClass('hidden');
            GNDATA.server_port = port;
            await DAO.DB.set('server_port', port);
            $('#local-server-adress-acess-url').val(`http://${getMyIPAddress()}:${DAO.DB.get('server_port')}`);
            toaster.success(getNameTd(".s_s_text"))
            if (DAO.DB.get('isStartLocalServer')) {
                setTimeout(() => { location.reload() }, 700);
            }
        }
        else {
            $('.alert-por-local-server-modal').text(getNameTd(".t_p_m_c_4_n_text")).removeClass('hidden');
        }
    });

    $('#button-start-local-server').click(async function () {
        if (DAO.DB.get('isStartLocalServer') == true) {
            $('#button-start-local-server').text(getNameTd(".start_text"))
                .removeClass('btn-danger')
                .addClass('btn-success')
                .addClass('hover-pulse-grean')
                .removeClass('hover-pulse-red');
            await DAO.DB.set('isStartLocalServer', false);
            setTimeout(() => { location.reload(); }, 250);
        }
        else {
            $('#button-start-local-server').text(getNameTd(".stop_text")).addClass('btn-danger').removeClass('btn-success')
                .removeClass('hover-pulse-grean')
                .addClass('hover-pulse-red');
            DAO.DB.set('isStartLocalServer', true);
            localServer.start_server(true, (r) => {
                //console.log(r)
            })
        }
    });

    $('#port-local-server').keypress(function () {
        var maxLength = $(this).val().length;
        if (maxLength >= 4) {
            return false;
        }
    });

    if (DAO.DB.get('isStartLocalServer') == true) {
        $('#button-start-local-server').text(getNameTd(".stop_text"))
            .addClass('btn-danger')
            .removeClass('btn-success')
            .removeClass('hover-pulse-grean')
            .addClass('hover-pulse-red');
    }
    else {
        $('#button-start-local-server').text(getNameTd(".start_text"))
            .addClass('btn-success')
            .removeClass('btn-danger')
            .addClass('hover-pulse-grean')
            .removeClass('hover-pulse-red');
    }

});

///      App ready      ///