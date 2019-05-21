const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const AnyProxy = require('anyproxy')
const matchers = require('./matchers')

const RULE_CONFIG_FILE = 'rule-config.json'
const PROXY_CONFIG_FILE = 'proxy-config.json'
const requestHookTypes = ['request', 'mock']
const responseHookTypes = ['response']

let proxyServer

const responseFileCache = {}

const getResponseFile = responseFilePath => {
  try {
    if (responseFilePath in responseFileCache) {
      return responseFileCache.responseFilePath
    }

    const responseFileContent = fs.readFileSync(responseFilePath, {
      encoding: 'utf8'
    })
    responseFileCache.responseFilePath = responseFileContent
    return responseFileContent
  } catch (e) {
    return `Can not found file ${responseFilePath}`
  }
}

const proxyRuleCreator = ruleConfig => {
  return {
    *beforeSendRequest (requestDetail) {
      const requestUrl = requestDetail.url

      const requestHooks = ruleConfig.filter(item => {
        return requestHookTypes.includes(item.type) && item.enabled
      })
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
      const responseHooks = ruleConfig.filter(item => {
        return responseHookTypes.includes(item.type) && item.enabled
      })
      for (let responseHook of responseHooks) {
        const matcher = matchers[responseHook.matcher]

        if (matcher(requestUrl, responseHook.pattern)) {
          switch (responseHook.type) {
            case 'bypass':
              return null
            case 'response':
              if (responseHook.bodyType === 'file') {
                return {
                  response: {
                    ...responseHook.response,
                    body: getResponseFile(responseHook.bodyPath)
                  }
                }
              }

              return {
                response: {
                  ...responseHook.response,
                  body: responseHook.bodyContent
                }
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
      const ruleConfig = fs.readFileSync(
        path.resolve(__dirname, RULE_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
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
      const proxyConfig = fs.readFileSync(
        path.resolve(__dirname, PROXY_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
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
  },
  generateRootCA (successCb, errorCb) {
    const isWin = /^win/.test(process.platform)
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
      AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
        if (!error) {
          const certDir = path.dirname(keyPath)
          console.log('The cert is generated at ', certDir)
          if (isWin) {
            exec('start .', { cwd: certDir })
          } else {
            exec('open .', { cwd: certDir })
          }
          successCb && successCb(certDir)
        } else {
          errorCb && errorCb(error)
        }
      })
    } else {
      const rootPath = AnyProxy.utils.getAnyProxyPath('certificates')
      if (!rootPath) return
      if (isWin) {
        exec('start .', { cwd: rootPath })
      } else {
        exec('open .', { cwd: rootPath })
      }
      successCb && successCb(rootPath)
    }
  }
}
