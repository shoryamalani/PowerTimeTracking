// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// // Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   // eslint-disable-line global-require
//   app.quit();
// }

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//   });

//   // and load the index.html of the app.
//   mainWindow.loadFile(path.join(__dirname, 'index.html'));

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and import them here.
const {app, BrowserWindow} = require('electron');
var VERSION = app.getVersion();
const {PythonShell} = require('python-shell');
const child_process = require('child_process');
const util = require("util");
const execFile = util.promisify(child_process.execFile);
const path = require('path');
const fetch = require('node-fetch');
const fs = require("fs");
const { Server } = require('http');
const { time } = require('console');
const { start } = require('repl');
class HTTPResponseError extends Error {
	constructor(response, ...args) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`, ...args);
		this.response = response;
	}
}
async function startServer(){
    // PythonShell.run(path.join(app.getAppPath(), 'py/server.py'),null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });
    try{
        response = await fetch('http://127.0.0.1:5005/get_version');
        if(response.ok){
            const data = await response.json();
            if(data.version != VERSION){
                console.log("Updating server");
                fetch('http://127.0.0.1:5005/kill_server')
                setTimeout( function(){
                  start_server();
              },5000);
                 
            }
            console.log("server is running");
          } else {
            throw new HTTPResponseError(response);

        }
    }
    catch(err){
      console.log(err);
      start_server();
    }
    
    // document.getElementById("result").innerHTML = "Server started";
}
async function start_server(){
  await execFile(findPython(), [findServer()]).catch(err => {
    throw err;
  });
}

function findServer() {
  const possibilities = [
    // In packaged app
    path.join(process.resourcesPath,"app", "py/server.py"),
    // In development
    path.join(__dirname, "py/server.py"),
  ];
  for (const path of possibilities) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  console.log("Could not find server, checked", possibilities);
  app.quit();
}

function findPython() {
  const possibilities = [
    // In packaged app
    path.join(process.resourcesPath,"app", "python", "bin", "python3.9"),
    // In development
    path.join(__dirname, "python", "bin", "python3.9"),
  ];
  for (const path of possibilities) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  console.log("Could not find python3, checked", possibilities);
  app.quit();
}


function createWindow() {
    // Create the browser window.
    // PythonShell.run(path.join(app.getAppPath(),"..", 'py/server.py'),null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });   
    let win = new BrowserWindow({
        width: 1200,
        height: 800,
    });
    // PythonShell.run('py/server.py',null,function(err){
    //     if (err) throw err;
    //     console.log('finished engine');
    // });
    win.loadFile('src/index.html');
    // try{
    //     PythonShell.run(path.join(app.getAppPath(), 'py/server.py'),null,function(err){
    //         if (err) throw err;
    //         console.log('finished engine');
    //     });
    // }
    // catch(err){
    //     console.log(err);
    //     // PythonShell.run('py/server.py',null,function(err){
    //     //     if (err) throw err;
    //     //     console.log('finished engine');
    //     // });
            
    // }
    win.openDevTools();
    startServer();


    // and load the index.html of the app.
    
    
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      
      app.quit();
    }
});

app.on('activate',() => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }

})
