module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_modify_request_protocol')
      const newOption = requestDetail.requestOptions
      newOption.port = 443
      return {
        protocol: 'https',
        requestOptions: newOption
      }
    }
  }
}
