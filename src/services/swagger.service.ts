import { createSwaggerSpec } from 'next-swagger-doc';

export class SwaggerService {
  private static _instance: SwaggerService;

  private constructor() {}

  static get instance(): SwaggerService {
    return this._instance || (this._instance = new this());
  }

  async getApiV1Docs(): Promise<Record<string, unknown>> {
    return createSwaggerSpec({
      apiFolder: 'src/app/api',
      definition: {
        openapi: '3.0.0',
        basePath: 'http://localhost:7060/api/v1',
        info: {
          title: 'Resourceful Tako - API v1',
          description: 'Resourceful Tako API v1 documentation',
          contact: {
            email: 'resourceful.tako@joaovictor.com',
            name: 'João Victor',
            url: 'https://joaovictor.com',
          },
          license: {
            name: 'GPL-3.0',
            url: '',
          },
          termsOfService: '',
          version: '1.0',
        },
        tags: [
          {
            name: 'Stack',
            description: 'Docker compose stack operations',
          },
          {
            name: 'StackDependency',
            description: 'A link modeling a dependency between 2 Stacks',
          },
        ],
        components: {
          schemas: {
            Stack: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                name: {
                  type: 'string',
                },
                code: {
                  type: 'string',
                },
                cwd: {
                  type: 'string',
                },
                notes: {
                  type: 'string',
                },
              },
            },
            StackDependency: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                stackId: {
                  type: 'string',
                  format: 'uuid',
                },
                dependsOnStackId: {
                  type: 'string',
                  format: 'uuid',
                },
                notes: {
                  type: 'string',
                },
              },
            },
            StackNotFoundError: {
              type: 'object',
              properties: {
                status: {
                  type: 'number',
                  example: 404,
                },
                message: {
                  type: 'string',
                  example: 'Stack not found',
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'not_found',
                      },
                      message: {
                        type: 'string',
                        example: 'Stack not found',
                      },
                    },
                  },
                },
              },
            },
          },
          securitySchemes: {
            ApiKey: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-KEY',
              description: "API Key added to the API_KEY environment variable in the server's environment",
            },
          },
        },
        security: [
          {
            ApiKey: [],
          },
        ],
      },
    }) as Record<string, unknown>;
  }
}
