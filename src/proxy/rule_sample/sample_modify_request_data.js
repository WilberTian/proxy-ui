module.exports = {
  *beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org/post') === 0) {
      return {
        requestData: 'i-am-anyproxy-modified-post-data'
      }
    }
  }
}
