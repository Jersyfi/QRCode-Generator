const { app, BrowserWindow, Menu, Tray, ipcMain, dialog } = require('electron'),
    path = require('path'),
    fs = require('fs')

var win = null
var tray = null

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

function createWindow() {
    Menu.setApplicationMenu(null)

    win = new BrowserWindow({
        title: app.getName(),
        icon: path.join('assets', 'Logo.png'),
        minWidth: 800,
        width: 1280,
        minHeight: 600,
        height: 720,
        show: false,
        frame: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
            plugins: true
        }
    })

    win.loadFile('index.html')
    win.openDevTools()
    win.show()

    // Window events
    win.on('minimize', (event) => {
        event.preventDefault()
        win.hide()
        tray = createTray()
    })

    win.on('resize', (event) => {
        // store data
    })

    win.on('maximize', (event) => {
        win.webContents.send('fe-event-max')
    })

    win.on('unmaximize', (event) => {
        win.webContents.send('fe-event-restore')
    })

    // ipcMain Events
    ipcMain.on('be-event-min', () => {
        win.minimize()
    })

    ipcMain.on('be-event-max', () => {
        win.maximize()
    })

    ipcMain.on('be-event-restore', () => {
        win.unmaximize()
    })
    
    ipcMain.on('be-event-close', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    ipcMain.on('be-event-qrcodesave', (event, image) => {
        dialog.showSaveDialog({
            title: 'Generierten QRCode Speichern',
            filters: [
                {
                    name: 'Images',
                    extensions: ['png']
                }
            ]
        }).then(result => {
            if (!result.canceled) {
                const data = image.replace(/^data:image\/\w+;base64,/, '')

                fs.writeFile(result.filePath.toString(), data, 'base64', (err) => {
                    if (err) throw err
                    console.log('saved qrcode')
                })
            }
        }).catch(err => {
            console.log(err)
        })
    })
}

function createTray() {
    let tray = new Tray(path.join('assets', 'Logo.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: () => {
                win.show()
                tray.destroy()
            }
        },
        {
            label: 'Exit', click: () => {
                app.quit()
            }
        }
    ])

    tray.on('double-click', () => {
        win.show()
        tray.destroy()
    })
    tray.setToolTip('QRCode Generator')
    tray.setContextMenu(contextMenu)
}