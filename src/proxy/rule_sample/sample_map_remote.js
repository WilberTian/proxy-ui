module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_map_remote')

      const newOption = requestDetail.requestOptions
      newOption.hostname = 'github.com'
      newOption.port = 443
      newOption.method = 'GET'
      newOption.path = '/list'
      newOption.headers['User-Agent'] = 'proxy-ui/1.0.0'
      newOption.headers['host'] = 'github.com'

      return {
        protocol: 'https',
        requestOptions: newOption
      }
    }
  }
}
