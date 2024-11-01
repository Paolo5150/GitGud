// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', 
    {
        logMsg: (message: string) => ipcRenderer.send('log-message', message),
        onUpdateLog: (callback: (message: string) => void) => {
            ipcRenderer.on('update-log', (_event, message) => callback(message));
        },

        updateTitle: (title: string) => ipcRenderer.send('update-title', title), // Corrected function to update the title
        onUpdateTitle: (callback: (message: string) => void) => {
            ipcRenderer.on('update-title', (_event, message) => callback(message));
        },

        updateBranchName: (bname: string) => ipcRenderer.send('update-branch-name', bname), // Corrected function to update the title
        onUpdateBranchName: (callback: (message: string) => void) => {
            ipcRenderer.on('update-branch-name', (_event, message) => callback(message));
        },

        updateChangeList: (txt: string) => ipcRenderer.send('update-change-list', txt), // Corrected function to update the title
        onUpdateChangeList: (callback: (message: string) => void) => {
            ipcRenderer.on('update-change-list', (_event, message) => callback(message));
        },

        updateUntrackedList: (txt: string) => ipcRenderer.send('update-untracked-list', txt), // Corrected function to update the title
        onUpdateUntrackedList: (callback: (message: string) => void) => {
            ipcRenderer.on('update-untracked-list', (_event, message) => callback(message));
        }

})

// Add this to make TypeScript happy
declare global {
    interface Window {
        electronAPI: {
            log: (message: string) => void
            onUpdateLog: (callback: (message: string) => void) => void
        }
    }
}