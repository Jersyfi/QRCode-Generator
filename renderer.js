// Windows Button Events
const { ipcRenderer } = require("electron")

const btnMin = document.getElementById('win-button-min'),
    btnMax = document.getElementById('win-button-max'),
    btnRestore = document.getElementById('win-button-restore'),
    btnClose = document.getElementById('win-button-close')

btnMin.addEventListener('click', () => {
    ipcRenderer.send('be-event-min')
})

btnMax.addEventListener('click', () => {
    ipcRenderer.send('be-event-max')
})

btnRestore.addEventListener('click', () => {
    ipcRenderer.send('be-event-restore')
})

btnClose.addEventListener('click', () => {
    ipcRenderer.send('be-event-close')
})

ipcRenderer.on('fe-event-max', (event, msg) => {
    btnRestore.style.display = 'flex'
    btnMax.style.display = 'none'
})

ipcRenderer.on('fe-event-restore', (event, msg) => {
    btnMax.style.display = 'flex'
    btnRestore.style.display = 'none'
})

// QRCode
const QRCode = require('qrcode')

const qrCanvas = document.getElementById('qrCanvas'),
    qrBtnSave = document.getElementById('qrBtnSave'),
    qrInputUrl = document.getElementById('qrInputUrl'),
    qrCanvasPlaceholder = document.getElementById('qrCanvasPlaceholder')

qrInputUrl.addEventListener('keyup', () => {
    if (qrInputUrl.value == '') {
        qrCanvasPlaceholder.classList.remove('qr-inactive')
        qrCanvas.classList.add('qr-inactive')
        qrBtnSave.classList.add('qr-inactive')

        QRCode.toCanvas(qrCanvas, 'https://www.hepgmbh.de', (error) => {
            if (error) console.log(error)
        })

        qrBtnSave.removeEventListener('click', handleSaveClick, true)
    } else {
        qrCanvas.classList.remove('qr-inactive')
        qrCanvasPlaceholder.classList.add('qr-inactive')
        qrBtnSave.classList.remove('qr-inactive')

        QRCode.toCanvas(qrCanvas, qrInputUrl.value, { errorCorrectionLevel: 'H' }, (error) => {
            if (error) console.log(error)
        })
    
        qrBtnSave.addEventListener('click', handleSaveClick)
    }
})

const handleSaveClick = () => {
    ipcRenderer.send('be-event-qrcodesave', qrCanvas.toDataURL())
}