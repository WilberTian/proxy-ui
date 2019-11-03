module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_modify_request_path')
      const newRequestOptions = requestDetail.requestOptions
      newRequestOptions.path = '/user-agent'
      newRequestOptions.method = 'GET'
      return {
        requestOptions: newRequestOptions
      }
    }
  }
}
