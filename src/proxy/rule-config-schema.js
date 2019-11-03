const ruleConfigSchema = {
  type: 'array',
  items: {
    oneOf: [
      {
        type: 'object',
        properties: {
          type: {
            const: 'request'
          },
          enabled: {
            type: 'boolean'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          matcher: {
            type: 'string',
            enum: ['includes', 'equals', 'startsWidth', 'endsWidth']
          },
          pattern: {
            type: 'string',
            minLength: 1
          },
          header: {
            type: 'string'
          },
          body: {
            type: 'string'
          }
        },
        additionalProperties: false
      },
      {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['mock', 'response']
          },
          enabled: {
            type: 'boolean'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          matcher: {
            type: 'string',
            enum: ['includes', 'equals', 'startsWidth', 'endsWidth']
          },
          pattern: {
            type: 'string',
            minLength: 1
          },
          bodyType: {
            type: 'string',
            enum: ['string', 'file']
          },
          bodyContent: {
            type: 'string'
          },
          bodyPath: {
            type: 'string'
          },
          response: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number'
              },
              header: {
                type: 'object'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      },
      {
        type: 'object',
        properties: {
          type: {
            const: 'customize'
          },
          enabled: {
            type: 'boolean'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          name: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string'
          },
          customizeRule: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },
  uniqueItems: true
}

export default ruleConfigSchema
