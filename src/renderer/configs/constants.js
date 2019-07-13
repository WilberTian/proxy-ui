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
