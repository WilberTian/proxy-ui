const http = require('http')
const fs = require('fs')
const log = require('electron-log')

const AnyProxyUtils = require('../proxy-server-lib/lib/util.js')

const certPath = AnyProxyUtils.getAnyProxyPath('certificates') + '/rootCA.crt' || ''

const readFile = (response, filePath, header = {}) => {
  response.writeHead(200, header)
  let stream = fs.createReadStream(filePath)
  stream.on('error', function () {
    response.writeHead(500, header)
    response.end('<h1>服务器错误</h1>')
  })
  stream.pipe(response)
}

const requestHandler = (req, res) => {
  switch (req.url) {
    case '/getRootCA':
      try {
        let stats = fs.statSync(certPath)
        if (stats && stats.isFile()) {
          readFile(res, certPath, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment;filename=rootCA.crt'
          })
        }
      } catch (err) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end('<h1>证书文件不存在</h1>')
      }
      break
    default:
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end('<h1>该路由不存在，404</h1>')
      break
  }
}

let server
const sockets = new Set()

export function startHttpServer (port = 9090) {
  return new Promise((resolve, reject) => {
    if (!server) {
      server = http.createServer(requestHandler)

      server.on('connection', (socket) => {
        sockets.add(socket)
      })

      server.on('error', function (e) {
        log.error(`fail to start http server on port: ${port}`)
        server = null
        reject(new Error('服务器错误'))
      })
      try {
        server.listen(port)
        resolve()
        log.info(`start http server on port: ${port}`)
      } catch (e) {
        log.error(`fail to start http server: ${e}`)
        server = null
        reject(new Error('服务器错误'))
      }
    } else {
      resolve()
    }
  })
}

export function stopHttpServer () {
  return new Promise((resolve, reject) => {
    if (server) {
      for (const socket of sockets) {
        socket.destroy()
        sockets.delete(socket)
      }

      server.close((err) => {
        if (err) {
          log.error(`fail to close http server: ${err}`)
          reject(err)
        } else {
          log.info('close http server')
          server = null
          resolve()
        }
      })
    } else {
      log.info('close http server')
      resolve()
    }
  })
}

export function getHttpServerStatus () {
  return !!server
}
