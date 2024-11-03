import { BrowserWindow } from "electron";
import path from 'path'

export function OpenCommitDialog(preloadScript: string )
{
    var dialogWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Commit your changes",
        webPreferences: {
            contextIsolation: true,
            preload: preloadScript
        }
      });

      dialogWindow.loadFile(path.join(__dirname, 'dialogs','commitDialog.html'));
      dialogWindow.setMenu(null);

      // Optionally, handle the window closed event
      dialogWindow.on('closed', () => {
        });
}

export function OpenSetOriginDialog(preloadScript: string )
{
    var dialogWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Set origin:",
        webPreferences: {
            contextIsolation: true,
            preload: preloadScript
        }
      });
      dialogWindow.loadFile(path.join(__dirname, 'dialogs','setOrigin.html'));
      dialogWindow.setMenu(null);

      // Optionally, handle the window closed event
      dialogWindow.on('closed', () => {
        });
}

export function OpenBranchesDialog(preloadScript: string )
{
    var dialogWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Branches:",
        webPreferences: {
            contextIsolation: true,
            preload: preloadScript
        }
      });
      dialogWindow.loadFile(path.join(__dirname, 'dialogs','branches.html'));
      dialogWindow.setMenu(null);

      // Optionally, handle the window closed event
      dialogWindow.on('closed', () => {
        });
}