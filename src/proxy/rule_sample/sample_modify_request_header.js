module.exports = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      const newRequestOptions = requestDetail.requestOptions
      newRequestOptions.headers['User-Agent'] = 'AnyProxy/0.0.0'
      return {
        requestOptions: newRequestOptions
      }
    }
  }
}
