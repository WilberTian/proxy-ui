import { app } from 'electron'
import axios from 'axios'

const fs = require('fs')
const path = require('path')
const log = require('electron-log')

const REQUEST_INFO_LIST_FILE = 'request-info-list.json'

const userDataPath = app.getPath('userData')

export default {
  readRequestList: function () {
    try {
      const requestList = fs.readFileSync(
        path.resolve(userDataPath, REQUEST_INFO_LIST_FILE),
        {
          encoding: 'utf8'
        }
      )
      if (requestList) {
        log.info(`readRequestList: ${requestList}`)
        return JSON.parse(requestList)
      }
      log.info(`readRequestList: get empty request list`)
      return []
    } catch (e) {
      log.info(`readRequestList: no request list file`)
      return []
    }
  },
  writeRequestList: function (requestList) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, REQUEST_INFO_LIST_FILE),
        JSON.stringify(requestList)
      )
      log.info(`writeRequestList: ${JSON.stringify(requestList)}`)
      return true
    } catch (e) {
      log.error(`writeRequestList: ${e.message}`)
      return false
    }
  },
  processRequest: function (requestInfo, proxyConfig, withProxy = false) {
    const proxyPort = proxyConfig.port
    const proxy = {
      host: '127.0.0.1',
      port: proxyPort
    }

    const requestParams = {
      method: requestInfo.method,
      url: `${requestInfo.protocol}://${requestInfo.host}${requestInfo.path}`,
      headers: requestInfo.reqHeader || {},
      data: requestInfo.reqBody || {}
    }

    if (withProxy) {
      requestParams.proxy = proxy
    }

    return axios(requestParams)
  }
}
