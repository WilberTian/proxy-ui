const fs = require('fs')
const path = require('path')

const VCONSOLE_RULE = {
  beforeSendRequest (requestDetail) {
    if (requestDetail.url.indexOf('/proxy-ui/vconsole.min.js') > -1) {
      const vconsoleScriptPath = path.resolve(__static, 'vconsole.min.js')
      const vconsoleScript = fs.readFileSync(vconsoleScriptPath, {
        encoding: 'utf8'
      })

      return {
        response: {
          statusCode: 200,
          header: {
            'content-type': 'application/javascript'
          },
          body: vconsoleScript
        }
      }
    }
  },
  beforeSendResponse (requestDetail, responseDetail) {
    const response = responseDetail.response
    if (response &&
        response.header &&
        response.header['Content-Type'] &&
        response.header['Content-Type'].includes('text/html')) {
      const vconsoleScript = `
        <script src="/proxy-ui/vconsole.min.js"></script>
        <script>
          // init vConsole
          var vConsole = new VConsole();
          console.log('vconsole started!');
        </script>
      `

      let bodyString = response.body.toString('utf8')
      if (bodyString) {
        bodyString = bodyString.replace('<head>', `<head>${vconsoleScript}`)
        response.body = bodyString
      }
      return {
        response
      }
    }
  }
}

export default VCONSOLE_RULE
