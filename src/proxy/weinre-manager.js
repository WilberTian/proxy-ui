import { app } from 'electron'
import { defaultWeinreConfig } from './constatns'

const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const AdmZip = require('adm-zip')
const throttle = require('lodash.throttle')
const log = require('electron-log')

const WEINRE_CONFIG_FILE = 'weinre-config.json'

const userDataPath = app.getPath('userData')

let weinreLog = []
let isWeinreRunning = false

const _emitWeinreLogUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('weinre-log-updated')
}, 500)

const _addWeinreLog = weinreLogItem => {
  weinreLog.push(weinreLogItem)
  if (global.mainWindow) {
    _emitWeinreLogUpdatedEvent(global.mainWindow)
  }
}

const _setWeinreStatus = (status) => {
  isWeinreRunning = status
  if (global.weinreWindow) {
    global.weinreWindow.webContents.send('weinre-status-updated')
  }
}

export default {
  readWeinreConfig: function () {
    try {
      const weinreConfig = fs.readFileSync(
        path.resolve(userDataPath, WEINRE_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
      if (weinreConfig) {
        log.info(`readWeinreConfig: ${weinreConfig}`)
        return JSON.parse(weinreConfig)
      }
      log.info(`readWeinreConfig: get default weinre config`)
      return defaultWeinreConfig
    } catch (e) {
      log.info(`readWeinreConfig: no weinre config file`)
      this.writeWeinreConfig(defaultWeinreConfig)
      return defaultWeinreConfig
    }
  },
  writeWeinreConfig: function (weinreConfig) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, WEINRE_CONFIG_FILE),
        JSON.stringify(weinreConfig)
      )
      log.info(`writeWeinreConfig: ${JSON.stringify(weinreConfig)}`)
      return true
    } catch (e) {
      log.error(`writeWeinreConfig: ${e.message}`)
      return false
    }
  },
  startWeinre (options) {
    return new Promise((resolve, reject) => {
      if (!global.weinreProcess) {
        try {
          let rootPath = __dirname.replace('app.asar', 'app.asar.unpacked')
          if (process.env.NODE_ENV === 'development') {
            rootPath = path.resolve(__dirname, '../../')
          }
          const weinreFolder = path.resolve(rootPath, 'apache-weinre')
          if (!fs.existsSync(weinreFolder)) {
            const unzip = new AdmZip(path.resolve(rootPath, 'apache-weinre.zip'))
            unzip.extractAllTo(rootPath, true)
            log.info(`startWeinre: unzip apache-weinre.zip`)
          }

          const weinreConfig = this.readWeinreConfig()
          global.weinreProcess = fork(path.resolve(__dirname, 'weinre-process.js'), [`${rootPath}/apache-weinre/lib/weinre`, `${weinreConfig.port}`], { detached: true, silent: true })
          global.weinreProcess.stdout.on('data', (data) => {
            _addWeinreLog({
              detail: data,
              isErr: false
            })
            _setWeinreStatus(true)
            resolve('weinre已经启动')
          })
          global.weinreProcess.stderr.on('data', (err) => {
            _addWeinreLog({
              detail: err,
              isErr: true
            })
            global.weinreProcess = null
            _setWeinreStatus(false)
            log.error(`startWeinre: ${err.message}`)
            reject(new Error('weinre启动失败'))
          })

          global.weinreProcess.on('error', (err) => {
            _addWeinreLog({
              detail: err,
              isErr: true
            })
            global.weinreProcess = null
            _setWeinreStatus(false)
            log.error(`startWeinre: ${err.message}`)
            reject(new Error('weinre启动失败'))
          })
        } catch (e) {
          reject(e)
        }
      } else {
        resolve('weinre已经启动')
      }
    })
  },
  stopWeinre () {
    return new Promise((resolve, reject) => {
      try {
        weinreLog = []
        if (global.weinreProcess) {
          log.info(`stopWeinre: kill ${global.weinreProcess.pid}`)
          process.kill(-global.weinreProcess.pid)
          global.weinreProcess = null
          _setWeinreStatus(false)
        }
        resolve('weinre已经关闭')
      } catch (e) {
        log.error(`stopWeinre: ${e.message}`)
        reject(e)
      }
    })
  },
  getWeinreLog () {
    return [...weinreLog]
  },
  getWeinreStatus () {
    return isWeinreRunning
  }
}
