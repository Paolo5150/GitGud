import {exec, spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { ipcMain } from 'electron';
import { shell } from 'electron'
import { promises as fs } from 'fs';
import path from 'path'
import shlex from 'shlex'

var currentPath:string;
var baseBranch: string; //Used for checking out new branches: if empty, git checkout will branch off current branch, otherwise will branch off whatever name this var is set to

var cmdQueue: { command: string, resolve: (value: string) => void, reject: (reason?: any) => void }[] = [];
var isProcessing: boolean = false;

export function ChangeDir(p:string)
{
    currentPath = p;
}

function ClearQueue() {
    while (cmdQueue.length > 0) {
        const { reject } = cmdQueue.shift()!;
        reject('Queue cleared');
    }
    isProcessing = false;
    console.log('Queue cleared');
}

function GitCmd(command: string): Promise<string>
{
    console.log('submitting cmd: ' + command)
    return enqueue(command);
}

function enqueue(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cmdQueue.push({ command, resolve, reject });
        processQueue();
    });
}

async function processQueue() {
    //var dataReceived: boolean = false;

    if (isProcessing || cmdQueue.length === 0) {
        return;
    }

    isProcessing = true;
    const { command, resolve, reject } = cmdQueue.shift()!;

    var args = shlex.split(command);
    try {
        var gitProcess = spawn('git', args, { cwd: currentPath });

        let output = ''; // Collect stdout data
        let errorOutput = ''; // Collect stderr data

        gitProcess.stdout.on('data', (data) => {
            //dataReceived = true;
            output += data.toString(); // Append chunk to output
        });

        gitProcess.stderr.on('data', (data) => {
            errorOutput += data.toString(); // Append chunk to errorOutput
        });

        gitProcess.on('close', (code) => {
            if (code === 0) {
                // Process completed successfully
                resolve(output.trim());
            } else {
                // Process completed with an error
                reject(`Git process exited with code ${code}. Error: ${errorOutput.trim()}`);
            }
            isProcessing = false;
            processQueue(); // Process the next command in the queue
        });

        gitProcess.on('error', (error) => {
            reject(`Git process error: ${error.message}`);
            isProcessing = false;
            processQueue(); // Process the next command in the queue
        });
    } catch (error) {
        console.error("Git process error: " + error);
        reject(`Failed to start git process: ${error}`);
        isProcessing = false;
        processQueue(); // Process the next command in the queue
    }
}


export function ResetBaseBranch()
{
    baseBranch = ""
}

export function SetBaseBranch(name: string)
{
    baseBranch = name
}

export async function GitStatus(window: Electron.BrowserWindow)
{
    const res:string = await GitCmd("status")
    window.webContents.send('update-log',res)

}

export async function GitUntrackedFiles()
{
    return GitCmd("ls-files --others --exclude-standard")
}

export async function GitIsRepoValid() : Promise<boolean>
{
    const res:string = await GitCmd("rev-parse --is-inside-work-tree")
    return res == 'true';
}

export async function GitTopLevel() : Promise<string>
{
    const res:string = await GitCmd("rev-parse --show-toplevel")
    return res;
}

export async function GitBranchName() : Promise<string>
{
    return GitCmd("rev-parse --abbrev-ref HEAD")
}

export async function GitPushBranch(branchName: string) : Promise<string>
{
    return GitCmd("push -u origin " + branchName)
}

export async function GitPull() : Promise<string>
{
    return GitCmd("pull")
}

export async function GitFetch() : Promise<string>
{
    return GitCmd("fetch")
}

export async function GitBranchList(remote:boolean) : Promise<string>
{
    if(remote)
        return GitCmd("branch -r")
    else
        return GitCmd("branch")
}

export async function GitChangeList() : Promise<string>
{
    return GitCmd("diff --name-only")
}

export async function GitStatusSB() : Promise<string>
{
    return GitCmd("status -sb")
}

export async function GitCheckoutBranch(branchName: string) : Promise<string>
{
    return await GitCmd("checkout " + branchName)
}

export async function GitDeleteLocalBranch(branchName: string) : Promise<string>
{
    return await GitCmd("branch -D " + branchName)
}

export async function GitMergeBranch(branchName: string) : Promise<string>
{
    return await GitCmd("merge " + branchName)
}

export async function GitCheckoutTrackBranch(branchName: string) : Promise<string>
{
    return await GitCmd("checkout --track " + branchName)
}

export async function GitStagedList() : Promise<string>
{
    return GitCmd("diff --cached --name-only")
}

export async function GitDiffFile(fileName: string) : Promise<string>
{
    return GitCmd("diff -- " + fileName)
}

export async function GitLog(n:number, skip:number) : Promise<string>
{
    return GitCmd("log --skip=" + skip + " -n " + n)
}

export async function GitCommitCount() : Promise<string>
{
    return GitCmd("rev-list --count HEAD")
}

export async function GitStageFile(fileName:string) : Promise<string>
{
    return GitCmd("add " + fileName )
}

export async function GitUnstageFile(fileName:string) : Promise<string>
{
    const res:string = await GitCmd("restore --staged -- " + fileName)
    return res;
}

export async function GitCommitStaged(message: string) : Promise<string>
{
    return GitCmd("commit -m \"" + message + "\"")
}

export async function GitAddAllChanges() : Promise<string>
{
    return GitCmd("add -u")
}

export async function GitAddAllUntrackedFiles() : Promise<string>
{
    return GitCmd("add --intent-to-add .")
}

export async function GitDeleteAllUntrackedFiles() : Promise<string>
{
    return GitCmd("clean -f")
}

export async function GitDiscardAllChanges() : Promise<string>
{
    return GitCmd("checkout .")
}

export async function GitCreateBranch(branchName: string) : Promise<string>
{
    if(baseBranch == "")
        return GitCmd("checkout -b " + branchName)
    else
        return GitCmd("checkout -b " + branchName + " " + baseBranch)
}

export async function GitDiscardFileChanges(fileName: string) : Promise<string>
{
    return GitCmd("checkout -- " + fileName )
}

export async function GitDeleteUntrackedFile(fileName: string) : Promise<string>
{
    return GitCmd("clean -f " + fileName )
}
export async function GitLaunchDifftoolOnOfile(fileName: string) : Promise<string>
{
    return GitCmd("difftool -- " + fileName )
}

export async function GitSetOrigin(url: string) : Promise<string>
{
    return GitCmd("remote add origin " + url)
}

export async function OpenRepoInExplorer() 
{
    if(currentPath !== '')
    {
        shell.openPath(currentPath)
        .then((response) => {
            if (response) {
                console.error(`Failed to open path: ${response}`);
            }
        })
        .catch((error) => console.error(`Error opening path: ${error}`));
    }
}

export async function ReadFile(fileName: string): Promise<string> {
    try {
        var fullPath = path.join(currentPath, fileName)
        return fs.readFile(fullPath, 'utf8');
    } catch (error) {
        console.error('Error reading file ' + fileName, error);
        throw error;
    }
}
