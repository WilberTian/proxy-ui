module.exports = {
  *beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org/user-agent') === 0) {
      const newResponse = responseDetail.response
      newResponse.header['X-Proxy-By'] = 'AnyProxy'
      return {
        response: newResponse
      }
    }
  }
}
