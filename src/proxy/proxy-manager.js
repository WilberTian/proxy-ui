import { app } from 'electron'
import { defaultProxyConfig, defaultRuleConfigs } from './constatns'
import ruleConfigSchema from './rule-config-schema'
import vconsoleRule from './vconsole-rule'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const throttle = require('lodash.throttle')
const AnyProxy = require('anyproxy')
const AnyProxyUtils = require('anyproxy/lib/util')
const matchers = require('./matchers')

const RULE_CONFIG_FILE = 'rule-config.json'
const PROXY_CONFIG_FILE = 'proxy-config.json'
const requestHookTypes = ['request', 'mock']
const responseHookTypes = ['response']
const customizeHookTypes = ['customize']

const userDataPath = app.getPath('userData')

let proxyServer
const responseFileCache = {}
let hookData = {}
const errorLog = []

const _getResponseFile = responseFilePath => {
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
    _addErrorLog({
      info: `读取相应文件失败：${responseFilePath}`,
      detail: e.message
    })
    return responseFilePath
  }
}

const _writeCustomizeRule = (guid, customizeRule) => {
  try {
    fs.writeFileSync(
      path.resolve(userDataPath, `__customize_${guid}.js`),
      customizeRule,
      {
        encoding: 'utf8'
      }
    )
    return true
  } catch (e) {
    _addErrorLog({
      info: `自定义规则写入失败：__customize_${guid}.js`,
      detail: customizeRule
    })
    return false
  }
}

const _requireCustomizeRule = (guid, customizeRule = '') => {
  let customizeRuleModule = null
  const customizeRuleFileExist = fs.existsSync(path.resolve(userDataPath, `__customize_${guid}.js`))
  if (!customizeRuleFileExist) {
    _writeCustomizeRule(guid, customizeRule)
  }
  try {
    /* eslint-disable */
    const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
    delete requireFunc.cache[requireFunc.resolve(path.resolve(userDataPath, `__customize_${guid}.js`))]
    /* eslint-enable */
    customizeRuleModule = requireFunc(path.resolve(userDataPath, `__customize_${guid}.js`))
  } catch (e) {
    _addErrorLog({
      info: `引入自定义规则写入失败：__customize_${guid}.js`,
      detail: customizeRule
    })
  }

  return customizeRuleModule
}

const getCustomizeRuleModules = (ruleConfig) => {
  const customizeHooks = ruleConfig.filter(item => {
    return customizeHookTypes.includes(item.type) && item.enabled
  })
  const customizeRuleModules = []
  customizeHooks.forEach((customizeHook) => {
    const customizeRuleModule = _requireCustomizeRule(customizeHook.guid, customizeHook.costomizeRule)
    if (customizeRuleModule) {
      customizeRuleModules.push(customizeRuleModule)
    }
  })
  return customizeRuleModules
}

const emitHookDataUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('hook-data-updated')
}, 500)

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
  if (global.mainWindow) {
    emitHookDataUpdatedEvent(global.mainWindow)
  }
}

const _emitErrorLogUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('error-log-updated')
}, 500)

const _addErrorLog = (errorLogItem) => {
  errorLog.push(errorLogItem)
  if (global.mainWindow) {
    _emitErrorLogUpdatedEvent(global.mainWindow)
  }
}

