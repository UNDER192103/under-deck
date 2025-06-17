///      Constants      ///
const Electron = require('electron');
const MAIN_DIR = __dirname.split('\\Domain')[0];
const _dirname = MAIN_DIR;
const path = require('path');
const Comun = require(MAIN_DIR + "/Domain/Comun/Comun.js");
const Toaster = require(MAIN_DIR + "/Domain/src/js/toaster.js");
///      Constants      ///




///      App ready      //

$(document).ready(async () => {
    setTimeout(async () => {
        $("#preload-overlay").fadeOut(250);
        $("#main-overlay").fadeIn(500);
    }, 100);
});