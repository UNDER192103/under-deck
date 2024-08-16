const { contextBridge, ipcRenderer } = require("electron");

let bridge = {
  dataView: (callback) => ipcRenderer.on("dataView", callback),
};
  
contextBridge.exposeInMainWorld("bridge", bridge);