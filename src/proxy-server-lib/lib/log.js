import util from './util'

const color = require('colorful')

let ifPrint = true
let logLevel = 0
const LogLevelMap = {
  tip: 0,
  system_error: 1,
  rule_error: 2,
  warn: 3,
  debug: 4
}

function setPrintStatus(status) {
  ifPrint = !!status
}

function setLogLevel(level) {
  logLevel = parseInt(level, 10)
}

function printLog(content, type) {
  if (!ifPrint) {
    return
  }

  const timeString = util.formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss')
  switch (type) {
    case LogLevelMap.tip: {
      if (logLevel > 0) {
        return
      }
      console.log(color.cyan(`[ProxyUI Log][${timeString}]: ` + content))
      break
    }

    case LogLevelMap.system_error: {
      if (logLevel > 1) {
        return
      }
      console.error(color.red(`[ProxyUI ERROR][${timeString}]: ` + content))
      break
    }

    case LogLevelMap.rule_error: {
      if (logLevel > 2) {
        return
      }

      console.error(
        color.red(`[ProxyUI RULE_ERROR][${timeString}]: ` + content)
      )
      break
    }

    case LogLevelMap.warn: {
      if (logLevel > 3) {
        return
      }

      console.error(color.yellow(`[ProxyUI WARN][${timeString}]: ` + content))
      break
    }

    case LogLevelMap.debug: {
      console.log(color.cyan(`[ProxyUI Log][${timeString}]: ` + content))
      return
    }

    default: {
      console.log(color.cyan(`[ProxyUI Log][${timeString}]: ` + content))
      break
    }
  }
}

const __exports = {}

__exports.printLog = printLog

__exports.debug = content => {
  printLog(content, LogLevelMap.debug)
}

__exports.info = content => {
  printLog(content, LogLevelMap.tip)
}

__exports.warn = content => {
  printLog(content, LogLevelMap.warn)
}

__exports.error = content => {
  printLog(content, LogLevelMap.system_error)
}

__exports.ruleError = content => {
  printLog(content, LogLevelMap.rule_error)
}

__exports.setPrintStatus = setPrintStatus
__exports.setLogLevel = setLogLevel
__exports.T_TIP = LogLevelMap.tip
__exports.T_ERR = LogLevelMap.system_error
__exports.T_RULE_ERROR = LogLevelMap.rule_error
__exports.T_WARN = LogLevelMap.warn
__exports.T_DEBUG = LogLevelMap.debug

export default __exports
