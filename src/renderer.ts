/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { ipcRenderer } from 'electron';

console.log('👋 This message is being logged by "renderer.js", included via webpack');
const logArea = document.getElementById('logArea') as HTMLTextAreaElement
export function Log(message: string): void {
    const logArea = document.getElementById('logArea') as HTMLTextAreaElement; // Cast to HTMLTextAreaElement
    if (logArea) {
        logArea.value += message + '\n'; // Append the message and add a new line
        logArea.scrollTop = logArea.scrollHeight; // Scroll to the bottom
    }
}

function ClearLogs() {
    logArea.value = ""
}

document.getElementById('clearLogsBtn').addEventListener('click', ClearLogs);

window.electronAPI.onUpdateLog((message: string) => {
    if(message !== "")
        logArea.value += message + '\n'
})

window.electronAPI.onUpdateTitle((message: string) => {
    const title = document.getElementById('title') as HTMLTextAreaElement
    title.innerHTML = message 
})

window.electronAPI.onUpdateBranchName((message: string) => {
    const n = document.getElementById('branchName') as HTMLTextAreaElement
    n.innerHTML = message 
})

window.electronAPI.onUpdateChangeList((message: string) => {
    const n = document.getElementById('changesList') as HTMLTextAreaElement

    var tokens = message.split('\n')
    n.innerHTML = ""
    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.textContent = element;
        n.appendChild(listItem)
    }); 
})

window.electronAPI.onUpdateUntrackedList((message: string) => {
    const n = document.getElementById('untrackedList') as HTMLTextAreaElement

    var tokens = message.split('\n')
    n.innerHTML = ""
    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.textContent = element;
        n.appendChild(listItem)
    }); 
})

