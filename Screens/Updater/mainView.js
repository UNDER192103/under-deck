document.addEventListener("DOMContentLoaded", function () {
  window.bridge.dataView(dataView);
  window.bridge._lang(_lang);
});

function dataView(event, data) {
  console.log(data)
  if(data.msg != null){
    let elemE = document.getElementById("d-message");
    elemE.innerHTML = data.msg;
  }
}

function _lang(list) {
  console.log(list)
}
