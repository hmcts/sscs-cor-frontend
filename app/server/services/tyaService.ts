import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export class TrackYourApealService {
  private tribunalApiUrl: string;

  constructor(url: string) {
    this.tribunalApiUrl = url;
  }

  async getAppeal(appealNumber: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.tribunalApiUrl}/appeals/${appealNumber}`
    }, req);
  }

  async validateSurname(appealNumber: string, surname: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.tribunalApiUrl}/appeals/${appealNumber}/surname/${surname}`
    }, req);
  }
}
