const WEINRE_MOCK_DOMAIN = 'www.proxyui-weinre.com'

const getWeinreRule = function () {
  return {
    beforeSendRequest (requestDetail) {
      if (!global.weinreProcess) {
        return
      }

      if (requestDetail.url.indexOf(WEINRE_MOCK_DOMAIN) > -1) {
        const newRequestOptions = requestDetail.requestOptions
        newRequestOptions.hostname = '192.168.0.109'
        newRequestOptions.port = 8787
        return {
          protocol: 'http',
          requestOptions: newRequestOptions
        }
      }
    },
    beforeSendResponse (requestDetail, responseDetail) {
      if (!global.weinreProcess) {
        return
      }

      const response = responseDetail.response
      if (response &&
          response.header &&
          response.header['Content-Type'] &&
          response.header['Content-Type'].includes('text/html')) {
        const weinreScript = `<script src="//${WEINRE_MOCK_DOMAIN}/target/target-script-min.js#anonymous" type="text/javascript"></script>`

        let bodyString = response.body.toString('utf8')
        if (bodyString) {
          bodyString = bodyString.replace('<head>', `<head>${weinreScript}`)
          response.body = bodyString
        }
        return {
          response
        }
      }
    }
  }
}

export default getWeinreRule
