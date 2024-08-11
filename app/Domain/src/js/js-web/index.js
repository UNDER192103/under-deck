var _all = { list_programs: null, list_programs_json: null, isFullScreen: false }

$(document).ready(function(){
    start_get_data();
});

const start_get_data = async () => {
    try {
        $.post(`${location.origin}/get_data_user`, async ( data ) => {
            if(data != null){
                if(data != _all.list_programs_json){
                    _all.list_programs = JSON.parse(data);
                    _all.list_programs_json = data;
                    update_programs_select();
                }
                else{
                    //console.log("Existe")
                }
            }
            setTimeout(start_get_data, 1000);
        });
    } catch (error) {
        setTimeout(start_get_data, 1000);
    }
}

function fullscreen(){
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
}

const execut_exe = async (id) =>{
    $(`#item-exe-${id}`).css("transform", "scale(1.05)");
    setTimeout(()=>{$(`#item-exe-${id}`).css("transform", "none");}, 200);
    var item = await _all.list_programs.filter(f => f._id == id)[0];
    if(item != null){
        var json = JSON.stringify(item);
        console.log(id)
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
        if(item.iconCustom != null)
            icone = item.iconCustom;
        $('.exe-list').append(`<li id="item-exe-${item._id}" onclick="execut_exe(${item._id})" class="col mb-4 bg-light" data-name="0-circle" data-tags="number numeral" data-categories="shapes">
        <a class="d-block text-body-emphasis text-decoration-none" >
        <div class="bg-body-secondary text-center rounded div-content-img-exe">
            <img src="${icone}" class="img-exe">
        </div>
        <div class="name text-dark div-text-name-exe text-decoration-none text-center">${name}</div>
        </a>
      </li>`)
    });
}