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
const ip = require('ip')

const AnyProxy = require('../proxy-server-lib/proxy.js')
const AnyProxyUtils = require('../proxy-server-lib/lib/util.js')
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
const proxyServerLog = []
let localIPAddress = '127.0.0.1'

const MAX_RECORD_COUNT = 6000

let _hostsEnalbedHttps = ['www.proxyui-weinre.com']
let _hostsDisabledCache = []

const HOSTS_ENABLED_HTTPS = 'HOSTS_ENABLED_HTTPS'
const HOSTS_DISABLED_CACHE = 'HOSTS_DISABLED_CACHE'

const _getDataFromLocalStorage = (key) => {
  return new Promise((resolve, reject) => {
    if (global.mainWindow) {
      global.mainWindow.webContents.executeJavaScript(`localStorage.getItem('${key}')`).then((value) => {
        resolve(value)
      }, () => {
        reject(new Error('读取localstorage失败'))
      })
    } else {
      reject(new Error('读取localstorage失败'))
    }
  })
}

const _setDataForLocalStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    if (global.mainWindow) {
      global.mainWindow.webContents.executeJavaScript(`localStorage.setItem('${key}', '${value}')`).then(() => {
        resolve()
      }, () => {
        reject(new Error('写入localstorage失败'))
      })
    } else {
      reject(new Error('写入localstorage失败'))
    }
  })
}

_getDataFromLocalStorage(HOSTS_ENABLED_HTTPS).then((data) => {
  if (data) {
    _hostsEnalbedHttps = JSON.parse(data)
  }
}, (e) => {
  console.log(e)
})

_getDataFromLocalStorage(HOSTS_DISABLED_CACHE).then((data) => {
  if (data) {
    _hostsDisabledCache = JSON.parse(data)
  }
}, (e) => {
  console.log(e)
})

setInterval(() => {
  const ipAddress = ip.address()
  if (ipAddress !== localIPAddress) {
    localIPAddress = ipAddress
    if (global.mainWindow) {
      global.mainWindow.webContents.send('ip-address-updated')
    }
  }
}, 500)

global.logger = {
  info: (detail) => {
    _addProxyServerLog({
      detail,
      isErr: false
    })
  },
  error: (detail) => {
    _addProxyServerLog({
      detail,
      isErr: true
    })
  }
}

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
    _addProxyServerLog({
      info: `读取相应文件失败：${responseFilePath}`,
      detail: e.message,
      isErr: true
    })
    return responseFilePath
  }
}

const _requireFn = (ruleConfig) => {
  let code = ruleConfig.customizeRule
  const module = {}
  code = `(function (module, require){${code}})(module, require)`
  // eslint-disable-next-line no-new-func
  const fn = new Function('module', 'require', code)
  fn(module, _requireFn)
  return module.exports
}

const _requireCustomizeRule = ruleConfig => {
  let customizeRuleModule = null
  try {
    // /* eslint-disable */
    // const requireFunc =
    //   typeof __webpack_require__ === 'function'
    //     ? __non_webpack_require__
    //     : require
    // delete requireFunc.cache[
    //   requireFunc.resolve(
    //     path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`)
    //   )
    // ]
    // /* eslint-enable */
    // customizeRuleModule = requireFunc(
    //   path.resolve(userDataPath, `__customize_${ruleConfig.guid}.js`)
    // )
    customizeRuleModule = _requireFn(ruleConfig)
  } catch (e) {
    _addProxyServerLog({
      info: `引入自定义规则失败：${ruleConfig.name}`,
      detail: `错误信息：${e.message}`,
      isErr: true
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

const _emitProxyServerLogUpdatedEvent = throttle(mainWindow => {
  mainWindow.webContents.send('proxy-log-updated')
}, 500)

const _updatedRecords = []
const _emitRecordUpdateEvent = throttle(() => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('record-update', [..._updatedRecords])
    _updatedRecords.length = 0
  }
}, 500)
const _appenddedRecords = []
const _emitRecordAppendEvent = throttle(() => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('record-append', [..._appenddedRecords])
    _appenddedRecords.length = 0
  }
}, 500)

const _addProxyServerLog = logItem => {
  proxyServerLog.push(logItem)
  if (global.mainWindow) {
    _emitProxyServerLogUpdatedEvent(global.mainWindow)
  }
}

const _disableRequestCache = (reqHeaders) => {
  delete reqHeaders['If-Modified-Since']
  delete reqHeaders['If-None-Match']

  reqHeaders['Pragma'] = 'no-cache'
  reqHeaders['Cache-Control'] = 'no-cache'
}

