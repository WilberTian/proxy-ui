import { app } from 'electron'
import { defaultWeinreConfig } from './constatns'

const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const throttle = require('lodash.throttle')

const WEINRE_CONFIG_FILE = 'weinre-config.json'

const userDataPath = app.getPath('userData')

let weinreLog = []

const _emitWeinreLogUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('weinre-log-updated')
}, 500)

const _addWeinreLog = weinreLogItem => {
  weinreLog.push(weinreLogItem)
  if (global.mainWindow) {
    _emitWeinreLogUpdatedEvent(global.mainWindow)
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
        return JSON.parse(weinreConfig)
      }
      return {}
    } catch (e) {
      const result = this.writeWeinreConfig(defaultWeinreConfig)
      if (result) {
        return defaultWeinreConfig
      }
      return {}
    }
  },
  writeWeinreConfig: function (weinreConfig) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, WEINRE_CONFIG_FILE),
        JSON.stringify(weinreConfig)
      )
      return true
    } catch (e) {
      return false
    }
  },
  startWeinre (options) {
    return new Promise((resolve, reject) => {
      if (!global.weinreProcess) {
        try {
          let rootPath = __dirname
          console.log(process.env.NODE_ENV, __dirname)
          if (process.env.NODE_ENV === 'development') {
            rootPath = path.resolve(__dirname, '../../')
          }
          const weinreConfig = this.readWeinreConfig()
          global.weinreProcess = spawn('node', [`${rootPath}/apache-weinre/weinre`, '--boundHost', '-all-', '--httpPort', `${weinreConfig.port}`], { detached: true })
          global.weinreProcess.stdout.on('data', (data) => {
            _addWeinreLog({
              detail: data,
              isErr: false
            })
            resolve('weinre已经启动')
          })
          global.weinreProcess.stderr.on('data', (err) => {
            _addWeinreLog({
              detail: err,
              isErr: true
            })
            global.weinreProcess = null
            reject(new Error('weinre启动失败'))
          })

          global.weinreProcess.on('error', (err) => {
            _addWeinreLog({
              detail: err,
              isErr: true
            })
            global.weinreProcess = null
            reject(new Error('weinre启动失败'))
          })
        } catch (e) {
          reject(e)
        }
      }
      resolve('weinre已经启动')
    })
  },
  stopWeinre () {
    return new Promise((resolve, reject) => {
      try {
        weinreLog = []
        if (global.weinreProcess) {
          process.kill(-global.weinreProcess.pid)
          global.weinreProcess = null
        }
        resolve('weinre已经关闭')
      } catch (e) {
        reject(e)
      }
    })
  },
  getWeinreLog () {
    return [...weinreLog]
  }
}