const proxyRuleCreator = (ruleConfig, proxyConfig) => {
  const customizeRuleModules = getCustomizeRuleModules(ruleConfig)
  if (proxyConfig.injectVConsole) {
    customizeRuleModules.push(vconsoleRule)
  }

  return {
    *beforeSendRequest (requestDetail) {
      for (let customizeRuleModule of customizeRuleModules) {
        if (customizeRuleModule.beforeSendRequest) {
          const result = customizeRuleModule.beforeSendRequest(requestDetail)
          if (typeof result !== 'undefined') {
            return result
          }
        }
      }

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
                    body: _getResponseFile(requestHook.bodyPath)
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
      for (let customizeRuleModule of customizeRuleModules) {
        if (customizeRuleModule.beforeSendResponse) {
          const result = customizeRuleModule.beforeSendResponse(requestDetail, responseDetail)
          if (typeof result !== 'undefined') {
            return result
          }
        }
      }
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
                updateHookData(responseHook, responseHook.bodyPath)
                return {
                  response: {
                    ...responseDetail.response,
                    ...responseHook.response,
                    body: _getResponseFile(responseHook.bodyPath)
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
            if (options.enableGlobalProxy) {
              if (options.forceProxyHttps) {
                AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
                  '127.0.0.1',
                  options.port,
                  'https'
                )
              }
              AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
                '127.0.0.1',
                options.port,
                'http'
              )
            }

            resolve({
              msg: '代理服务器启动成功'
            })
          })
          proxyServer.on('error', e => {
            proxyServer = null
            _addErrorLog({
              info: '代理服务器启动失败',
              detail: e.message
            })
            reject(e)
          })
          proxyServer.start()
        }
        if (
          options.forceProxyHttps &&
          !AnyProxy.utils.certMgr.ifRootCAFileExists()
        ) {
          generateRootCA(
            rootCA => {
              createProxyServer()
            },
            e => {
              _addErrorLog({
                info: '生成HTTPS证书失败',
                detail: e.message
              })
              reject(e)
            }
          )
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
  readRuleConfigs: function () {
    try {
      const ruleConfigs = fs.readFileSync(
        path.resolve(userDataPath, RULE_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
      if (ruleConfigs) {
        return JSON.parse(ruleConfigs)
      }
      return []
    } catch (e) {
      const result = this.writeRuleConfig(defaultRuleConfigs)
      if (result) {
        return defaultRuleConfigs
      }
      return []
    }
  },
  writeRuleConfig: function (ruleConfigs) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, RULE_CONFIG_FILE),
        JSON.stringify(ruleConfigs)
      )
      return true
    } catch (e) {
      _addErrorLog({
        info: '配置规则写入失败',
        detail: JSON.stringify(ruleConfigs)
      })
      return false
    }
  },
  getDefaultRuleConfigs: function () {
    return defaultRuleConfigs
  },
  generateProxyConfig: function (proxyConfig) {
    const _proxyConfig = this.readProxyConfig()
    const _ruleConfigs = this.readRuleConfigs()
    const proxyRuleConfig = proxyRuleCreator(_ruleConfigs, _proxyConfig)

    return {
      ..._proxyConfig,
      rule: proxyRuleConfig,
      ...proxyConfig
    }
  },
  readProxyConfig: function () {
    try {
      const proxyConfigs = fs.readFileSync(
        path.resolve(userDataPath, PROXY_CONFIG_FILE),
        {
          encoding: 'utf8'
        }
      )
      if (proxyConfigs) {
        return JSON.parse(proxyConfigs)
      }
      return {}
    } catch (e) {
      const result = this.writeProxyConfig(defaultProxyConfig)
      if (result) {
        return defaultProxyConfig
      }
      return {}
    }
  },
  writeProxyConfig: function (proxyConfig) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, PROXY_CONFIG_FILE),
        JSON.stringify(proxyConfig)
      )
      return true
    } catch (e) {
      _addErrorLog({
        info: '代理服务器配置写入失败',
        detail: JSON.stringify(proxyConfig)
      })
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
  },
  resetHookData: function () {
    hookData = {}
  },
  clearGlobalProxyConfig () {
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy('https')
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy()
  },
  getRuleConfigSchema () {
    return ruleConfigSchema
  },
  getSampleRules () {
    const sampleRuleFiles = [
      {
        sampleName: '修改请求数据',
        fileName: 'sample_modify_request_data.js'
      }, {
        sampleName: '修改请求数头',
        fileName: 'sample_modify_request_header.js'
      }, {
        sampleName: '修改请求路径',
        fileName: 'sample_modify_request_path.js'
      }, {
        sampleName: '修改请求协议',
        fileName: 'sample_modify_request_protocol.js'
      }, {
        sampleName: '修改响应数据',
        fileName: 'sample_modify_response_data.js'
      }, {
        sampleName: '修改响应头',
        fileName: 'sample_modify_response_header.js'
      }, {
        sampleName: '修改响应码',
        fileName: 'sample_modify_response_statuscode.js'
      }, {
        sampleName: 'Mock相应数据',
        fileName: 'sample_use_local_response.js'
      }
    ]
    const sampleRules = []
    sampleRuleFiles.forEach(sampleRuleFile => {
      try {
        const sampleRuleContent = fs.readFileSync(
          path.resolve(__dirname, 'rule_sample', sampleRuleFile.fileName),
          {
            encoding: 'utf8'
          }
        )
        sampleRules.push({
          sampleName: sampleRuleFile.sampleName,
          sampleContent: sampleRuleContent
        })
      } catch (e) {
        _addErrorLog({
          info: '获取自定义规则样例失败',
          detail: e.message
        })
      }
    })
    return sampleRules
  },
  readCustomizeRule (guid) {
    try {
      const customizeRule = fs.readFileSync(
        path.resolve(userDataPath, `__customize_${guid}.js`),
        {
          encoding: 'utf8'
        }
      )
      return customizeRule
    } catch (e) {
      return ''
    }
  },
  writeCustomizeRule (guid, customizeRule) {
    return _writeCustomizeRule(guid, customizeRule)
  },
  deleteCustomizeRule (guid) {
    const customizeRulePath = path.resolve(userDataPath, `__customize_${guid}.js`)
    const customizeRuleFileExist = fs.existsSync(customizeRulePath)
    if (customizeRuleFileExist) {
      try {
        fs.unlinkSync(customizeRulePath)
      } catch (e) {
        _addErrorLog({
          info: `删除自定义规则失败：__customize_${guid}.js`,
          detail: e.message
        })
      }
    }
  },
  getErrorLog () {
    return errorLog
  },
  addErrorLog (logItem) {
    _addErrorLog(logItem)
  },
  resetErrorLog () {
    errorLog.length = 0
  }
}
