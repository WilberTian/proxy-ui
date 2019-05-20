const proxyManager = require('./proxy-manager')

const options = {
  port: 8001,
  rule: proxyManager.generateProxyRule(),
  webInterface: {
    enable: true,
    webPort: 8002
  },
  throttle: 10000,
  forceProxyHttps: false,
  wsIntercept: false,
  silent: false
}

proxyManager.startProxyServer(options).then(
  function () {
    console.log('success')
  },
  e => {
    console.log('asdf')
  }
)

setTimeout(() => {
  proxyManager.startProxyServer(options).then(
    function () {
      console.log('success')
    },
    e => {
      console.log('asdf')
    }
  )
}, 3000)
