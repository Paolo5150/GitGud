import { contextBridge, ipcRenderer } from 'electron';

// Shared types
interface MainWindowAPI {
    logMsg: (message: string, logType: string) => void;
    onUpdateLog: (callback: (message: string, logType: string) => void) => void;
    updateDiffArea: (message: string) => void;
    onUpdateDiffArea: (callback: (message: string) => void) => void;
    updateTitle: (title: string) => void;
    onUpdateTitle: (callback: (message: string) => void) => void;
    updateBranchName: (bname: string) => void;
    updateBranchStatus: (status: string) => void;
    onUpdateBranchName: (callback: (message: string) => void) => void;
    onUpdateBranchStatus: (callback: (message: string) => void) => void;
    updateChangeList: (txt: string) => void;
    onUpdateChangeList: (callback: (message: string) => void) => void;
    updateUntrackedList: (txt: string) => void;
    onUpdateUntrackedList: (callback: (message: string) => void) => void;
    updateStagedList: (txt: string) => void;
    onUpdateStagedList: (callback: (message: string) => void) => void;
    updateLogList: (txt: string) => void;
    onUpdateLogList: (callback: (message: string) => void) => void;
    requestMoreGitLog: () => void;
    clickedUntrackedFile: (fileName: string) => void;
    clickedChangedFile: (fileName: string) => void;
    clickedStagedFile: (fileName: string) => void;
    clickedCommitHash: (hash: string) => void;
    clickedCommitBtn: () => void;
    clickedAddAllBtn: () => void;
    clickedAddAllUntrackedBtn: () => void;
    clickedDiscardAllBtn: () => void;
    clickedDeleteAllBtn: () => void;
    clickedLaunchDifftoolAllBtn: () => void;
    clickedAddFile: (fileName: string) => void;
    clickedDiscardFileChanges: (fileName: string) => void;
    clickedDeleteUntrackedFile: (fileName: string) => void;
    clickedDiffToolOnFile: (fileName: string) => void;
}

