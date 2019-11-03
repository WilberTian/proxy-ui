module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_modify_request_header')
      const newRequestOptions = requestDetail.requestOptions
      newRequestOptions.headers['User-Agent'] = 'AnyProxy/0.0.0'
      return {
        requestOptions: newRequestOptions
      }
    }
  }
}
