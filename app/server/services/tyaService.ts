import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export class TrackYourApealService {
  private tribunalApiUrl: string;

  constructor(url: string) {
    this.tribunalApiUrl = url;
  }

  async getAppeal(caseId: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.tribunalApiUrl}/appeals?mya=true&caseId=${caseId}`
    }, req);
  }

  async validateSurname(appealNumber: string, surname: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.tribunalApiUrl}/appeals/${appealNumber}/surname/${surname}`
    }, req);
  }
}
