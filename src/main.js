/* eslint-disable no-unused-vars */
require('custom-env').env()
const electron = require('electron')
const { autoUpdater } = require('electron-updater')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const screen = electron.screen
const path = require('path')
const url = require('url')
const dispatch = (data) => {
    console.log(data)
}
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function createWindow() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({width: width, height: height,show: false,autoHideMenuBar:true , webPreferences: { nodeIntegration: true }})

    // and load the index.html of the app.
    const startUrl =  url.format({
        pathname: path.join(__dirname, '/../app/index.html'),
        protocol: 'file:',
        slashes: true
    })
    let urls= 'http://localhost:3000'
    mainWindow.loadURL(process.env.DEV_ELECTRON=='true'? urls: startUrl)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        autoUpdater.checkForUpdatesAndNotify()
    })
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
 
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }

})
autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('checking-for-update')
})
  
autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update_available')
})
  
autoUpdater.on('update-not-available', (info) => {
    console.log(info)
    mainWindow.webContents.send('update-not-available')

})
  
autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update_error')

    dispatch('Error in auto-updater. ' + err)
})
  

  
autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update_downloaded')
})
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall()
})
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() })
})