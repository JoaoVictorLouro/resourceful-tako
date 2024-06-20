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
            name: 'stack',
            description: 'Docker compose stack operations',
          },
        ],
        components: {
          schemas: {
            stack: {
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
          },
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [],
      },
    }) as Record<string, unknown>;
  }
}
