export const defaultProxyConfig = {
  port: 8001,
  rule: {},
  webInterface: {
    enable: true,
    webPort: 8002
  },
  throttle: 30720,
  forceProxyHttps: true,
  wsIntercept: false,
  silent: true,
  enableGlobalProxy: true
}

export const defaultRuleConfigs = [
  {
    guid: 'demo-1',
    enabled: true,
    type: 'request',
    tags: ['test', 'demo'],
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    header: '',
    body: ''
  },
  {
    guid: 'demo-2',
    enabled: true,
    type: 'mock',
    tags: [],
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    bodyType: 'string',
    bodyContent: 'this is mock content',
    bodyPath: '',
    response: {
      statusCode: 200,
      header: {
        'content-type': 'text/html'
      }
    }
  },
  {
    guid: 'demo-3',
    enabled: true,
    type: 'response',
    tags: [],
    matcher: 'includes',
    pattern: 'script.js',
    bodyType: 'file',
    bodyContent: 'this is mock content',
    bodyPath: '/Users/script.js',
    response: {
      statusCode: 200,
      header: {
        'content-type': 'application/javascript'
      }
    }
  }
]

export const defaultWeinreConfig = {
  port: 8787
}

export const defaultVconsoleConfig = {
  injected: false
}