const _disableResponseCache = (resHeaders) => {
  delete resHeaders['Expires']
  delete resHeaders['Last-Modified']
  delete resHeaders['ETag']

  resHeaders['Expires'] = 0
  resHeaders['Cache-Control'] = 'no-cache'
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
    *beforeDealHttpsRequest (requestDetail) {
      if (_hostsEnalbedHttps.includes(requestDetail.host.replace(/:443/g, ''))) {
        return true
      }
      return false
    },
    *beforeSendRequest (requestDetail) {
      const requestOptions = requestDetail.requestOptions
      if (_hostsDisabledCache.includes(requestOptions.hostname)) {
        _disableRequestCache(requestOptions.headers)
      }
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
      const responseData = responseDetail.response
      const requestOptions = requestDetail.requestOptions
      if (_hostsDisabledCache.includes(requestOptions.hostname)) {
        _disableResponseCache(responseData.header)
      }

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
              setBypassList(options.bypassList || [])
            }

            resolve({
              msg: '代理服务器启动成功'
            })
            _updateProxyServerStatus()
          })
          proxyServer.on('error', e => {
            proxyServer = null
            proxyServerRecorder = null
            _addProxyServerLog({
              info: '代理服务器启动失败',
              detail: e.message,
              isErr: true
            })
            reject(e)
            _updateProxyServerStatus()
          })
          proxyServerRecorder.on('update', (record) => {
            _updatedRecords.push({
              id: record.id,
              method: record.method,
              statusCode: record.statusCode,
              host: record.host,
              path: record.path,
              protocol: record.protocol
            })
            _emitRecordUpdateEvent()
          })
          proxyServerRecorder.on('append', (record) => {
            _appenddedRecords.push({
              id: record.id,
              method: record.method,
              statusCode: record.statusCode,
              host: record.host,
              path: record.path,
              protocol: record.protocol
            })
            _emitRecordAppendEvent()
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
              _addProxyServerLog({
                info: '生成HTTPS证书失败',
                detail: e.message,
                isErr: true
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
        _updateProxyServerStatus()
      }
    }
  })
}

const setBypassList = (bypassList) => {
  const networkType = AnyProxy.utils.systemProxyMgr.getNetworkType()
  exec(`networksetup -setproxybypassdomains ${networkType} ${bypassList.length > 1 ? bypassList.join(' ') : '" "'}`)
}

