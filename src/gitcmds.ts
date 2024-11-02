import {exec} from 'child_process'
import { ipcMain } from 'electron';

var currentPath:string;

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
    const res:string = await GitCmd("rev-parse --abbrev-ref HEAD")
    return res;
}

export async function GitChangeList() : Promise<string>
{
    const res:string = await GitCmd("diff --name-only 2>nul")
    return res;
}

export async function GitStagedList() : Promise<string>
{
    return GitCmd("diff --cached --name-only 2>nul")
}

export async function GitLog() : Promise<string>
{
    const res:string = await GitCmd("log")
    return res;
}

export async function GitStageFile(fileName:string) : Promise<string>
{
    return GitCmd("add " + fileName)
}

export async function GitUnstageFile(fileName:string) : Promise<string>
{
    const res:string = await GitCmd("restore --staged -- " + fileName)
    return res;
}