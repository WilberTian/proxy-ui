import { BrowserWindow, ipcMain } from 'electron'

let cacheSettingWindow

const cacheSettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/cache-setting-window.html`
    : `file://${__dirname}/cache-setting-window.html`

const WIN_WIDTH = 500
const WIN_HEIGHT = 300

function createCacheSettingWindow () {
  cacheSettingWindow = new BrowserWindow({
    height: WIN_HEIGHT,
    width: WIN_WIDTH,
    minHeight: WIN_HEIGHT,
    minWidth: WIN_WIDTH,
    frame: false,
    useContentSize: true,
    show: false,
    parent: global.mainWindow,
    modal: true,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  cacheSettingWindow.loadURL(cacheSettingURL)
  cacheSettingWindow.show()

  cacheSettingWindow.on('closed', () => {
    cacheSettingWindow = null
  })
}

export default function showCacheSettingWindow () {
  if (!cacheSettingWindow) {
    createCacheSettingWindow()
    ipcMain.on('cache-setting-close', () => {
      if (cacheSettingWindow) {
        global.cacheSettingWindow = null
        cacheSettingWindow.close()
      }
    })
    global.cacheSettingWindow = cacheSettingWindow
  } else {
    //
  }
}
