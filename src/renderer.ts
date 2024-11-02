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
const commitBtn = document.getElementById('commitBtn') as HTMLTextAreaElement

commitBtn.style.display = 'none';
commitBtn.addEventListener('click', () => {  window.electronAPI.clickedCommitBtn()   });

function ClearLogs() {
    logArea.innerHTML = ""
}

document.getElementById('clearLogsBtn').addEventListener('click', ClearLogs);

window.electronAPI.onUpdateLog((message: string, type: string) => {
    if(message !== "")
    {
        const logArea = document.getElementById('logArea') as HTMLTextAreaElement; // Cast to HTMLTextAreaElement

        const logMessage = document.createElement('div');
        logMessage.textContent = message;

        if (type === 'i') {
            logMessage.classList.add('log-info');
        } else if (type === 'w') {
            logMessage.classList.add('log-warning');
        } else if (type === 'e') {
            logMessage.classList.add('log-error');
        }

        if (logArea) {
            logArea.appendChild(logMessage);
            logArea.scrollTop = logArea.scrollHeight;
        }
    }
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

        listItem.addEventListener('mouseenter', () => { listItem.classList.add('hovered');  });
        listItem.addEventListener('mouseleave', () => { listItem.classList.remove('hovered'); });
        listItem.addEventListener('click', () => { window.electronAPI.clickedChangedFile(listItem.innerText) });
        n.appendChild(listItem)
    }); 
})

window.electronAPI.onUpdateUntrackedList((message: string) => {
    const n = document.getElementById('untrackedList') as HTMLUListElement;

    const tokens = message.split('\n');
    n.innerHTML = ""; // Clear the existing list

    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.textContent = element;

        // Add mouse hover effect
        listItem.addEventListener('mouseenter', () => {
            listItem.classList.add('hovered');
        });

        listItem.addEventListener('mouseleave', () => {
            listItem.classList.remove('hovered');
        });

        // Add click event
        listItem.addEventListener('click', () => {
          window.electronAPI.clickedUntrackedFile(listItem.innerText)
        });

        n.appendChild(listItem);
    });  
})

window.electronAPI.onUpdateLogList((message: string) => {
    const n = document.getElementById('commitsList') as HTMLTextAreaElement

    var tokens = message.trim().split('\n\n');
    n.innerHTML = ""
    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.textContent = element;
        n.appendChild(listItem)
    }); 
})

window.electronAPI.onUpdateStagedList((message: string) => {
    const n = document.getElementById('stagedList') as HTMLTextAreaElement

    var tokens = message.split('\n')
    n.innerHTML = ""
    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.textContent = element;

        listItem.addEventListener('mouseenter', () => { listItem.classList.add('hovered');  });
        listItem.addEventListener('mouseleave', () => { listItem.classList.remove('hovered'); });
        listItem.addEventListener('click', () => { window.electronAPI.clickedStagedFile(listItem.innerText) });
        n.appendChild(listItem)
    }); 

    if(message.length > 0)
        commitBtn.style.display = 'block';
    else
        commitBtn.style.display = 'none';
})

