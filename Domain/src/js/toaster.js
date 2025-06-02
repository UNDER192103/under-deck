const Toastify = require('toastify-js');
var is_first_time = true;

const Toastify_exc = (options) => {
  Toastify({
    text: options.text || "",
    duration: options.delay || 3000,
    destination: options.destination || "",
    newWindow: options.newWindow || false,
    close: options.close || true,
    gravity: options.gravity || "bottom", // `top` or `bottom`
    position: options.position || "right", // `left`, `center` or `right`
    stopOnFocus: options.stopOnFocus || true, // Prevents dismissing of toast on hover
    style: options.style || {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    onClick: function () { } // Callback after click
  }).showToast();
}

function primary(text, delay) {
  Toastify_exc({ text: text, delay: delay, style: { background: '#007bff' } });
}

function warning(text, delay) {
  Toastify_exc({ text: text, delay: delay, style: { background: '#ffc107', color: 'black' } });
}

function success(text, delay) {
  Toastify_exc({ text: text, delay: delay, style: { background: '#28a745', 'border-radius': '5px' } });
}

function danger(text, delay) {
  Toastify_exc({ text: text, delay: delay, style: { background: '#dc3545' } });
}

function err(text, delay) {
  Toastify_exc({ text: text, delay: delay, style: { background: '#dc3545' } });
}

const dialog_confirm = (obj, callback) => {
  $('#modal_dialog #title_modal').html("");
  $('#modal_dialog #body_modal').html("");
  $('#modal_dialog #title_modal').html(obj.title);
  $("#deny_modal").show();
  $("#confirm_modal").show();
  if (obj.body != null) {
    $('#modal_dialog #body_modal').html(obj.body);
    $("#body_modal").show();
  }
  else {
    $("#body_modal").hide();
  }

  if (obj.buttons[0] != null) {
    if (obj.buttons[0].text == null)
      $("#confirm_modal").hide();
    else
      $("#confirm_modal").text(obj.buttons[0].text);
  }
  else
    $("#confirm_modal").text(getNameTd(".text_yes"));

  if (obj.buttons[1] != null) {
    if (obj.buttons[1].text == null)
      $("#deny_modal").hide();
    else
      $("#deny_modal").text(obj.buttons[1].text);
  }
  else
    $("#confirm_modal").text(getNameTd(".text_no"));

  $('#modal_dialog').modal('show');
  if (is_first_time == true) {
    $("#confirm_modal").click(() => { callback(true) });
    $("#deny_modal").click(() => { callback(false) });
    $("#btn_close_modal").click(() => { callback(false) });
    is_first_time = false;
  }
}

module.exports = {
  Toastify_exc,
  primary,
  warning,
  success,
  danger,
  err,
  dialog_confirm
};