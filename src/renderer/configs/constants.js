export const defaultRuleConfigs = {
  request: {
    enabled: true,
    tags: [],
    type: 'request',
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    header: '',
    body: ''
  },
  response: {
    enabled: true,
    tags: [],
    type: 'response',
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    bodyType: 'file',
    response: {
      statusCode: 200,
      header: {
        'content-type': 'text/html'
      },
      body: 'this is mock content'
    }
  },
  mock: {
    enabled: true,
    tags: [],
    type: 'mock',
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    bodyType: 'string',
    bodyContent: 'this is response content',
    bodyPath: '',
    response: {
      statusCode: 200,
      header: {
        'content-type': 'text/html'
      }
    }
  },
  customize: {
    enabled: true,
    tags: [],
    type: 'customize',
    name: '自定义规则',
    description: '',
    customizeRule: ''
  }
}

export const ruleTypeMapper = {
  mock: 'Mock响应',
  response: '修改响应',
  request: '修改请求',
  customize: '自定义规则'
}

export const httpHeaderKeys = ['Accept', 'Accept-Charset', 'Accept-Features', 'Accept-Encoding', 'Accept-Language', 'Accept-Ranges', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers', 'Access-Control-Max-Age', 'Access-Control-Expose-Headers', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Age', 'Allow', 'Alternates', 'Authorization', 'Cache-Control', 'Connection', 'Content-Encoding', 'Content-Language', 'Content-Length', 'Content-Location', 'Content-MD5', 'Content-Range', 'Content-Security-Policy', 'Content-Type', 'Cookie', 'DNT', 'Date', 'ETag', 'Expect', 'Expires', 'From', 'Host', 'If-Match', 'If-Modified-Since', 'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Last-Event-ID', 'Last-Modified', 'Link', 'Location', 'Max-Forwards', 'Negotiate', 'Origin', 'Pragma', 'Proxy-Authenticate', 'Proxy-Authorization', 'Range', 'Referer', 'Retry-After', 'Sec-Websocket-Extensions', 'Sec-Websocket-Key', 'Sec-Websocket-Origin', 'Sec-Websocket-Protocol', 'Sec-Websocket-Version', 'Server', 'Set-Cookie', 'Set-Cookie2', 'Strict-Transport-Security', 'TCN', 'TE', 'Trailer', 'Transfer-Encoding', 'Upgrade', 'User-Agent', 'Variant-Vary', 'Vary', 'Via', 'Warning', 'WWW-Authenticate', 'X-Content-Duration', 'X-Content-Security-Policy', 'X-DNSPrefetch-Control', 'X-Frame-Options', 'X-Requested-With']
