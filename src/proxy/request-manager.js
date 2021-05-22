import { app } from 'electron'

const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const request = require('request')
const zlib = require('zlib')
const brotliTorb = require('brotli')

const REQUEST_INFO_LIST_FILE = 'request-info-list.json'

const userDataPath = app.getPath('userData')

export default {
  readRequestList: function() {
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
  writeRequestList: function(requestList) {
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
  processRequest: function(requestInfo, proxyConfig, withProxy = false) {
    return new Promise((resolve, reject) => {
      const proxy = `http://127.0.0.1:${proxyConfig.port}`
      const requestParams = {
        url: `${requestInfo.protocol}://${requestInfo.host}${requestInfo.path}`,
        method: requestInfo.method,
        headers: requestInfo.reqHeader || {},
        body: requestInfo.reqBody,
        encoding: null,
        timeout: 20000
      }

      if (withProxy) {
        requestParams.proxy = proxy
        requestParams.strictSSL = false
      }

      request(requestParams, function(error, response, body) {
        if (error) {
          reject(error)
        } else {
          const resHeaders = response.headers
          const contentEncoding =
            resHeaders['content-encoding'] || resHeaders['Content-Encoding']
          const ifGzipped = /gzip/i.test(contentEncoding)
          const isDeflated = /deflate/i.test(contentEncoding)
          const isBrotlied = /br/i.test(contentEncoding)

          let responseBody = ''
          try {
            if (ifGzipped && body) {
              responseBody = zlib.gunzipSync(body).toString()
            } else if (isDeflated && body) {
              responseBody = zlib.inflateSync(body).toString()
            } else if (isBrotlied && body) {
              const uint8Arr = brotliTorb.decompress(body)
              responseBody = String.fromCharCode.apply(null, uint8Arr)
            } else {
              responseBody = body.toString()
            }
          } catch (e) {
            responseBody = `${e.message}`
          }

          resolve({
            headers: response.headers,
            status: response.statusCode,
            data: responseBody
          })
        }
      })
    })
    // const proxyPort = proxyConfig.port
    // const proxy = {
    //   host: '127.0.0.1',
    //   port: proxyPort
    // }

    // const requestParams = {
    //   method: requestInfo.method,
    //   url: `${requestInfo.protocol}://${requestInfo.host}${requestInfo.path}`,
    //   headers: requestInfo.reqHeader || {},
    //   data: requestInfo.reqBody || {}
    // }

    // if (withProxy) {
    //   requestParams.proxy = proxy
    // }

    // return axios(requestParams)
  }
}
