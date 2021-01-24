import {
  BrowserWindow,
  ipcMain
} from 'electron'

let proxySettingWindow

const proxySettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/proxy-setting-window.html`
    : `file://${__dirname}/proxy-setting-window.html`

const WIN_WIDTH = 660
const WIN_HEIGHT = 500

function createProxySettingWindow () {
  proxySettingWindow = new BrowserWindow({
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

  proxySettingWindow.loadURL(proxySettingURL)
  proxySettingWindow.show()

  proxySettingWindow.on('closed', () => {
    proxySettingWindow = null
  })
}

export default function showProxySettingWindow () {
  if (!proxySettingWindow) {
    createProxySettingWindow()
    ipcMain.on('proxy-setting-close', () => {
      if (proxySettingWindow) {
        global.proxySettingWindow = null
        proxySettingWindow.close()
      }
    })
    global.proxySettingWindow = proxySettingWindow
  } else {
    // proxySettingWindow.show()
  }
}
