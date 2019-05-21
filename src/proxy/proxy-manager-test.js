require('babel-register')({
  presets: ['env', 'stage-0']
})
const proxyManager = require('./proxy-manager').default

const proxyConfig = proxyManager.generateProxyConfig()

proxyManager.startProxyServer(proxyConfig).then(
  function () {
    console.log('success')
  },
  e => {
    console.log('asdf')
  }
)

// setTimeout(() => {
//   proxyManager.startProxyServer(proxyConfig).then(
//     function () {
//       console.log('success')
//     },
//     e => {
//       console.log('asdf')
//     }
//   )
// }, 3000)
