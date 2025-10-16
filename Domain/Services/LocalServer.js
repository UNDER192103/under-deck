const express = require('express');
const fs = require("fs");
const path = require('path');

class LocalServer {
    constructor(clientServiceUnderDeck) {
        this.clientServiceUnderDeck = clientServiceUnderDeck;
        this.app = express();
        this.port = null;
        this.ipAddress = null;
        this.server = null;
        this.isStarted = false;

        this.initialize();
    }

    async initialize() {
        this.port = await DAO.DB.get('server_port');
        if (this.port == null) {
            this.port = 3000;
            await DAO.DB.set('server_port', this.port);
        }

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.setupRoutes();
    }

    setupRoutes() {
        this.app.get('/icon/exe/:file', (req, res) => {
            const fileName = req.params.file;
            if (fileName.includes('..')) {
                return res.status(400).send('Invalid file name');
            }
            const filePath = path.join(BASE_PATHS.ICONS_EXE, fileName);
        
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    res.status(404).send('File not found');
                } else {
                    res.sendFile(filePath);
                }
            });
        });

        this.app.get('/icon/webpages/:file', (req, res) => {
            const fileName = req.params.file;
            if (fileName.includes('..')) {
                return res.status(400).send('Invalid file name');
            }
            const filePath = path.join(BASE_PATHS.ICONS_WEBPAGES, fileName);
        
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    res.status(404).send('File not found');
                } else {
                    res.sendFile(filePath);
                }
            });
        });
        
        this.app.get('/', (req, res) => {
            res.redirect("/app");
        });
        /*
        this.app.get('/api', (req, res) => {
            res.send('OK');
        });
        */

        this.app.get('/app', (req, res) => {
            res.sendFile(path.join(BASE_PATHS.APP_PATH, 'Domain', 'Views', 'WebDeck', 'cell-html.html'));
        });

        this.app.post("/get_data_user", async (req, res) => {
            res.send(await this.clientServiceUnderDeck.ListProgramsForRemote());
        });

        this.app.post("/set_volume", async (req, res) => {
            if (req.body.volume) {
                await this.clientServiceUnderDeck.SetWindowsVolume(req.body.volume);
            }
            res.send("OK");
        });

        this.app.post("/execute_exe", async (req, res) => {
            await DAO.GetDataNow();
            exec_program(req.body);
            res.send("Ok");
        });

        this.app.all("*", (req, res, next) => {
            const filePath = path.join(BASE_PATHS.APP_PATH, "Domain", req.originalUrl.replaceAll("%20", " "));
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                next();
            }
        });
    }

    async start() {
        return new Promise(async (resolve) => {
            if (this.isStarted) {
                resolve(true);
                return;
            }

            try {
                this.port = await DAO.DB.get('server_port');
                if (this.port == null) {
                    this.port = 3000;
                    await DAO.DB.set('server_port', this.port);
                }

                const ipAddress = await this.clientServiceUnderDeck.GetMyIPAddress() || 'localhost';
                this.ipAddress = ipAddress;
                this.server = this.app.listen(this.port, ipAddress, () => {
                    this.isStarted = true;
                    resolve(true);
                });

                this.server.on('error', (err) => {
                    console.error("Failed to start server:", err);
                    this.isStarted = false;
                    resolve(false);
                });

            } catch (error) {
                console.error("Error during server start:", error);
                resolve(false);
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (!this.isStarted || !this.server) {
                this.isStarted = false;
                resolve(true);
                return;
            }

            this.server.close((err) => {
                if (err) {
                    console.error("Failed to stop server:", err);
                    resolve(false);
                } else {
                    this.isStarted = false;
                    resolve(true);
                }
            });
        });
    }

    async restart() {
        await this.stop();
        return await this.start();
    }
}

module.exports = LocalServer;
