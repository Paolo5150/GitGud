import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { ChangeDir, GitAddAllChanges, GitAddAllUntrackedFiles, GitBranchList, GitBranchName, GitChangeList,  GitCheckoutBranch,  GitCheckoutTrackBranch,  GitCommitStaged, GitDeleteAllUntrackedFiles, GitDeleteUntrackedFile, GitDiffFile, GitDiscardAllChanges, GitDiscardFileChanges, GitIsRepoValid, GitLaunchDifftoolOnOfile, GitLog, GitPull, GitPushBranch, GitSetOrigin, GitStagedList, GitStageFile, GitStatus, GitTopLevel, GitUnstageFile, GitUntrackedFiles, ReadFile } from './gitcmds';
import { FSWatcher } from 'chokidar';
import path from 'path'
import { OpenBranchesDialog, OpenCommitDialog, OpenSetOriginDialog } from './SideWindows';
const chokidar = require('chokidar');

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

var currentRepoPath:string = "";
var isValidRepo: Boolean = false;
var mainWindow: Electron.BrowserWindow;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

var chokiWathcer: FSWatcher;

const CreateMenu = ()=>{

  const menu = Menu.buildFromTemplate([
    {
    label: 'File',
    submenu: [
      {
        label: 'Open Repo',
        click: (menuItem, browserWin) => openFolderPicker()
      }]
    },
     // Conditionally add the Git menu
     ...(isValidRepo
      ? [
          {
            label: 'Branch',
            submenu: [
              {
                label: 'Branches',
                click: ()=>{OpenBranchesDialog(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)}
        
              },
              
              {
                label: 'Create New'
              },
              {
                label: 'Push to remote',
                click: async ()=>{
                  try
                  {
                    mainWindow.webContents.send('log',"Pushing to remote...", 'i')
                    var res = await GitBranchName()
                    await GitPushBranch(res)
                    mainWindow.webContents.send('log',"Branch pushed successfully", 'i')
                  }
                  catch(err)  { mainWindow.webContents.send('log',"Error while pushing" + err, 'e') }
                  
                }
              },
              {
                label: 'Pull from remote',
                click: async ()=>{
                  try
                  {
                    mainWindow.webContents.send('log',"Pulling from remote...", 'i')
                    await GitPull()
                    mainWindow.webContents.send('log',"Branch pulled successfully", 'i')
                  }
                  catch(err)  { mainWindow.webContents.send('log',"Error while pulling" + err, 'e') }
                }
              } 
            ],
          },
          {
            label: 'Repo',
            submenu: [
              {
                label: 'Set Remote Address',
                click: ()=>{OpenSetOriginDialog(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)}
              }, 
            ]
          }
        ]
      : []),
  
  ]);

  Menu.setApplicationMenu(menu)
}

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null);

  CreateMenu();
};

ipcMain.on('clicked-launch-difftool-btn', async (event, commitMessage: string) =>
{     
    
})

ipcMain.on('clicked-add-all-btn', async (event, commitMessage: string) =>
{     
    try
    {
      await GitAddAllChanges();
      Refresh();
    }catch(err)
    {
      mainWindow.webContents.send('log',"Error while staging files " + err, 'e');
    }
    
      
})

ipcMain.on('clicked-add-all-untracked-btn', async (event) =>
  {     
    try
    {
      await GitAddAllUntrackedFiles();
      console.log('add all')
      Refresh();
    }
    catch(error)
    {
      mainWindow.webContents.send('log',"Error while adding files, git reported:\n" + error, 'e')
    }
        
  })

ipcMain.on('clicked-delete-all-btn', async (event) =>
  {     

    dialog.showMessageBox(mainWindow, {
      type: 'info', // Type of dialog (info, error, question, etc.)
      title: 'Alert',
      message: 'Are you sure you want to delete all files?',
      buttons: ['OK', 'Cancel'], // Button(s) to display
    }).then(async result => {
      if(result.response == 0)
      {
        try
        {
          await GitDeleteAllUntrackedFiles();
          Refresh();
        }
        catch(error)
        {
         mainWindow.webContents.send('log',"Error while deleting files, git reported:\n" + error, 'e')
        }        
      }
      
    }).catch(err => {
    });
          
  })

