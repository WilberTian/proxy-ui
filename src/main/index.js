'use strict'

import {
  app,
  BrowserWindow,
  dialog,
  Tray,
  Menu,
  ipcMain
} from 'electron'
import _manager from '../proxy/index'
import showProxySettingWindow from './proxy-setting-window'
import showCacheSettingWindow from './cache-setting-window'
import showHttpsSettingWindow from './https-setting-window'
import showVconsoleSettingWindow from './vconsole-setting-window'
import showWeinreSettingWindow from './weinre-setting-window'
import showProxyRuleWindow from './proxy-rule-window'
import {showLoadingWindow, hideLoadingWindow} from './loading-window'

import pkg from '../../package.json'

const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

global.gDataStore = {
  selectedRuleConfig: null
}

let mainWindow
// let httpsSettingWindow
let tray

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

const MAINWIN_WIDTH = 1000
const MAINWIN_HEIGHT = 760

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minHeight: MAINWIN_HEIGHT,
    minWidth: MAINWIN_WIDTH,
    frame: false,
    useContentSize: true,
    show: false
  })

  global.mainWindow = mainWindow

  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      mainWindow.maximize()
      mainWindow.show()
      hideLoadingWindow(true)
    }, 500)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.on('window-close', () => {
    mainWindow.hide()
  })
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.on('window-fullscreen', () => {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false)
    } else {
      mainWindow.setFullScreen(true)
    }
  })
}

function createMenu () {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Proxy UI',
      submenu: [
        {
          label: '关于',
          click () {
            dialog.showMessageBox({
              title: 'Proxy UI',
              message: 'Proxy UI',
              detail: `Version: ${pkg.version}\nAuthor: WilberTian\nGithub: `
            })
          }
        },
        {
          label: '退出',
          accelerator: 'Cmd+Q',
          role: 'quit'
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'paste' },
        { label: '粘贴', role: 'copy' },
        { label: '全选', role: 'selectAll' }
      ]
    },
    {
      label: '代理',
      submenu: [
        {
          label: '代理设置',
          click () {
            showProxySettingWindow()
          }
        },
        {
          label: 'HTTPS设置',
          click () {
            //
          }
        }
      ]
    },
    {
      label: '代理规则',
      submenu: [
        {
          label: '规则管理',
          click () {
            //
          }
        },
        {
          label: '新建规则',
          click () {
            showProxyRuleWindow()
          }
        },
        {
          label: '导出规则',
          click () {
            mainWindow.webContents.send('export-rule-config')
          }
        },
        {
          label: '导入规则',
          click () {
            mainWindow.webContents.send('import-rule-config')
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '按域名分组',
          type: 'radio',
          checked: true,
          click () {
            //
          }
        },
        {
          label: '按请求顺序',
          type: 'radio',
          click () {
            //
          }
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '缓存设置',
          click () {
            showCacheSettingWindow()
          }
        },
        {
          label: 'HTTPS设置',
          click () {
            showHttpsSettingWindow()
          }
        },
        {
          label: 'vconsole设置',
          click () {
            showVconsoleSettingWindow()
          }
        },
        {
          label: 'weinre设置',
          click () {
            showWeinreSettingWindow()
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

function createTray () {
  tray = new Tray(`${__static}/tray-icon.png`)
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
  global.tray = tray
}

app.on('ready', () => {
  showLoadingWindow()
  createWindow()
  createMenu()
  createTray()
  ipcMain.on('show-proxy-setting-window', () => {
    showProxySettingWindow()
  })
  ipcMain.on('show-cache-setting-window', () => {
    showCacheSettingWindow()
  })
  ipcMain.on('show-https-setting-window', () => {
    showHttpsSettingWindow()
  })
  ipcMain.on('show-vconsole-setting-window', () => {
    showVconsoleSettingWindow()
  })
  ipcMain.on('show-weinre-setting-window', () => {
    showWeinreSettingWindow()
  })
  ipcMain.on('show-proxy-rule-window', (_, data) => {
    global.gDataStore.selectedRuleConfig = data
    showProxyRuleWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (tray) {
    tray.destroy()
    tray = null
  }
})

app.on('quit', () => {
  // try to clear global proxy config when quit
  _manager.clearGlobalProxyConfig()
  _manager.stopWeinre()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
  // if (!mainWindow.isVisible()) {
  //   showLoadingWindow()
  // }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
