import { InvalidRequestErrorResponse } from '@/util/api/get-validated-request-data';

export class ErrorTranslatableToResponse extends Error {
  asResponse(): InvalidRequestErrorResponse {
    throw new Error('Method not implemented');
  }
}
