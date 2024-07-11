import { EnvConfig, EnvConfigSchema } from '@/models/env-config.model';

export class EnvService {
  private static _instance: EnvService;
  private readonly data: EnvConfig;

  private constructor() {
    this.data = EnvConfigSchema.parse(process.env);
  }

  static get instance(): EnvService {
    return this._instance || (this._instance = new this());
  }

  get env(): string {
    return process.env.NODE_ENV || 'development';
  }

  get isDevelopment(): boolean {
    return this.env === 'development';
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }

  get isTest(): boolean {
    return this.env === 'test';
  }

  get apiKey() {
    return this.data.API_KEY;
  }
}
