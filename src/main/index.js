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
let tray

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

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
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectall' }
          ]
        },
        {
          label: '退出',
          accelerator: 'Cmd+Q',
          role: 'quit'
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
