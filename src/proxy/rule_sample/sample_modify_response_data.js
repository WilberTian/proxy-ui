module.exports = {
  beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url === 'http://httpbin.org/user-agent') {
      logger.info('sample_modify_response_data')
      const newResponse = responseDetail.response
      newResponse.body += '-- ProxyUI Hacked! --'
      return new Promise((resolve, reject) => {
        setTimeout(() => { // delay the response for 5s
          resolve({ response: newResponse })
        }, 5000)
      })
    }
  }
}
