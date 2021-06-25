// Windows Button Events
const { ipcRenderer } = require("electron")

var btnMin = document.getElementById('win-button-min'),
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

var qrCanvas = document.getElementById('qrCanvas'),
    qrInputUrl = document.getElementById('qrInputUrl'),
    qrCanvasPlaceholder = document.getElementById('qrCanvasPlaceholder')

var qrBtnJPG = document.getElementById('qrBtnJPG'),
    qrBtnPNG = document.getElementById('qrBtnPNG'),
    qrBtnSVG = document.getElementById('qrBtnSVG')

qrInputUrl.addEventListener('keyup', () => {
    if (qrInputUrl.value == '') {
        qrCanvasPlaceholder.classList.remove('qr-inactive')
        qrCanvas.classList.add('qr-inactive')

        //qrBtnJPG.classList.add('qr-inactive')
        qrBtnPNG.classList.add('qr-inactive')
        //qrBtnSVG.classList.add('qr-inactive')

        //qrBtnJPG.removeEventListener('click', handleSaveClick, true)
        qrBtnPNG.removeEventListener('click', handleSaveClick, true)
        //qrBtnSVG.removeEventListener('click', handleSaveClick, true)
    } else {
        qrCanvas.classList.remove('qr-inactive')
        qrCanvasPlaceholder.classList.add('qr-inactive')

        //qrBtnJPG.classList.remove('qr-inactive')
        qrBtnPNG.classList.remove('qr-inactive')
        //qrBtnSVG.classList.remove('qr-inactive')

        //qrBtnJPG.addEventListener('click', handleSaveClick)
        qrBtnPNG.addEventListener('click', handleSaveClick)
        //qrBtnSVG.addEventListener('click', handleSaveClick)

        QRCode.toCanvas(qrCanvas, qrInputUrl.value, { errorCorrectionLevel: 'H', scale: 10 }, (error) => {
            if (error) console.log(error)
        })
    }
})

const handleSaveClick = (event) => {
    console.log(event)
    ipcRenderer.send('be-event-qrcodesave', qrCanvas.toDataURL())
}
