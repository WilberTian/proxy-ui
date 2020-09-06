import { BrowserWindow } from 'electron'

let loadingWindow

function createLoadingWindow () {
  loadingWindow = new BrowserWindow(
    Object.assign({
      height: 360,
      frame: false,
      width: 500,
      show: false,
      movable: false,
      resizable: false
    })
  )

  if (process.env.NODE_ENV === 'development') {
    loadingWindow.loadURL('http://localhost:9080/loading.html')
  } else {
    loadingWindow.loadURL(`file://${__dirname}/loading.html`)
  }

  loadingWindow.on('closed', () => (loadingWindow = null))
  loadingWindow.webContents.on('did-finish-load', () => {
    loadingWindow.show()
  })
}

export function showLoadingWindow () {
  if (!loadingWindow) {
    createLoadingWindow()
  } else {
    loadingWindow.show()
  }
}

export function hideLoadingWindow (isClose = false) {
  if (loadingWindow) {
    if (isClose) {
      loadingWindow.close()
      loadingWindow = null
    } else {
      loadingWindow.hide()
    }
  }
}
