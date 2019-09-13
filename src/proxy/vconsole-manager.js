import { app } from 'electron'
import { defaultVconsoleConfig } from './constatns'

const fs = require('fs')
const path = require('path')
const log = require('electron-log')

const VCONSOLE_CONFIG_FILE = 'vconsole-config.json'

const userDataPath = app.getPath('userData')

export default {
  readVconsoleConfig: function () {
    try {
      const vconsoleConfig = fs.readFileSync(
        path.resolve(userDataPath, VCONSOLE_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
      if (vconsoleConfig) {
        log.info(`readVconsoleConfig: ${vconsoleConfig}`)
        return JSON.parse(vconsoleConfig)
      }
      log.info(`readVconsoleConfig: get default vconsole config`)
      return defaultVconsoleConfig
    } catch (e) {
      log.info(`readVconsoleConfig: no vconsole config file`)
      this.writeVconsoleConfig(defaultVconsoleConfig)
      return defaultVconsoleConfig
    }
  },
  writeVconsoleConfig: function (vconsoleConfig) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, VCONSOLE_CONFIG_FILE),
        JSON.stringify(vconsoleConfig)
      )
      global.vconsoleConfig = vconsoleConfig
      log.info(`writeVconsoleConfig: ${JSON.stringify(vconsoleConfig)}`)
      return true
    } catch (e) {
      log.error(`writeVconsoleConfig: ${e.message}`)
      return false
    }
  }
}
