// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', 
    {
        logMsg: (message: string, logType:string) => ipcRenderer.send('log', message, logType),
        onUpdateLog: (callback: (message: string, logType:string) => void) => {
            ipcRenderer.on('log', (_event, message, logType) => callback(message, logType));
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
        },

        updateStagedList: (txt: string) => ipcRenderer.send('update-staged-list', txt), // Corrected function to update the title
        onUpdateStagedList: (callback: (message: string) => void) => {
            ipcRenderer.on('update-staged-list', (_event, message) => callback(message));
        },

        updateLogList: (txt: string) => ipcRenderer.send('update-log-list', txt), // Corrected function to update the title
        onUpdateLogList: (callback: (message: string) => void) => {
            ipcRenderer.on('update-log-list', (_event, message) => callback(message));
        },

        clickedUntrackedFile: (fileName: string) => {ipcRenderer.send('clicked-untracked-file', fileName)},
        clickedChangedFile: (fileName: string) => {ipcRenderer.send('clicked-changed-file', fileName)},
        clickedStagedFile: (fileName: string) => {ipcRenderer.send('clicked-staged-file', fileName)},
        clickedCommitBtn: () => {ipcRenderer.send('clicked-commit-btn')}
})

contextBridge.exposeInMainWorld('dialogAPI', 
    {
        clickedConfirmCommit: () => {ipcRenderer.send('clicked-confirm-commit')},
        
    })

// Add this to make TypeScript happy
declare global {
    interface Window {
        electronAPI: {
            log: (message: string) => void
            onUpdateLog: (callback: (message: string) => void) => void
        },
        dialogAPI: {
            clickedConfirmCommit: ()=> void
        }
    }
}

    