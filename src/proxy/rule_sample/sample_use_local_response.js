module.exports = {
  beforeSendRequest (requestDetail) {
    const localResponse = {
      statusCode: 200,
      header: { 'Content-Type': 'application/json' },
      body: '{"hello": "this is local response"}'
    }
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      logger.info('sample_use_local_response')
      return {
        response: localResponse
      }
    }
  }
}
