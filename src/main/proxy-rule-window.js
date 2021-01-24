import { BrowserWindow, ipcMain } from 'electron'

let proxyRuleWindow

const proxyRuleURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/proxy-rule-window.html`
    : `file://${__dirname}/proxy-rule-window.html`

const WIN_WIDTH = 800
const WIN_HEIGHT = 640

function createProxyRuleWindow () {
  proxyRuleWindow = new BrowserWindow({
    height: WIN_HEIGHT,
    width: WIN_WIDTH,
    minHeight: WIN_HEIGHT,
    minWidth: WIN_WIDTH,
    frame: false,
    useContentSize: true,
    show: false,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  proxyRuleWindow.loadURL(proxyRuleURL)
  proxyRuleWindow.show()

  proxyRuleWindow.on('closed', () => {
    proxyRuleWindow = null
  })
}

export default function showProxyRuleWindow () {
  if (!proxyRuleWindow) {
    createProxyRuleWindow()
    ipcMain.on('proxy-rule-form-close', () => {
      if (proxyRuleWindow) {
        proxyRuleWindow.close()
      }
    })
  } else {
    proxyRuleWindow.show()
  }
}
