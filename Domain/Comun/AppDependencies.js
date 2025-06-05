const os = require('os');
const AppDependencies = require('../../Repository/data/dependencies.json');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app, dialog } = require("electron");

const installDependency = async (dependency) => {
    return new Promise((resolve) => {
        try {
            dialog.showMessageBox({
                title: 'Install Dependency',
                message: `Please install the dependency: ${dependency.name}`,
                buttons: ['Ok'],
            }).then(() => {
                let dirFile = path.join(app.getAppPath(), dependency.path);
                fs.copyFile(dirFile, path.join(os.tmpdir(), dependency.fileName), (err) => {
                    try {
                        exec(`${path.join(os.tmpdir(), dependency.fileName)}`, (err, stdout, stderr) => {
                            fs.unlinkSync(path.join(os.tmpdir(), dependency.fileName));
                            resolve(true);
                        });
                    } catch (error) {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            resolve(true);
        }
    });
}

const testDependency = async (dependency) => {
    return new Promise((resolve) => {
        switch (dependency.testerBy) {
            case 'loudness':
                const loudness = require('loudness');
                loudness.getVolume().then((volume) => {
                    resolve(true);
                }).catch((error) => {
                    if (error.toString().includes('Command failed') && error.toString().includes('adjust_get_current_system_volume_vista_plus.exe')) {
                        installDependency(dependency).then(resolve);
                    }
                    else {
                        resolve(false);
                    }
                });
            break;

            default:
                resolve(true);
                break;
        }
    });
}

const CheckAppDependencies = async (callback) => {
    if (os.platform().includes('win')) {
        try {
            for (let index = 0; index < AppDependencies.windows.length; index++) {
                const dependency = AppDependencies.windows[index];
                await testDependency(dependency);
            }
            callback();
        } catch (error) {
            callback();
        }
    }
    else {
        callback();
    }
}


module.exports = CheckAppDependencies;