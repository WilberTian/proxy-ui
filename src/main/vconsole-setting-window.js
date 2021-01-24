import { BrowserWindow, ipcMain } from 'electron'

let vconsoleSettingWindow

const vconsoleSettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/vconsole-setting-window.html`
    : `file://${__dirname}/vconsole-setting-window.html`

const WIN_WIDTH = 500
const WIN_HEIGHT = 300

function createVconsoleSettingWindow () {
  vconsoleSettingWindow = new BrowserWindow({
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

  vconsoleSettingWindow.loadURL(vconsoleSettingURL)
  vconsoleSettingWindow.show()

  vconsoleSettingWindow.on('closed', () => {
    vconsoleSettingWindow = null
  })
}

export default function showVconsoleSettingWindow () {
  if (!vconsoleSettingWindow) {
    createVconsoleSettingWindow()
    ipcMain.on('vconsole-setting-close', () => {
      if (vconsoleSettingWindow) {
        global.vconsoleSettingWindow = null
        vconsoleSettingWindow.close()
      }
    })
    global.vconsoleSettingWindow = vconsoleSettingWindow
  } else {
    // vconsoleSettingWindow.show()
  }
}
