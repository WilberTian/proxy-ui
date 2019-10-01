import { app } from 'electron'
import { defaultProxyConfig, defaultRuleConfigs } from './constatns'
import ruleConfigSchema from './rule-config-schema'
import getVconsoleRule from './get-vconsole-rule'
import getWeinreRule from './get-weinre-rule'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const throttle = require('lodash.throttle')
const log = require('electron-log')
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
let proxyServerRecorder
const responseFileCache = {}
let hookData = {
  hitCount: 0,
  effectiveRules: {}
}
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

const _writeCustomizeRule = ruleConfig => {
  try {
    fs.writeFileSync(
      path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`),
      ruleConfig.customizeRule,
      {
        encoding: 'utf8'
      }
    )
    return true
  } catch (e) {
    log.error(`_writeCustomizeRule: ${e.message}`)
    _addErrorLog({
      info: `自定义规则写入失败：${ruleConfig.name}`,
      detail: `规则内容：${ruleConfig.customizeRule}`
    })
    return false
  }
}

const _requireCustomizeRule = ruleConfig => {
  let customizeRuleModule = null
  const customizeRuleFileExist = fs.existsSync(
    path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`)
  )
  if (!customizeRuleFileExist) {
    _writeCustomizeRule(ruleConfig)
  }
  try {
    /* eslint-disable */
    const requireFunc =
      typeof __webpack_require__ === 'function'
        ? __non_webpack_require__
        : require
    delete requireFunc.cache[
      requireFunc.resolve(
        path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`)
      )
    ]
    /* eslint-enable */
    customizeRuleModule = requireFunc(
      path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`)
    )
  } catch (e) {
    _addErrorLog({
      info: `引入自定义规则写入失败：${ruleConfig.name}`,
      detail: `规则内容：${ruleConfig.customizeRule}`
    })
  }

  return customizeRuleModule
}

const getCustomizeRuleModules = ruleConfig => {
  const customizeHooks = ruleConfig.filter(item => {
    return customizeHookTypes.includes(item.type) && item.enabled
  })
  const customizeRuleModules = []
  customizeHooks.forEach(customizeHook => {
    const customizeRuleModule = _requireCustomizeRule(customizeHook)
    if (customizeRuleModule) {
      customizeRuleModules.push({
        ruleConfig: customizeHook,
        module: customizeRuleModule
      })
    }
  })
  return customizeRuleModules
}

const emitHookDataUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('hook-data-updated')
}, 500)

const _updateEffectiveRule = (ruleConfig) => {
  if (ruleConfig) {
    const effectiveRules = hookData.effectiveRules
    hookData.hitCount += 1
    if (ruleConfig.guid in effectiveRules) {
      effectiveRules[ruleConfig.guid].count += 1
    } else {
      effectiveRules[ruleConfig.guid] = {
        ruleConfig,
        count: 1
      }
    }
    if (global.mainWindow) {
      emitHookDataUpdatedEvent(global.mainWindow)
    }
  }
}

const _emitErrorLogUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('error-log-updated')
}, 500)

const _addErrorLog = errorLogItem => {
  errorLog.push(errorLogItem)
  if (global.mainWindow) {
    _emitErrorLogUpdatedEvent(global.mainWindow)
  }
}

