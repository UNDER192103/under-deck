$(".MenuBar .MenuButtons .minimize").click((e)=>{ e.preventDefault(); window.api.invoke('app-minimize', true); });
$(".MenuBar .MenuButtons .maximize").click((e)=>{ e.preventDefault(); window.api.invoke('app-maximize', true); });
$(".MenuBar .MenuButtons .close").click((e)=>{ e.preventDefault(); window.api.invoke('app-close', true); });