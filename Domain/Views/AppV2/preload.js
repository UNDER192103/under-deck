 const { contextBridge, ipcRenderer } = require("electron");

 contextBridge.exposeInMainWorld("api", {
   invoke: async (channel, data) => {
     return ipcRenderer.invoke(channel, data);
   },
 
   on: (channel, callback) => {
      const newCallback = (_, ...args) => callback(...args);
      ipcRenderer.on(channel, newCallback);
      return () => ipcRenderer.removeListener(channel, newCallback);
   },
 
   removeAllListeners: (channel) => {
     ipcRenderer.removeAllListeners(channel);
   }
 });