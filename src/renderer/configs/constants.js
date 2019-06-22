export const defaultRuleConfigs = {
  request: {
    enabled: true,
    type: 'request',
    matcher: 'includes',
    pattern: 'www.proxy-ui.com',
    header: '',
    body: ''
  },
  response: {
    enabled: true,
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
    type: 'customize',
    name: '自定义规则',
    description: '',
    customizeRule: ''
  }
}
