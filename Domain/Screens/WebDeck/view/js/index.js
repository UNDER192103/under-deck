var _all = { data_user: null, list_programs: null, json_data_user: null, isFullScreen: false }, isRotetionMode = '';


$(document).ready(function(){
    start_get_data();

    $(document).on('click', '.bnt-fullscreen', (r) => {
        var elem = document.documentElement;

        function openFullscreen() {
            if (elem.requestFullscreen) {
              elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
              elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
              elem.msRequestFullscreen();
            }
        
            _all.isFullScreen = true;
        }
          
        function closeFullscreen() {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
          }
          _all.isFullScreen = false;
        }
    
        if(!_all.isFullScreen)
            openFullscreen();
        else
            closeFullscreen()
    });

    $(document).on('click', '.bnt-refreshList', (r) => {
        _all = { data_user: null, list_programs: null, json_data_user: null, isFullScreen: _all.isFullScreen };
        update_programs_select();
    })

    $(document).on('click', '.bnt-rotetionMode', (r) => {
        $('.set-rotetionS').removeClass(isRotetionMode);

        switch (isRotetionMode) {
            case '':
                isRotetionMode = 'horizontalMode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-vertical"></i>');
            break;
        
            case 'horizontalMode':
                isRotetionMode = 'originalTopMode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-horizontal"></i>');
            break;

            case 'originalTopMode':
                isRotetionMode = 'horizontal2Mode';
                $('.set-rotetionS').addClass(isRotetionMode);
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-vertical"></i>');
            break;

            default:
                isRotetionMode = '';
                $(".bnt-rotetionMode").html('<i class="bi bi-distribute-horizontal"></i>');
            break;
        }
    });
});

const start_get_data = async () => {
    try {
        $.post(`${location.origin}/get_data_user`, async ( data ) => {
            if(data != null){
                if(JSON.stringify(data) != _all.json_data_user){
                    _all.json_data_user = JSON.stringify(data);
                    _all.data_user = data;
                    _all.list_programs = _all.data_user.programs;
                    $("#custom-style").html(data.css);
                    update_programs_select();
                }
                else{
                    //console.log("Existe")
                }
            }
            setTimeout(start_get_data, 1000);
        }).error(()=>{
        });
    } catch (error) {
        setTimeout(start_get_data, 5000);
    }
}

const execut_exe = async (id) =>{
    $(`#item-exe-${id}`).css("scale", "1.05");
    setTimeout(()=>{$(`#item-exe-${id}`).css("scale", "");}, 200);
    var item = await _all.list_programs.filter(f => f._id == id)[0];
    if(item != null){
        var json = JSON.stringify(item);
        $.ajax({
            url: `${location.origin}/execute_exe`,
            data: json,
            type: 'POST',
            contentType: 'application/json',
            success: function(data){
                console.log(data);
            }
        });
    }
}

const update_programs_select = async (list = _all.list_programs) => {
    $('.exe-list').html("");
    list.forEach(item => {
        var name = item.name.replace('.exe', '');
        var icone = location.origin+"/src/img/underbot_logo.png";
        if(item.nameCustom.length > 0)
            name = item.nameCustom;
        $('.exe-list').append(`<li id="item-exe-${item._id}" onclick="execut_exe(${item._id})" class="col exe-item xwh-1 set-rotetionS mb-2 ${isRotetionMode}">
            <div class="exe-item-content">
                <div class="exe-item-content-icon">
                    <img id="icon-${item._id}" src="${icone}" class="exe-icon">
                </div>
                <div class="exe-item-content-text text-center">${name}</div>
            </div>
            
        </li>`);
        $.ajax({
            url: `${location.origin}/get_base64`,
            data: JSON.stringify({icon: item.iconCustom}),
            type: 'POST',
            contentType: 'application/json',
            success: function(data){
                if(data != "")
                    $(`#icon-${item._id}`).attr('src', data);
            }
        });
    });
}