ipcMain.on('clicked-difftool-file', async (event, fileName: string) =>
  {     
      await GitLaunchDifftoolOnOfile(fileName);
      Refresh();        
  })

  ipcMain.on('clicked-delete-file', async (event, fileName: string) =>
    {     
      dialog.showMessageBox(mainWindow, {
        type: 'info', // Type of dialog (info, error, question, etc.)
        title: 'Alert',
        message: 'Are you sure you want to delete this file?',
        buttons: ['OK', 'Cancel'], // Button(s) to display
      }).then(async result => {
        if(result.response == 0)
        {
          try
          {
            await GitDeleteUntrackedFile(fileName);
            mainWindow.webContents.send('update-diff-area'," ") //Clear diff area
            Refresh();
          }
          catch(error)
          {
            mainWindow.webContents.send('log',"Error while deleting " + fileName, 'e')
            mainWindow.webContents.send('log',"-- Recommendation: manually delete the file", 'w')   
          }
          
        }
        
      }).catch(err => {
      });        
    })

ipcMain.on('clicked-discard-file-changes', async (event, fileName: string) =>
  {     
    dialog.showMessageBox(mainWindow, {
      type: 'info', // Type of dialog (info, error, question, etc.)
      title: 'Alert',
      message: 'Are you sure you want to discard changes to this file?',
      buttons: ['OK', 'Cancel'], // Button(s) to display
    }).then(async result => {
      if(result.response == 0)
      {
        await GitDiscardFileChanges(fileName);
        mainWindow.webContents.send('update-diff-area'," ") //Clear diff area
        Refresh();
      }
      
    }).catch(err => {
    });
        
  })

ipcMain.on('clicked-discard-all-btn', async (event, commitMessage: string) =>
{     
  dialog.showMessageBox(mainWindow, {
    type: 'info', // Type of dialog (info, error, question, etc.)
    title: 'Alert',
    message: 'Are you sure you want to discard all changes?',
    buttons: ['OK', 'Cancel'], // Button(s) to display
  }).then(async result => {
    if(result.response == 0)
    {
      await GitDiscardAllChanges();
      mainWindow.webContents.send('update-diff-area'," ") //Clear diff area
      Refresh();
    }
    
  }).catch(err => {
  });
   
})

ipcMain.on('clicked-add-file', async (event, filename: string) =>
  {     
    try{
      await GitStageFile(filename); 
      Refresh();
    }catch(error) {
      mainWindow.webContents.send('log',"Error while staging " + filename, 'e')
      mainWindow.webContents.send('log',"-- Recommendation: discard changes to this file", 'w')    
    }
  })

ipcMain.on('clicked-confirm-commit', async (event, commitMessage: string) =>
  {     
    console.log('commit message ' + commitMessage)
    event.reply('confirm-commit-response', 'close') //Tell the window to close
    try{
      await GitCommitStaged(commitMessage); 
      Refresh();
    }catch(error) {
      mainWindow.webContents.send('log',"Error while commiting ", 'e')
      }    
  })

ipcMain.on('clicked-confirm-origin-url', async (event, url: string) =>
  {     
    try
    {
      await GitSetOrigin(url);
      mainWindow.webContents.send('log',"Remote URL added: " + url, 'i')
    event.reply('confirm-url-response', 'close') //Tell the window to close

    }catch(err)
    {
      mainWindow.webContents.send('log',"Error while settign origin: " + err, 'e')
    }
  })

ipcMain.on('clicked-untracked-file', async (event, fileName: string)=>
  { 
    try{
      var content = await ReadFile(fileName); 
      mainWindow.webContents.send('update-diff-area',content) //Clear diff area

      Refresh();
    }catch(error) {
      mainWindow.webContents.send('log',error, 'w')    
    }
  })

ipcMain.on('clicked-staged-file', (event, fileName: string)=>
  { 
    try{
      GitUnstageFile(fileName); 
      Refresh();
    }catch(error) {
      mainWindow.webContents.send('log',"Error while unstaging file " + error, 'e')
      
    }
  })



