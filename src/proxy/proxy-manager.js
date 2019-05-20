const fs = require('fs')
const path = require('path')
const AnyProxy = require('anyproxy')
const matchers = require('./matchers')

const RULE_CONFIG_FILE = 'rule-config.json'
const PROXY_CONFIG_FILE = 'proxy-config.json'

let proxyServer

const responseFileCache = {}

const getResponseFile = (responseFilePath) => {
  try {
    if (responseFilePath in responseFileCache) {
      return responseFileCache.responseFilePath
    }

    const responseFileContent = fs.readFileSync(responseFilePath, {encoding: 'utf8'})
    responseFileCache.responseFilePath = responseFileContent
    return responseFileContent
  } catch (e) {
    return responseFilePath
  }
}

const proxyRuleCreator = (ruleConfig) => {
  return {
    *beforeSendRequest (requestDetail) {
      const requestUrl = requestDetail.url

      const requestHooks = ruleConfig.requestHooks
      for (let requestHook of requestHooks) {
        const matcher = matchers[requestHook.matcher]

        let _options
        if (matcher(requestUrl, requestHook.pattern)) {
          switch (requestHook.type) {
            case 'bypass':
              return null
            case 'request':
              _options = Object.assign(
                {},
                requestDetail.requestOptions,
                requestHook.header || {}
              )
              return {
                requestOptions: _options,
                requestData: requestHook.body
              }
            case 'mock':
              if (requestHook.bodyType === 'file') {
                return {
                  response: {
                    ...requestHook.response,
                    body: getResponseFile(requestHook.bodyPath)
                  }
                }
              }

              return {
                response: {
                  ...requestHook.response,
                  body: requestHook.bodyContent
                }
              }
            default:
              return null
          }
        }
      }
    },
    *beforeSendResponse (requestDetail, responseDetail) {
      const requestUrl = requestDetail.url

      const responseHooks = ruleConfig.responseHooks
      for (let responseHook of responseHooks) {
        const matcher = matchers[responseHook.matcher]

        if (matcher(requestUrl, responseHook.pattern)) {
          switch (responseHook.type) {
            case 'bypass':
              return null
            case 'response':
              let responseHookResponse = responseHook.response
              if (responseHook.bodyType === 'file') {
                responseHookResponse.body = getResponseFile(responseHookResponse.body)
              }

              const response = Object.assign(
                {},
                responseDetail.response,
                responseHookResponse
              )
              return {
                response
              }
            default:
              return null
          }
        }
      }
    }
  }
}

const proxyServerCreator = options => {
  return proxyServer || new AnyProxy.ProxyServer(options)
}

const proxyServerManager = (action = 'start', options = {}) => {
  return new Promise((resolve, reject) => {
    if (action === 'start') {
      if (proxyServer) {
        resolve({
          msg: '代理服务器已经开启'
        })
      } else {
        proxyServer = proxyServerCreator(options)
        proxyServer.on('ready', () => {
          resolve({
            msg: '代理服务器启动成功'
          })
        })
        proxyServer.on('error', e => {
          proxyServer = null
          reject(e)
        })
        proxyServer.start()
      }
    } else if (action === 'stop') {
      if (!proxyServer) {
        resolve({
          msg: '代理服务器已经关闭'
        })
      } else {
        proxyServer.close()
        proxyServer = null
        resolve({
          msg: '代理服务器关闭成功'
        })
      }
    }
  })
}

export default {
  startProxyServer: function (options) {
    return proxyServerManager('start', options)
  },
  stopProxyServer: function () {
    return proxyServerManager('stop')
  },
  restartProxyServer: function (options) {
    return proxyServerManager('stop').then(() => {
      return proxyServerManager('start', options)
    })
  },
  generateProxyRule: function (ruleConfig) {
    const defaultRuleConfig = this.readRuleConfig()
    return proxyRuleCreator(ruleConfig || defaultRuleConfig)
  },
  readRuleConfig: function () {
    try {
      const ruleConfig = fs.readFileSync(path.resolve(__dirname, RULE_CONFIG_FILE), {
        encoding: 'utf8'
      })
      if (ruleConfig) {
        return JSON.parse(ruleConfig)
      }
      return {}
    } catch (e) {
      return {}
    }
  },
  writeRuleConfig: function (ruleConfig) {
    try {
      fs.writeFileSync(
        path.resolve(__dirname, RULE_CONFIG_FILE),
        JSON.stringify(ruleConfig)
      )
      return true
    } catch (e) {
      return false
    }
  },
  generateProxyConfig: function () {
    const proxyConfig = this.readProxyConfig()
    const proxyRuleConfig = this.generateProxyRule()

    return {
      ...proxyConfig,
      rule: proxyRuleConfig
    }
  },
  readProxyConfig: function () {
    try {
      const proxyConfig = fs.readFileSync(path.resolve(__dirname, PROXY_CONFIG_FILE), {
        encoding: 'utf8'
      })
      if (proxyConfig) {
        return JSON.parse(proxyConfig)
      }
      return {}
    } catch (e) {
      return {}
    }
  },
  writeProxyConfig: function (proxyConfig) {
    try {
      fs.writeFileSync(
        path.resolve(__dirname, PROXY_CONFIG_FILE),
        JSON.stringify(proxyConfig)
      )
      return true
    } catch (e) {
      return false
    }
  },
  getMatchers: function () {
    return Object.keys(matchers)
  }
}
