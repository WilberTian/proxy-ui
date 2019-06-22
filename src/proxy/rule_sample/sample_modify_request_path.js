module.exports = {
  *beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      const newRequestOptions = requestDetail.requestOptions
      newRequestOptions.path = '/user-agent'
      newRequestOptions.method = 'GET'
      return {
        requestOptions: newRequestOptions
      }
    }
  }
}
