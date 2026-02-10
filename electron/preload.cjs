// Preload script for Electron
// This runs in an isolated context before the web page loads

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Database API for Deposit Tools
    getDepositData: () => ipcRenderer.invoke('db:get-deposit-data'),
    importDepositData: (data) => ipcRenderer.invoke('db:import-deposit', data),
});
