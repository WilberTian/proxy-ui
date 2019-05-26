const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const AnyProxy = require('anyproxy')
const AnyProxyUtils = require('anyproxy/lib/util')
const matchers = require('./matchers')

const RULE_CONFIG_FILE = 'rule-config.json'
const PROXY_CONFIG_FILE = 'proxy-config.json'
const requestHookTypes = ['request', 'mock']
const responseHookTypes = ['response']

let proxyServer
const responseFileCache = {}
const hookData = {}

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

const updateHookData = (ruleConfig, data) => {
  if (ruleConfig.guid in hookData) {
    hookData[ruleConfig.guid].count += 1
  } else {
    hookData[ruleConfig.guid] = {
      ruleConfig,
      count: 1,
      data
    }
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
            case 'request':
              _options = Object.assign(
                {},
                requestDetail.requestOptions,
                requestHook.header || {}
              )
              const updatedRequest = {
                requestOptions: _options,
                requestData: requestHook.body
              }

              updateHookData(requestHook, updatedRequest)
              return updatedRequest
            case 'mock':
              if (requestHook.bodyType === 'file') {
                return {
                  response: {
                    ...requestHook.response,
                    body: getResponseFile(requestHook.bodyPath)
                  }
                }
              }
              const mockResponse = {
                response: {
                  ...requestHook.response,
                  body: requestHook.bodyContent
                }
              }

              updateHookData(requestHook, mockResponse)
              return mockResponse
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
            case 'response':
              if (responseHook.bodyType === 'file') {
                return {
                  response: {
                    ...responseDetail.response,
                    ...responseHook.response,
                    body: getResponseFile(responseHook.bodyPath)
                  }
                }
              }
              const updatedResponse = {
                response: {
                  ...responseDetail.response,
                  ...responseHook.response,
                  body: responseHook.bodyContent
                }
              }

              updateHookData(responseHook, updatedResponse.response)
              return updatedResponse
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

const generateRootCA = (successCb, errorCb) => {
  AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
    if (!error) {
      successCb && successCb()
    } else {
      errorCb && errorCb(new Error('HTTPS证书生成失败'))
    }
  })
}

const proxyServerManager = (action = 'start', options = {}) => {
  return new Promise((resolve, reject) => {
    if (action === 'start') {
      if (proxyServer) {
        resolve({
          msg: '代理服务器已经开启'
        })
      } else {
        const createProxyServer = () => {
          proxyServer = proxyServerCreator(options)
          proxyServer.on('ready', () => {
            if (options.forceProxyHttps) {
              AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', options.port, 'https')
            }
            AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', options.port, 'http')

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
        if (options.forceProxyHttps && !AnyProxy.utils.certMgr.ifRootCAFileExists()) {
          generateRootCA((rootCA) => {
            createProxyServer()
          }, (e) => {
            reject(e)
          })
        } else {
          createProxyServer()
        }
      }
    } else if (action === 'stop') {
      if (!proxyServer) {
        resolve({
          msg: '代理服务器已经关闭'
        })
      } else {
        proxyServer.close()
        proxyServer = null
        AnyProxy.utils.systemProxyMgr.disableGlobalProxy('https')
        AnyProxy.utils.systemProxyMgr.disableGlobalProxy()
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
    const _ruleConfig = this.readRuleConfig()
    return proxyRuleCreator(ruleConfig || _ruleConfig)
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
  generateProxyConfig: function (proxyConfig) {
    const _proxyConfig = this.readProxyConfig()
    const proxyRuleConfig = this.generateProxyRule()

    return {
      ..._proxyConfig,
      rule: proxyRuleConfig,
      ...proxyConfig
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
  getRootCA: function () {
    const isWin = /^win/.test(process.platform)
    const rootPath = AnyProxyUtils.getAnyProxyPath('certificates')
    if (!rootPath) return
    if (isWin) {
      exec('start .', { cwd: rootPath })
    } else {
      exec('open .', { cwd: rootPath })
    }
  },
  getRootCAPath: function () {
    const rootPath = AnyProxyUtils.getAnyProxyPath('certificates')
    return rootPath
  },
  getHookData: function () {
    return hookData
  }
}
