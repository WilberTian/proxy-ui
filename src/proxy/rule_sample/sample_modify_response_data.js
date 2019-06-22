module.exports = {
  summary () { return 'a rule to modify response' },
  *beforeSendResponse (requestDetail, responseDetail) {
    if (requestDetail.url === 'http://httpbin.org/user-agent') {
      const newResponse = responseDetail.response
      newResponse.body += '-- AnyProxy Hacked! --'
      return new Promise((resolve, reject) => {
        setTimeout(() => { // delay the response for 5s
          resolve({ response: newResponse })
        }, 5000)
      })
    }
  }
}
