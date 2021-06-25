const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, windowStateKeepter } = require('electron'),
    path = require('path'),
    fs = require('fs')

var win = null
var tray = null
var initPath = path.join(app.getAppPath(), 'init.json')
var bounds = null

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

function createWindow() {
    Menu.setApplicationMenu(null)

    try {
        bounds = JSON.parse(fs.readFileSync(initPath, 'utf8'))
    }
    catch (e) {
        bounds = null
    }

    win = new BrowserWindow({
        title: app.getName(),
        icon: path.join('assets', 'logo.png'),
        minWidth: 800,
        width: bounds ? bounds.width : 800,
        x: bounds ? bounds.x : null,
        minHeight: 600,
        height: bounds ? bounds.height : 600,
        y: bounds ? bounds.y : null,
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
    //win.openDevTools()
    win.show()

    // Window events
    win.on('minimize', (event) => {
        event.preventDefault()
        win.hide()
        tray = createTray()
    })

    win.on('resize', handleInitSaveBounds)

    win.on('move', handleInitSaveBounds)

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
        dialog.showSaveDialog(win, {
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
                })
            }
        }).catch(err => {
            console.log(err)
        })
    })
}

function createTray() {
    let tray = new Tray(path.join('assets', 'logo.png'))
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

function handleInitSaveBounds() {
    fs.writeFileSync(initPath, JSON.stringify(win.getBounds()))
}
