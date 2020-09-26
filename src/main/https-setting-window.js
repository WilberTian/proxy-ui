import { BrowserWindow, ipcMain } from 'electron'

let httpsSettingWindow

const httpsSettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/https-setting-window.html`
    : `file://${__dirname}/https-setting-window.html`

const WIN_WIDTH = 500
const WIN_HEIGHT = 300

function createHttpsSettingWindow () {
  httpsSettingWindow = new BrowserWindow({
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

  httpsSettingWindow.loadURL(httpsSettingURL)
  httpsSettingWindow.show()

  httpsSettingWindow.on('closed', () => {
    httpsSettingWindow = null
  })
}

export default function showHttpsSettingWindow () {
  if (!httpsSettingWindow) {
    createHttpsSettingWindow()
    ipcMain.on('https-setting-close', () => {
      if (httpsSettingWindow) {
        global.httpsSettingWindow = null
        httpsSettingWindow.close()
      }
    })
    global.httpsSettingWindow = httpsSettingWindow
  } else {
    // httpsSettingWindow.show()
  }
}