const _updateProxyServerStatus = () => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('proxy-server-status-updated')
  }
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
  getPoxyServerStatus: function () {
    return !!proxyServer
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
      const result = this.writeRuleConfigs(defaultRuleConfigs)
      if (result) {
        return defaultRuleConfigs
      }
      return []
    }
  },
  writeRuleConfigs: function (ruleConfigs) {
    try {
      fs.writeFileSync(
        path.resolve(userDataPath, RULE_CONFIG_FILE),
        JSON.stringify(ruleConfigs)
      )
      global.mainWindow.webContents.send('proxy-rule-config-updated')
      return true
    } catch (e) {
      log.error(`writeRuleConfigs: ${e.message}`)
      _addProxyServerLog({
        info: '配置规则写入失败',
        detail: JSON.stringify(ruleConfigs),
        isErr: true
      })
      return false
    }
  },
  addRuleConfig: function (ruleConfig) {
    const ruleConfigs = this.readRuleConfigs()
    ruleConfigs.push(ruleConfig)
    this.writeRuleConfigs(ruleConfigs)
  },
  deleteRuleConfig: function (ruleConfig) {
    let ruleConfigs = this.readRuleConfigs()
    ruleConfigs = ruleConfigs.filter((_ruleConfig) => {
      return _ruleConfig.guid !== ruleConfig.guid
    })
    this.writeRuleConfigs(ruleConfigs)
  },
  updateRuleConfig: function (ruleConfig) {
    const ruleConfigs = this.readRuleConfigs()
    const foundIdx = ruleConfigs.findIndex((_ruleConfig) => {
      return _ruleConfig.guid === ruleConfig.guid
    })
    if (foundIdx > -1) {
      ruleConfigs[foundIdx] = ruleConfig
      this.writeRuleConfigs(ruleConfigs)
    }
  },
  updateRuleConfigs: function (ruleConfigs) {
    if (Array.isArray(ruleConfigs)) {
      const _ruleConfigs = this.readRuleConfigs()
      ruleConfigs.forEach((ruleConfig) => {
        const foundIdx = _ruleConfigs.findIndex((_ruleConfig) => {
          return _ruleConfig.guid === ruleConfig.guid
        })
        if (foundIdx > -1) {
          _ruleConfigs[foundIdx] = ruleConfig
        }
      })
      this.writeRuleConfigs(_ruleConfigs)
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
      global.mainWindow.webContents.send('proxy-config-updated')
      return true
    } catch (e) {
      log.error(`writeProxyConfig: ${e.message}`)
      _addProxyServerLog({
        info: '代理服务器配置写入失败',
        detail: JSON.stringify(proxyConfig),
        isErr: true
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
        sampleName: '转发请求',
        fileName: 'sample_map_remote.js'
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
        _addProxyServerLog({
          info: '获取自定义规则样例失败',
          detail: e.message,
          isErr: true
        })
      }
    })
    return sampleRules
  },
  getProxyServerLog () {
    return [...proxyServerLog]
  },
  addProxyServerLog (logItem) {
    _addProxyServerLog(logItem)
  },
  resetProxyServerLog () {
    proxyServerLog.length = 0
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
  getLatestRecords () {
    return new Promise((resolve, reject) => {
      if (proxyServerRecorder) {
        proxyServerRecorder.getRecords(0, MAX_RECORD_COUNT, (err, docs) => {
          if (err) {
            reject(err.toString())
          } else {
            const filteredGroupRecords = {}
            const filteredListRecords = []
            let filteredRecordsCount = 0

            docs.map((item) => {
              filteredRecordsCount += 1
              const hostWithProtocol = `${item.protocol}://${item.host}`
              if (hostWithProtocol in filteredGroupRecords) {
                filteredGroupRecords[hostWithProtocol].push({
                  id: item.id,
                  method: item.method,
                  statusCode: item.statusCode,
                  host: item.host,
                  path: item.path,
                  protocol: item.protocol
                })
              } else {
                filteredGroupRecords[hostWithProtocol] = [{
                  id: item.id,
                  method: item.method,
                  statusCode: item.statusCode,
                  host: item.host,
                  path: item.path,
                  protocol: item.protocol
                }]
              }
              filteredListRecords.push({
                id: item.id,
                method: item.method,
                statusCode: item.statusCode,
                host: item.host,
                path: item.path,
                protocol: item.protocol
              })
            })
            resolve({
              totalCount: docs.length,
              filteredRecordsCount,
              filteredGroupRecords,
              filteredListRecords
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
          } else {
            resolve(result)
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
  },
  getIPAddress () {
    return localIPAddress
  },
  getHostsEnabledHttps () {
    return _hostsEnalbedHttps
  },
  enableHttps4Host (host) {
    // need to close previous connection, otherwise the connection will be reused
    const hostKey = `${host}:443`
    const connections = proxyServer.requestHandler.conns
    if (connections && connections.has(hostKey)) {
      connections.get(hostKey).end()
    }

    const cltSockets = proxyServer.requestHandler.cltSockets
    if (cltSockets && cltSockets.has(hostKey)) {
      cltSockets.get(hostKey).end()
    }

    if (!_hostsEnalbedHttps.includes(host)) {
      const hostList = [..._hostsEnalbedHttps, host]
      _setDataForLocalStorage(HOSTS_ENABLED_HTTPS, JSON.stringify(hostList)).then(() => {
        _hostsEnalbedHttps = hostList
        global.mainWindow.webContents.send('https-host-updated')
        if (global.httpsSettingWindow) {
          global.httpsSettingWindow.webContents.send('https-host-updated')
        }
      })
    }
  },
  disableHttps4Host (host) {
    // need to close previous connection, otherwise the connection will be reused
    const hostKey = `${host}:443`
    const connections = proxyServer.requestHandler.conns
    if (connections && connections.has(hostKey)) {
      connections.get(hostKey).end()
    }

    const cltSockets = proxyServer.requestHandler.cltSockets
    if (cltSockets && cltSockets.has(hostKey)) {
      cltSockets.get(hostKey).end()
    }

    if (_hostsEnalbedHttps.includes(host)) {
      const hostList = _hostsEnalbedHttps.filter(item => {
        return item !== host
      })
      _setDataForLocalStorage(HOSTS_ENABLED_HTTPS, JSON.stringify(hostList)).then(() => {
        _hostsEnalbedHttps = hostList
        global.mainWindow.webContents.send('https-host-updated')
        if (global.httpsSettingWindow) {
          global.httpsSettingWindow.webContents.send('https-host-updated')
        }
      })
    }
  },
  get_hostsDisabledCache () {
    return _hostsDisabledCache
  },
  disableCache4Host (host) {
    if (!_hostsDisabledCache.includes(host)) {
      const hostList = [..._hostsDisabledCache, host]
      _setDataForLocalStorage(HOSTS_DISABLED_CACHE, JSON.stringify(hostList)).then(() => {
        _hostsDisabledCache = hostList
        global.mainWindow.webContents.send('disable-cache-updated')
        if (global.cacheSettingWindow) {
          global.cacheSettingWindow.webContents.send('disable-cache-updated')
        }
      })
    }
  },
  restCache4Host (_host) {
    if (_hostsDisabledCache.includes(_host)) {
      const hostList = _hostsDisabledCache.filter(host => {
        return host !== _host
      })
      _setDataForLocalStorage(HOSTS_DISABLED_CACHE, JSON.stringify(hostList)).then(() => {
        _hostsDisabledCache = hostList
        global.mainWindow.webContents.send('disable-cache-updated')
        if (global.cacheSettingWindow) {
          global.cacheSettingWindow.webContents.send('disable-cache-updated')
        }
      })
    }
  }
}
