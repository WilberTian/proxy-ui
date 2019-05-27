'use strict'

import { app, BrowserWindow, dialog, Tray, Menu } from 'electron'
import pkg from '../../package.json'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

let mainWindow
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
    height: 600,
    useContentSize: true,
    width: 900
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', event => {
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)
    event.preventDefault()
  })

  tray = new Tray(`${__static}/16x16.png`)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '关于',
      click () {
        dialog.showMessageBox({
          title: 'proxy-ui',
          message: 'proxy-ui',
          detail: `Version: ${pkg.version}\nAuthor: WilberTian\nGithub: `
        })
      }
    },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy()
        app.quit()
      }
    }
  ])
  tray.setToolTip('proxy-ui')
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible()
      ? mainWindow.setSkipTaskbar(false)
      : mainWindow.setSkipTaskbar(true)
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
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