ipcMain.on('clicked-changed-file', async (event, fileName: string)=>
  {
    try{
     var res = await GitDiffFile(fileName); 
     mainWindow.webContents.send('update-diff-area',res)
     Refresh();
    }
    catch(error) {
      mainWindow.webContents.send('log',"Error while staging " + fileName, 'e')
      mainWindow.webContents.send('log',"\tRecommendation: discard changes to this file " + fileName, 'w')
    }
  })

  ipcMain.on('clicked-commit-btn', async (event, fileName: string)=>
    { 
      OpenCommitDialog(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)

    })

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function Refresh(){
  try
  {
    var name = await GitBranchName();
    mainWindow.webContents.send('update-branch-name',name)
  }
  catch(error)
  {
    mainWindow.webContents.send('update-branch-name','master')
    mainWindow.webContents.send('log','Looks like there are no commits, is this a fresh repo?', 'w')
  }
  

  var changelist = await GitChangeList()
  mainWindow.webContents.send('update-change-list',changelist)

  var untracked = await GitUntrackedFiles();
  mainWindow.webContents.send('update-untracked-list',untracked)

  var staged = await GitStagedList();
  mainWindow.webContents.send('update-staged-list',staged)

  var commits = await GitLog();
  mainWindow.webContents.send('update-log-list',commits)
}

///Pick folder to repo
async function openFolderPicker() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'], // Allow only directory selection
  });

  if (!result.canceled) {
    const selectedFolderPath = result.filePaths[0]; // Get the selected folder path
    
    ChangeDir(selectedFolderPath)

    try{
      isValidRepo = true
      CreateMenu();

      //Start watcher
      chokiWathcer = chokidar.watch(selectedFolderPath, {
        persistent: true,
        ignoreInitial: true, // Ignore initial add events
        usePolling: true, // Use polling instead of native events for better compatibility
        interval: 100, // Polling interval (in milliseconds)
        binaryInterval: 300, // Polling interval for binary files
        awaitWriteFinish: { // Wait for the file write to finish
            stabilityThreshold: 1000, // Wait for 1 second after a write
            pollInterval: 100 // Polling interval while waiting
        }
      });

      chokiWathcer.on('all', (event: any, path: any) => {
        console.log("Refresh")
        Refresh();
      
      });

      var title = await GitTopLevel();
      var tokens = title.split('/')
      var name = tokens.at(tokens.length -1)
      mainWindow.webContents.send('update-title',name)
    
    }
    catch(error)
    {
      dialog.showMessageBox(mainWindow, {
        type: 'info', // Type of dialog (info, error, question, etc.)
        title: 'Alert',
        message: 'This is not a valid git repo!',
        buttons: ['OK'], // Button(s) to display
      }).then(result => {
      }).catch(err => {
      });
    }

    Refresh();

    // You can perform further actions with the selected folder here
  } else {
    console.log('Folder selection was canceled');
  }
}
//Handles, invoked by code in dialog html

ipcMain.handle('get-branch-list', (event, remote: boolean)=>
  { 
    try{
      return GitBranchList(remote)
    }catch(error) {
      mainWindow.webContents.send('log',"Error while fetching branch list " + error, 'e')
      
    }
  })

ipcMain.handle('checkout-branch', async (event, branchName: string, dialogWindow: Electron.BrowserWindow)=>
  { 
    try{
      await dialog.showMessageBox(dialogWindow, {
        type: 'info', // Type of dialog (info, error, question, etc.)
        title: 'Alert',
        message: 'Are you sure you want to switch branch?',
        buttons: ['OK', 'Cancel'], // Button(s) to display
      }).then(async result => {
        if(result.response == 0)
        {
          await GitCheckoutBranch(branchName)
          return true;
        }
      }).catch(err => {
      });

      
    }catch(error) {
      mainWindow.webContents.send('log',"Error while checking out branch " + error, 'e')
      return false;
    }
})

ipcMain.handle('checkout-track-branch', async (event, branchName: string, dialogWindow: Electron.BrowserWindow)=>
  { 
    try{
      await dialog.showMessageBox(dialogWindow, {
        type: 'info', // Type of dialog (info, error, question, etc.)
        title: 'Alert',
        message: 'Are you sure you want to track this branch?',
        buttons: ['OK', 'Cancel'],
      }).then(async result => {
        if(result.response == 0)
        {
          try
          {
            await GitCheckoutTrackBranch(branchName)
            return true;
          }
          catch(error)
          {
              mainWindow.webContents.send('log',"Error while checking out branch " + error, 'e')
              return false;
          }
        }
      }).catch(err => {
      });
      
    }catch(error) {
      mainWindow.webContents.send('log',"Error while checking out branch " + error, 'e')
      return false;
    }
})