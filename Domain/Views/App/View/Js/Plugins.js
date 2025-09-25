
$(document).ready(async () => {
    BACKEND.Send('GetPlugins').then((list) => {
        if(Array.isArray(list)){
            list.forEach(plugin => {
                $(".list-plugins-downlaod tbody").append(`
                  <tr class="hover-color-primary animate__animated animate__headShake" id="pl-${plugin.id}">
                    <td alt="icon"><img width="25px" heigth="25px" src="${plugin.icon}"></td>
                    <td alt="name">${plugin.name}</td>
                    <td alt="dateUpdate">${plugin.dateUpdate}</td>
                    <td alt="version">${plugin.version}</td>
                    <td alt="button"><button type="button" class="btn btn-sm btn-download-pl btn-primary"><i class="bi bi-download"></i> <span class="download_text">${getNameTd('.download_text')}</span></button></td>
                  </tr>
                `);
            });
        }
        else{
            console.log(list)
        }
    });

    $(document).on('click', '.btn-download-pl', (event)=>{
        B_are_you_sure().then((isDownload)=>{
            if(isDownload){
                $(event.currentTarget).prop('disabled', true);
            }
        });
    });
});