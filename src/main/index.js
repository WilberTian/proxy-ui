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

let mainWindow
let loadingWindow
let cacheSettingWindow
// let httpsSettingWindow
let tray

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

const cacheSettingURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/cache-setting.html`
    : `file://${__dirname}/cache-setting.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 660,
    width: 900,
    minHeight: 660,
    minWidth: 900,
    frame: false,
    useContentSize: true,
    show: false
  })

  global.mainWindow = mainWindow

  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      mainWindow.show()
      if (loadingWindow) {
        loadingWindow.close()
      }
    }, 1500)
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
      label: '工具',
      submenu: [
        {
          label: '缓存设置',
          click () {
            if (!cacheSettingWindow) {
              createCacheSettingWindow()
            } else {
              cacheSettingWindow.show()
            }
          }
        }
        // {
        //   label: 'HTTPS设置',
        //   click () {
        //     if (!httpsSettingWindow) {
        //       createHttpsSettingWindow()
        //     } else {
        //       httpsSettingWindow.show()
        //     }
        //   }
        // }
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

function createCacheSettingWindow () {
  cacheSettingWindow = new BrowserWindow({
    height: 300,
    width: 500,
    minHeight: 300,
    minWidth: 500,
    frame: false,
    useContentSize: true,
    show: false
  })

  global.cacheSettingWindow = cacheSettingWindow

  cacheSettingWindow.loadURL(cacheSettingURL)

  cacheSettingWindow.webContents.on('did-finish-load', () => {})

  cacheSettingWindow.on('closed', () => {
    cacheSettingWindow = null
  })

  cacheSettingWindow.show()

  ipcMain.on('cache-setting-close', () => {
    cacheSettingWindow.hide()
  })
}

// function createHttpsSettingWindow () {
//   httpsSettingWindow = new BrowserWindow({
//     height: 300,
//     width: 500,
//     minHeight: 300,
//     minWidth: 500,
//     frame: false,
//     useContentSize: true,
//     show: false
//   })

//   httpsSettingWindow.loadURL('http://localhost:9080/loading.html')

//   httpsSettingWindow.webContents.on('did-finish-load', () => {})

//   httpsSettingWindow.on('closed', () => {
//     httpsSettingWindow = null
//   })

//   httpsSettingWindow.show()
// }

app.on('ready', () => {
  createLoadingWindow()
  createWindow()
  createMenu()
  createTray()
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
  }
  if (!mainWindow.isVisible() && !loadingWindow) {
    mainWindow.show()
  }
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
