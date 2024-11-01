// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', 
    {
        logMsg: (message: string) => ipcRenderer.send('log-message', message),
        
        updateTitle: (title: string) => ipcRenderer.send('update-title', title), // Corrected function to update the title
    
        onUpdateLog: (callback: (message: string) => void) => {
            ipcRenderer.on('update-log', (_event, message) => callback(message));
        },

        onUpdateTitle: (callback: (message: string) => void) => {
            ipcRenderer.on('update-title', (_event, message) => callback(message));
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