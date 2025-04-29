const prvt_MAIN_DIR = __dirname.split('\\Domain')[0];
var DAO = require("../../../../Repository/DB.js");
const express = require('express');
const app = express();
const fs = require("fs");
const { exec_program } = require("../../../Comun/Comun.js");
var port = null, server = null, isStarted = false;
var ip = require("ip");

port = DAO.DB.get('server_port');
if (port == null) {
    port = 3000;
    DAO.DB.set('server_port', port);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function start_server(type, callback) {
    if (type == true) {
        if (isStarted == false) {

            app.get('/', (req, res) => {
                res.redirect("/app")
            });

            app.get('/api', (req, res) => {
                res.send('OK');
            });

            app.get('/app', (req, res) => {
                res.sendFile(prvt_MAIN_DIR + '/Domain/Screens/WebDeck/cell-html.html');
            });

            app.post("/get_data_user", async (req, res) => {
                res.send(await GetDataListProgramsForLocalHost());
            });

            app.post("/set_volume", async (req, res) => {
                if (req.body.volume) {
                    let volume = parseInt(req.body.volume);
                    if (volume > 0) {
                        app_un.isMuted = await loudness.getMuted();
                        if (app_un.isMuted) {
                            await loudness.setMuted(false);
                        }
                        await loudness.setVolume(parseInt(volume));
                    }
                    else {
                        await loudness.setMuted(true);
                    }

                    app_un.isMuted = await loudness.getMuted();
                }
                res.send("OK");
            });

            app.post("/execute_exe", async (req, res) => {
                await DAO.GetDataNow();
                exec_program(req.body);
                res.send("Ok");
            });

            app.post("/get_base64", async (req, res) => {
                fs.readFile(req.body.icon, "base64", function (err, buffer) {
                    if (err) {
                        res.send("");
                    } else {
                        res.send("data:image;base64," + buffer);
                    }
                });
            })

            app.all("*", (req, res, next) => {
                if (fs.existsSync(prvt_MAIN_DIR + "\\Domain" + req.originalUrl.replaceAll("%20", " ")))
                    res.sendFile(prvt_MAIN_DIR + "\\Domain" + req.originalUrl.replaceAll("%20", " "));
                else
                    next();
            });

            server = app.listen(port, `${ip.address("public", "ipv4")}` || "localhost", () => {
                //console.log(`Start Sucess LocalServer in: ${port}`)
                isStarted = true;
            });

            callback(`Start Sucess in: ${port}`);
        }
        else {
            callback(`Server is Started in: ${port}`);
        }
    }
    else {
        if (isStarted == true) {
            server.close();
            isStarted = false;
            callback('Stop');
        }
        else {
            //callback('Server Not started');
        }
    }
}

module.exports = {
    start_server
};