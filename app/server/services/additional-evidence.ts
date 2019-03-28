import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export class AdditionalEvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveStatement(statementText: string, req: Request) {
    return RequestPromise.request({
      method: 'PUT',
      body: {
        statementText
      },
      uri: `${this.apiUrl}/additional-evidence/statmenet`
    }, req);
  }
}
