import { BrowserWindow, ipcMain } from 'electron'
import { moveWindowToCenter } from './utils'

let proxyRuleWindow

const proxyRuleURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/proxy-rule-window.html`
    : `file://${__dirname}/proxy-rule-window.html`

const WIN_WIDTH = 800
const WIN_HEIGHT = 640

function createProxyRuleWindow (data) {
  proxyRuleWindow = new BrowserWindow({
    height: WIN_HEIGHT,
    width: WIN_WIDTH,
    minHeight: WIN_HEIGHT,
    minWidth: WIN_WIDTH,
    frame: false,
    useContentSize: true,
    show: false
  })

  proxyRuleWindow.loadURL(proxyRuleURL)

  proxyRuleWindow.webContents.on('did-finish-load', () => {
    proxyRuleWindow.webContents.send('set-proxy-rule-config', data)
    proxyRuleWindow.show()
  })

  proxyRuleWindow.on('closed', () => {
    proxyRuleWindow = null
  })
}

export default function showProxyRuleWindow (data) {
  if (!proxyRuleWindow) {
    createProxyRuleWindow(data)
    ipcMain.on('proxy-rule-form-close', () => {
      proxyRuleWindow.hide()
    })
  } else {
    const {x, y} = moveWindowToCenter(WIN_WIDTH, WIN_HEIGHT)
    proxyRuleWindow.setPosition(x, y)
    proxyRuleWindow.webContents.send('set-proxy-rule-config', data)
    proxyRuleWindow.show()
  }
}
