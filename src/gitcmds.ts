import {exec} from 'child_process'
import { ipcMain } from 'electron';
import { shell } from 'electron'
import { promises as fs } from 'fs';
var currentPath:string;
var baseBranch: string; //Used for checking out new branches: if empty, git checkout will branch off current branch, otherwise will branch off whatever name this var is set to

function GitCmd(command: string)
{
    return new Promise<string>((resolve, reject) => {
        exec(`git ${command}`, {cwd: currentPath}, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                reject(`Error executing "git ${command}": ${stderr.trim()}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}


export function ResetBaseBranch()
{
    baseBranch = ""
}

export function SetBaseBranch(name: string)
{
    baseBranch = name
}

export function ChangeDir(p:string)
{
    currentPath = p;
}


export async function GitStatus(window: Electron.BrowserWindow)
{
    const res:string = await GitCmd("status")
    window.webContents.send('update-log',res)

}

export async function GitUntrackedFiles()
{
    const res:string = await GitCmd("ls-files --others --exclude-standard")
    return res;
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

export async function GitBranchList(remote:boolean) : Promise<string>
{
    if(remote)
        return GitCmd("branch -r")
    else
        return GitCmd("branch")
}

export async function GitChangeList() : Promise<string>
{
    const res:string = await GitCmd("diff --name-only 2>nul")
    return res;
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
    return GitCmd("diff --cached --name-only 2>nul")
}

export async function GitDiffFile(fileName: string) : Promise<string>
{
    return GitCmd("diff -- \"" + fileName + "\"")
}

export async function GitLog() : Promise<string>
{
    const res:string = await GitCmd("log")
    return res;
}

export async function GitStageFile(fileName:string) : Promise<string>
{
    return GitCmd("add \"" + fileName + "\"")
}

export async function GitUnstageFile(fileName:string) : Promise<string>
{
    const res:string = await GitCmd("restore --staged -- \"" + fileName + "\"")
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
        return GitCmd("checkout -b \"" + branchName + "\"")
    else
        return GitCmd("checkout -b \"" + branchName + "\" " + baseBranch)
}

export async function GitDiscardFileChanges(fileName: string) : Promise<string>
{
    return GitCmd("checkout -- \"" + fileName + "\"")
}

export async function GitDeleteUntrackedFile(fileName: string) : Promise<string>
{
    return GitCmd("clean -f \"" + fileName + "\"")
}
export async function GitLaunchDifftoolOnOfile(fileName: string) : Promise<string>
{
    return GitCmd("difftool -- \"" + fileName + "\"")
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
        const data = await fs.readFile(fileName, 'utf8');
        return data.trim();
    } catch (error) {
        console.error('Error reading file ' + fileName, error);
        throw error;
    }
}
