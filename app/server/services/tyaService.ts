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

  async getDocument(url: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      encoding: 'binary',
      uri: `${this.tribunalApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': 'application/pdf'
      }
    }, req);
  }

  async getMediaFile(url: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      encoding: 'binary',
      uri: `${this.tribunalApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': ['audio/mp3', 'video/mp4']
      }
    }, req);
  }
}
