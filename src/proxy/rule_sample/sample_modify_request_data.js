module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org/post') === 0) {
      logger.info('sample_modify_request_data')
      return {
        requestData: 'i-am-anyproxy-modified-post-data'
      }
    }
  }
}
