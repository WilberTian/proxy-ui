const params = process.argv.slice(2)
const weinre = require(params[0])

weinre.run({
  httpPort: params[1] || 8080,
  boundHost: params[2] || '-all-',
  verbose: params[3] || false,
  debug: params[4] || false,
  readTimeout: params[5] || 5,
  deathTimeout: params[6] || 15
})
