document.addEventListener("DOMContentLoaded", function () {
  window.bridge.dataView(dataView);
});

function dataView(event, data) {
  console.log(data)
  if(data.msg != null){
    let elemE = document.getElementById("d-message");
    elemE.innerHTML = data.msg;
  }
}
