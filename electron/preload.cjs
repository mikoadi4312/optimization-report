// Preload script for Electron
// This runs in an isolated context before the web page loads

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Add any APIs you need to expose to your React app here
    // Example: versions: process.versions
});
