import './index.css';
import { ipcRenderer } from 'electron';


const logArea = document.getElementById('logArea') as HTMLTextAreaElement
const diffArea = document.getElementById('diffContent') as HTMLTextAreaElement
const commitBtn = document.getElementById('commitBtn') as HTMLTextAreaElement

const addAllBtn = document.getElementById('addAllBtn') as HTMLButtonElement;
const discardAllBtn = document.getElementById('discardAllBtn') as HTMLButtonElement;

const addAllUntrackedBtn = document.getElementById('addAllUntrackedBtn') as HTMLButtonElement;
const deleteAllBtn = document.getElementById('deleteAllBtn') as HTMLButtonElement;

commitBtn.style.display = 'none';
commitBtn.addEventListener('click', () => {  window.electronAPI.clickedCommitBtn()   });

addAllBtn.style.display = 'none';
discardAllBtn.style.display = 'none';

addAllUntrackedBtn.style.display = 'none';
deleteAllBtn.style.display = 'none';


document.getElementById('clearLogsBtn').addEventListener('click', ()=>{logArea.innerHTML = ""});

addAllBtn.addEventListener('click', ()=>{ window.electronAPI.clickedAddAllBtn() });
discardAllBtn.addEventListener('click', ()=>{ window.electronAPI.clickedDiscardAllBtn() });

addAllUntrackedBtn.addEventListener('click', ()=>{ window.electronAPI.clickedAddAllUntrackedBtn() });
deleteAllBtn.addEventListener('click', ()=>{ window.electronAPI.clickedDeleteAllBtn() });

window.electronAPI.onUpdateDiffArea((message: string) => {

    if(message === "")
    {
        diffArea.innerHTML = ""
        return
    }

    const lines = message.split('\n');
    let formattedDiff = '';

    lines.forEach(line => {
        if (line.startsWith('diff --git')) {
            formattedDiff += `<span class="diff-header">${line}</span><br>`;
        } else if (line.startsWith('index')) {
            formattedDiff += `<span class="diff-index">${line}</span><br>`;
        } else if (line.startsWith('--- ') || line.startsWith('+++ ')) {
            formattedDiff += `<span class="diff-file">${line}</span><br>`;
        } else if (line.startsWith('@@')) {
            formattedDiff += `<span class="diff-hunk">${line}</span><br>`;
        } else if (line.startsWith('+')) {
            formattedDiff += `<span class="diff-addition">${line}</span><br>`;
        } else if (line.startsWith('-')) {
            formattedDiff += `<span class="diff-deletion">${line}</span><br>`;
        } else {
            formattedDiff += `<span class="diff-context">${line}</span><br>`;
        }
    });

    diffArea.innerHTML = formattedDiff;
})