const proxyRuleCreator = (ruleConfig, proxyConfig) => {
  const customizeRuleModules = getCustomizeRuleModules(ruleConfig)
  customizeRuleModules.push({
    module: getVconsoleRule()
  })
  customizeRuleModules.push({
    module: getWeinreRule()
  })

  return {
    *beforeSendRequest (requestDetail) {
      for (let customizeRuleModule of customizeRuleModules) {
        if (customizeRuleModule.module.beforeSendRequest) {
          const result = customizeRuleModule.module.beforeSendRequest(
            requestDetail
          )
          if (typeof result !== 'undefined') {
            if (result.then && typeof result.then === 'function') {
              result.then(function (data) {
                _updateEffectiveRule(customizeRuleModule.ruleConfig)
              })
            } else {
              _updateEffectiveRule(customizeRuleModule.ruleConfig)
            }
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

              _updateEffectiveRule(requestHook)
              return updatedRequest
            case 'mock':
              const mockResponse = {
                response: {
                  ...requestHook.response,
                  body: requestHook.bodyContent
                }
              }
              if (requestHook.bodyType === 'file') {
                mockResponse.response.body = _getResponseFile(
                  requestHook.bodyPath
                )
              }

              _updateEffectiveRule(requestHook)
              return mockResponse
            default:
              return null
          }
        }
      }
    },
    *beforeSendResponse (requestDetail, responseDetail) {
      for (let customizeRuleModule of customizeRuleModules) {
        if (customizeRuleModule.module.beforeSendResponse) {
          const result = customizeRuleModule.module.beforeSendResponse(
            requestDetail,
            responseDetail
          )
          if (typeof result !== 'undefined') {
            if (result.then && typeof result.then === 'function') {
              result.then(function (data) {
                _updateEffectiveRule(customizeRuleModule.ruleConfig)
              })
            } else {
              _updateEffectiveRule(customizeRuleModule.ruleConfig)
            }
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
              const updatedResponse = {
                response: {
                  ...responseDetail.response,
                  ...responseHook.response,
                  body: responseHook.bodyContent
                }
              }
              if (responseHook.bodyType === 'file') {
                updatedResponse.response.body = _getResponseFile(
                  responseHook.bodyPath
                )
              }

              _updateEffectiveRule(responseHook)
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

const _emitRecordUpdatedEvent = throttle((mainWindow) => {
  mainWindow.webContents.send('record-updated')
}, 500)

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
          proxyServerRecorder = proxyServer.recorder
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
            proxyServerRecorder = null
            _addErrorLog({
              info: '代理服务器启动失败',
              detail: e.message
            })
            reject(e)
          })
          proxyServerRecorder.on('update', () => {
            if (global.mainWindow) {
              _emitRecordUpdatedEvent(global.mainWindow)
            }
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
        proxyServerRecorder = null
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
    log.info(`startProxyServer: ${JSON.stringify(options)}`)
    return proxyServerManager('start', options)
  },
  stopProxyServer: function () {
    log.info(`stopProxyServer}`)
    return proxyServerManager('stop')
  },
  restartProxyServer: function (options) {
    log.info(`restartProxyServer: ${JSON.stringify(options)}`)
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
        log.info(`readRuleConfigs`)
        return JSON.parse(ruleConfigs)
      }
      log.info(`readRuleConfigs: []`)
      return []
    } catch (e) {
      log.error(`readRuleConfigs: ${e.message}`)
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
      log.error(`writeRuleConfig: ${e.message}`)
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
      log.error(`writeProxyConfig: ${e.message}`)
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
    return JSON.parse(JSON.stringify(hookData))
  },
  resetHookData: function () {
    hookData = {
      hitCount: 0,
      effectiveRules: {}
    }
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
        sampleName: 'Mock响应数据',
        fileName: 'sample_use_local_response.js'
      },
      {
        sampleName: '修改响应数据',
        fileName: 'sample_modify_response_data.js'
      },
      {
        sampleName: '修改响应头',
        fileName: 'sample_modify_response_header.js'
      },
      {
        sampleName: '修改响应码',
        fileName: 'sample_modify_response_statuscode.js'
      },
      {
        sampleName: '修改请求数据',
        fileName: 'sample_modify_request_data.js'
      },
      {
        sampleName: '修改请求头',
        fileName: 'sample_modify_request_header.js'
      },
      {
        sampleName: '修改请求路径',
        fileName: 'sample_modify_request_path.js'
      },
      {
        sampleName: '修改请求协议',
        fileName: 'sample_modify_request_protocol.js'
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
      log.error(`readCustomizeRule: ${e.message}`)
      return ''
    }
  },
  writeCustomizeRule (ruleConfig) {
    return _writeCustomizeRule(ruleConfig)
  },
  deleteCustomizeRule (ruleConfig) {
    const customizeRulePath = path.resolve(
      userDataPath,
      `__customize_${ruleConfig.guid}.js`
    )
    const customizeRuleFileExist = fs.existsSync(customizeRulePath)
    if (customizeRuleFileExist) {
      try {
        fs.unlinkSync(customizeRulePath)
      } catch (e) {
        log.error(`deleteCustomizeRule: ${e.message}`)
        _addErrorLog({
          info: `删除自定义规则失败：${ruleConfig.name}`,
          detail: e.message
        })
      }
    }
  },
  getErrorLog () {
    return [...errorLog]
  },
  addErrorLog (logItem) {
    _addErrorLog(logItem)
  },
  resetErrorLog () {
    errorLog.length = 0
  },
  getRecordById (id) {
    return new Promise((resolve, reject) => {
      if (proxyServerRecorder) {
        proxyServerRecorder.getSingleRecord(id, (err, data) => {
          if (err) {
            reject(err.toString())
          } else {
            resolve(data[0])
          }
        })
      } else {
        log.error(`getRecordById: get ${id} fail`)
        reject(new Error('获取记录失败'))
      }
    })
  },
  getLatestRecords (filterData) {
    return new Promise((resolve, reject) => {
      if (proxyServerRecorder) {
        proxyServerRecorder.getRecords(0, 10000, (err, docs) => {
          if (err) {
            reject(err.toString())
          } else {
            const { method, host, path } = filterData
            const filteredRecords = {}
            let filteredRecordsCount = 0

            docs.filter((item) => {
              let passed = true
              if (method) {
                passed = (item.method.toLowerCase().indexOf(method.toLowerCase()) > -1) && passed
                if (!passed) {
                  return passed
                }
              }
              if (host) {
                passed = (item.host.toLowerCase().indexOf(host.toLowerCase()) > -1) && passed
                if (!passed) {
                  return passed
                }
              }
              if (path) {
                passed = (item.path.toLowerCase().indexOf(path.toLowerCase()) > -1) && passed
                if (!passed) {
                  return passed
                }
              }
              return passed
            }).map((item) => {
              filteredRecordsCount += 1
              if (item.host in filteredRecords) {
                filteredRecords[item.host].push({
                  id: item.id,
                  method: item.method,
                  statusCode: item.statusCode,
                  host: item.host,
                  path: item.path
                })
              } else {
                filteredRecords[item.host] = []
              }
            })
            resolve({
              totalCount: docs.length,
              filteredRecordsCount,
              filteredRecords
            })
          }
        })
      } else {
        reject(new Error('获取记录失败'))
      }
    })
  },
  getRecordBody (id) {
    return new Promise((resolve, reject) => {
      if (proxyServerRecorder) {
        proxyServerRecorder.getDecodedBody(id, (err, result) => {
          if (err || !result || !result.content) {
            reject(new Error('获取数据失败'))
          } else if (result.type && result.type === 'image' && result.mime) {
            resolve({
              raw: true,
              type: result.mime,
              content: result.content
            })
          } else {
            resolve({
              id: id,
              type: result.type,
              content: result.content
            })
          }
        })
      } else {
        reject(new Error('获取数据失败'))
      }
    })
  },
  clearRecords () {
    return new Promise((resolve, reject) => {
      if (proxyServerRecorder && proxyServerRecorder.db) {
        proxyServerRecorder.db.remove({}, { multi: true }, (err, numRemoved) => {
          if (err) {
            reject(err.toString())
          } else {
            resolve(numRemoved)
          }
        })
      } else {
        reject(new Error('清空数据失败'))
      }
    })
  }
}
