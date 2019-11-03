module.exports = {
  beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org/user-agent') === 0) {
      logger.info('sample_modify_response_header')
      const newResponse = responseDetail.response
      newResponse.header['X-Proxy-By'] = 'AnyProxy'
      return {
        response: newResponse
      }
    }
  }
}
