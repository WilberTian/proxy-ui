import { BrowserWindow, ipcMain } from 'electron'

let weinreSettingWindow

const weinreSettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/weinre-setting-window.html`
    : `file://${__dirname}/weinre-setting-window.html`

const WIN_WIDTH = 500
const WIN_HEIGHT = 300

function createWeinreSettingWindow () {
  weinreSettingWindow = new BrowserWindow({
    height: WIN_HEIGHT,
    width: WIN_WIDTH,
    minHeight: WIN_HEIGHT,
    minWidth: WIN_WIDTH,
    frame: false,
    useContentSize: true,
    show: false,
    parent: global.mainWindow,
    modal: true
  })

  weinreSettingWindow.loadURL(weinreSettingURL)

  weinreSettingWindow.webContents.on('did-finish-load', () => {})

  weinreSettingWindow.on('closed', () => {
    weinreSettingWindow = null
  })

  weinreSettingWindow.show()
}

export default function showWeinreSettingWindow () {
  if (!weinreSettingWindow) {
    createWeinreSettingWindow()
    ipcMain.on('weinre-setting-close', () => {
      weinreSettingWindow.hide()
    })
    global.weinreSettingWindow = weinreSettingWindow
  } else {
    weinreSettingWindow.show()
  }
}