function Log(message: string, type: string)
{
    if(message !== "")
    {
        const logArea = document.getElementById('logArea') as HTMLTextAreaElement; // Cast to HTMLTextAreaElement

        const now = new Date();
        const formattedDate = now.toISOString(); // Format as ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)

        // Create log message with date and time
        const logMessage = document.createElement('div');
        logMessage.textContent = `[${formattedDate}] ${message}`;


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
}

window.electronAPI.onUpdateLog((message: string, type: string) => {
    Log(message, type)
})

window.electronAPI.onUpdateTitle((message: string) => {
    const title = document.getElementById('title') as HTMLTextAreaElement
    title.innerHTML = message 
})

window.electronAPI.onUpdateBranchName((message: string) => {
    const n = document.getElementById('branchName') as HTMLTextAreaElement
    n.innerHTML = message 
})

window.electronAPI.onUpdateBranchStatus((message: string) => {
    const n = document.getElementById('branchStatus') as HTMLTextAreaElement
    n.innerHTML = message 
})

window.electronAPI.onUpdateChangeList((message: string) => {
    const n = document.getElementById('changesList') as HTMLUListElement; // Corrected type to HTMLUListElement
    n.innerHTML = ""; // Clear previous list items

    if (message.length > 0) {
        const tokens = message.split('\n');

        tokens.forEach(element => {
            const listItem = document.createElement('li');
            listItem.classList.add('change-item'); // Add class for styling

            // Create the file name span
            const fileName = document.createElement('span');
            fileName.classList.add('file-name'); // Class for styling
            fileName.textContent = element;

            // Create button container
            const changeButtons = document.createElement('div');
            changeButtons.classList.add('change-buttons'); // Class for button styling

            // Add button
            const addBtn = document.createElement('button');
            addBtn.classList.add('add-btn');
            addBtn.title = 'Stage file for commit';
            //addBtn.innerHTML = '➕'
            addBtn.addEventListener('click', (event) => {
                window.electronAPI.clickedAddFile(element)
                event.stopPropagation(); // Prevent list item click event

            });

            // Discard button
            const discardBtn = document.createElement('button');
            discardBtn.classList.add('discard-btn');
            discardBtn.title = 'Discard changes';
            //discardBtn.innerHTML = '❌'

            discardBtn.addEventListener('click', () => {
                window.electronAPI.clickedDiscardFileChanges(element)

            });

            // Difftool button
            const difftoolBtn = document.createElement('button');
            difftoolBtn.classList.add('difftool-btn');
            difftoolBtn.title = 'Launch difftool';
            //difftoolBtn.innerHTML = '🔼🔽'
            difftoolBtn.addEventListener('click', () => {
                window.electronAPI.clickedDiffToolOnFile(element)
            });

            // Append buttons to the button container
            changeButtons.appendChild(addBtn);
            changeButtons.appendChild(discardBtn);
            changeButtons.appendChild(difftoolBtn);

            // Append file name and buttons to the list item
            listItem.appendChild(fileName);
            listItem.appendChild(changeButtons);

            // Add hover effects
            listItem.addEventListener('mouseenter', () => { listItem.classList.add('hovered'); });
            listItem.addEventListener('mouseleave', () => { listItem.classList.remove('hovered'); });

            // Add click event for the list item
            listItem.addEventListener('click', () => {
                window.electronAPI.clickedChangedFile(element);
            });

            // Append the list item to the changes list
            n.appendChild(listItem);
        });

        // Show action buttons
        addAllBtn.style.display = 'block';
        discardAllBtn.style.display = 'block';

    } else {
        n.innerHTML = ""; // Clear the list if no message
        addAllBtn.style.display = 'none';
        discardAllBtn.style.display = 'none';

    }
});

window.electronAPI.onUpdateUntrackedList((message: string) => {
    const n = document.getElementById('untrackedList') as HTMLUListElement;
    n.innerHTML = ""; // Clear the existing list

    if(message === "")
    {
        addAllUntrackedBtn.style.display = 'none';
        deleteAllBtn.style.display = 'none';
        return
    }

    const tokens = message.split('\n');

    
    if(tokens.length > 0)
    {
        // Show action buttons
        addAllUntrackedBtn.style.display = 'block';
        deleteAllBtn.style.display = 'block';
    }
    else
    {
        addAllUntrackedBtn.style.display = 'none';
        deleteAllBtn.style.display = 'none';
    }

    

    tokens.forEach(element => {
        const listItem = document.createElement('li');
        listItem.classList.add('change-item'); // Class for styling

        // Create the file name span
        const fileName = document.createElement('span');
        fileName.classList.add('file-name'); // Class for styling
        fileName.textContent = element;

        // Create button container with the same styling as before
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('change-buttons'); // Reuse 'change-buttons' class for styling

        // "Add" button
        const addBtn = document.createElement('button');
        addBtn.classList.add('add-btn');
        addBtn.title = 'Add this file';
        //addBtn.innerHTML = '➕'
        addBtn.addEventListener('click', (event) => {
            window.electronAPI.clickedAddFile(element)
            event.stopPropagation(); // Prevent list item click event
        });

        // "Delete" button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('discard-btn'); // Reuse 'discard-btn' class for styling
        deleteBtn.title = 'Delete this file';
        //deleteBtn.innerHTML = '🗑️'
        deleteBtn.addEventListener('click', (event) => {
            window.electronAPI.clickedDeleteUntrackedFile(element)
            event.stopPropagation(); // Prevent list item click event
        });

        // Append buttons to the container
        buttonContainer.appendChild(addBtn);
        buttonContainer.appendChild(deleteBtn);

        // Append file name and button container to the list item
        listItem.appendChild(fileName);
        listItem.appendChild(buttonContainer);

        // Add hover effect for the list item
        listItem.addEventListener('mouseenter', () => {
            listItem.classList.add('hovered');
        });
        listItem.addEventListener('mouseleave', () => {
            listItem.classList.remove('hovered');
        });

        // Click event for the list item
        listItem.addEventListener('click', () => {
            window.electronAPI.clickedUntrackedFile(element);
        });

        // Append the list item to the untracked list
        n.appendChild(listItem);
    });
});

// Add scroll event listener to detect when at the bottom of the commits list
const commitsList = document.getElementById('commitsList') as HTMLUListElement;

commitsList.addEventListener('scroll', () => {
    if (commitsList.scrollTop + commitsList.clientHeight >= commitsList.scrollHeight) {

        window.electronAPI.requestMoreGitLog()

    }
});

window.electronAPI.onUpdateLogList((message: string) => {
    const n = document.getElementById('commitsList') as HTMLUListElement;

    if(message == 'clear')
    {
        n.innerHTML = "";
        return;
    }

    const tokens = message.trim().split(/commit\s+/).filter(entry => entry.trim() !== ""); 


    tokens.forEach(entry => {
        const lines = entry.trim().split('\n');

        const hash = lines[0]; // Commit hash line
        const author = lines[1]; // Author line
        const date = lines[2]; // Date line
        const message = lines.slice(3).join('\n').trim(); // Commit message, may contain multiple lines

        const listItem = document.createElement('li');

        // Create a clickable hash element
        const hashElement = document.createElement('a');
        hashElement.className = 'commitListHash';
        hashElement.textContent = hash;
        hashElement.href = "#"; // Replace with the actual URL if available
        hashElement.onclick = (event) => {
            event.preventDefault();
            console.log(`Commit hash clicked: ${hash}`);
            window.electronAPI.clickedCommitHash(listItem.innerText)
        };

        const authorElement = document.createElement('span');
        authorElement.className = 'commitListAuthor';
        authorElement.textContent = author;

        const dateElement = document.createElement('span');
        dateElement.className = 'commitListDate';
        dateElement.textContent = date;

        const messageElement = document.createElement('span');
        messageElement.className = 'commitListMessage';
        messageElement.textContent = message;

        // Append elements to the list item
        listItem.appendChild(hashElement);
        listItem.appendChild(document.createElement('br')); // Line break after hash
        listItem.appendChild(authorElement);
        listItem.appendChild(document.createElement('br')); // Line break after author
        listItem.appendChild(dateElement);
        listItem.appendChild(document.createElement('br')); // Line break after date
        listItem.appendChild(messageElement);

        // Append the list item to the list
        n.appendChild(listItem);
    });
});

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

