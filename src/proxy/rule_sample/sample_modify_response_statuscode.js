module.exports = {
  beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      const newResponse = responseDetail.response
      newResponse.statusCode = 404
      return {
        response: newResponse
      }
    }
  }
}
