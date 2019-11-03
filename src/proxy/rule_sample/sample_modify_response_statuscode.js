module.exports = {
  beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_modify_response_statuscode')
      const newResponse = responseDetail.response
      newResponse.statusCode = 404
      return {
        response: newResponse
      }
    }
  }
}