interface DialogAPI {
    clickedConfirmOriginURL: (url: string, callback: (response: string) => void) => void;
    clickedConfirmCommit: (commitMessage: string, callback: (response: string) => void) => void;
    clickedConfirmBranchName: (branchName: string, callback: (response: string) => void) => void;
    getBranchList: (remote: boolean) => Promise<string>;
    checkoutBranch: (branchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    trackBranch: (branchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    newBranchFrom: (baseBranchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    deleteLocalBranch: (branchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    mergeBranch: (branchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    checkoutAndTrackBranch: (branchName: string, dialogWindow: Electron.BrowserWindow) => Promise<boolean>;
    onCommitComplete: (callback: (success: boolean) => void) => void;
}

// Extend Window interface
declare global {
    interface Window {
        electronAPI: MainWindowAPI;
        dialogAPI: DialogAPI;
    }
}

// Main window API
const mainWindowAPI: MainWindowAPI = {
    logMsg: (message: string, logType: string) => ipcRenderer.send('log', message, logType),
    onUpdateLog: (callback) => ipcRenderer.on('log', (_event, message, logType) => callback(message, logType)),
    updateDiffArea: (message: string) => ipcRenderer.send('update-diff-area', message),
    onUpdateDiffArea: (callback) => ipcRenderer.on('update-diff-area', (_event, message) => callback(message)),
    updateTitle: (title: string) => ipcRenderer.send('update-title', title),
    onUpdateTitle: (callback) => ipcRenderer.on('update-title', (_event, message) => callback(message)),
    updateBranchName: (bname: string) => ipcRenderer.send('update-branch-name', bname),
    updateBranchStatus: (status: string) => ipcRenderer.send('update-branch-status', status),
    onUpdateBranchName: (callback) => ipcRenderer.on('update-branch-name', (_event, message) => callback(message)),
    onUpdateBranchStatus: (callback) => ipcRenderer.on('update-branch-status', (_event, message) => callback(message)),
    updateChangeList: (txt: string) => ipcRenderer.send('update-change-list', txt),
    onUpdateChangeList: (callback) => ipcRenderer.on('update-change-list', (_event, message) => callback(message)),
    updateUntrackedList: (txt: string) => ipcRenderer.send('update-untracked-list', txt),
    onUpdateUntrackedList: (callback) => ipcRenderer.on('update-untracked-list', (_event, message) => callback(message)),
    updateStagedList: (txt: string) => ipcRenderer.send('update-staged-list', txt),
    onUpdateStagedList: (callback) => ipcRenderer.on('update-staged-list', (_event, message) => callback(message)),
    updateLogList: (txt: string) => ipcRenderer.send('update-log-list', txt),
    onUpdateLogList: (callback) => ipcRenderer.on('update-log-list', (_event, message) => callback(message)),
    requestMoreGitLog: () => ipcRenderer.send('request-log-list'),
    clickedUntrackedFile: (fileName: string) => ipcRenderer.send('clicked-untracked-file', fileName),
    clickedChangedFile: (fileName: string) => ipcRenderer.send('clicked-changed-file', fileName),
    clickedStagedFile: (fileName: string) => ipcRenderer.send('clicked-staged-file', fileName),
    clickedCommitHash: (hash: string) => ipcRenderer.send('clicked-commit-hash', hash),
    clickedCommitBtn: () => ipcRenderer.send('clicked-commit-btn'),
    clickedAddAllBtn: () => ipcRenderer.send('clicked-add-all-btn'),
    clickedDiscardAllBtn: () => ipcRenderer.send('clicked-discard-all-btn'),
    clickedAddAllUntrackedBtn: () => ipcRenderer.send('clicked-add-all-untracked-btn'),
    clickedDeleteAllBtn: () => ipcRenderer.send('clicked-delete-all-btn'),
    clickedLaunchDifftoolAllBtn: () => ipcRenderer.send('clicked-launch-difftool-btn'),
    clickedAddFile: (fileName: string) => ipcRenderer.send('clicked-add-file', fileName),
    clickedDiscardFileChanges: (fileName: string) => ipcRenderer.send('clicked-discard-file-changes', fileName),
    clickedDeleteUntrackedFile: (fileName: string) => ipcRenderer.send('clicked-delete-file', fileName),
    clickedDiffToolOnFile: (fileName: string) => ipcRenderer.send('clicked-difftool-file', fileName),
};

// Dialog window API
const dialogAPI: DialogAPI = {
    clickedConfirmOriginURL: (url: string, callback: (response: string) => void) => {
        ipcRenderer.send('clicked-confirm-origin-url', url);
        ipcRenderer.once('confirm-url-response', (_event, response) => { callback(response); });
    },
    clickedConfirmCommit: (commitMessage: string, callback: (response: string) => void) => {
        ipcRenderer.send('clicked-confirm-commit', commitMessage);
        ipcRenderer.once('confirm-commit-response', (_event, response) => { callback(response); });
    },
    clickedConfirmBranchName: (commitMessage: string, callback: (response: string) => void) => {
        ipcRenderer.send('clicked-confirm-branch-name', commitMessage);
        ipcRenderer.once('confirm-branch-name-response', (_event, response) => { callback(response); });
    },
    getBranchList: (remote: boolean) => ipcRenderer.invoke('get-branch-list', remote),
    checkoutBranch: async (branchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('checkout-branch', branchName),
    trackBranch: async (branchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('checkout-track-branch', branchName),
    newBranchFrom: async (baseBranchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('checkout-new-branch-from', baseBranchName),
    deleteLocalBranch: async (branchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('delete-local-branch', branchName),
    mergeBranch: async (branchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('merge-branch', branchName),
    checkoutAndTrackBranch: async (branchName: string, dialogWindow: Electron.BrowserWindow) => ipcRenderer.invoke('checkout-track-branch', branchName),
    onCommitComplete: (callback) => ipcRenderer.on('commit-complete', (_event, success) => callback(success)),
};

// Expose APIs only once
if (!window.electronAPI) {
    contextBridge.exposeInMainWorld('electronAPI', mainWindowAPI);
}

if (!window.dialogAPI) {
    contextBridge.exposeInMainWorld('dialogAPI', dialogAPI);
}
