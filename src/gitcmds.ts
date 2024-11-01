import {exec} from 'child_process'
import { ipcMain } from 'electron';

var currentPath:string;

function GitCmd(command: string)
{
    return new Promise<string>((resolve, reject) => {
        exec(`git ${command}`, {cwd: currentPath}, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                reject(`Errorrrr: ${stderr.trim()}`);
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

export async function GitUntrackedFiles(window: Electron.BrowserWindow)
{
    const res:string = await GitCmd("ls-files --others --exclude-standard")
    window.webContents.send('update-log',res)
}

export async function GitIsRepoValid(window: Electron.BrowserWindow) : Promise<boolean>
{
    const res:string = await GitCmd("rev-parse --is-inside-work-tree")
    return res == 'true';
}

export async function GitTopLevel() : Promise<string>
{
    const res:string = await GitCmd("rev-parse --show-toplevel")
    return res;
}