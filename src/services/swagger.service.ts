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
        info: {
          title: 'Next Swagger API Example',
          version: '1.0',
        },
        components: {
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
