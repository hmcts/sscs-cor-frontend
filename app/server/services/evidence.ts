import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import { CONST } from '../../constants';
import HTTP_RETRIES = CONST.HTTP_RETRIES;
import RETRY_INTERVAL = CONST.RETRY_INTERVAL;

export class EvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async upload(hearingId: string, questionId: string, file, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      retry: HTTP_RETRIES,
      delay: RETRY_INTERVAL,
      simple: false,
      resolveWithFullResponse: true,
      url: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`,
      formData: {
        file: {
          value: file.buffer,
          options: {
            filename: file.originalname,
            contentType: file.mimetype
          }
        }
      }
    }, req);
  }

  async remove(hearingId: string, questionId: string, fileId: string, req: Request) {
    return RequestPromise.request({
      method: 'DELETE',
      retry: HTTP_RETRIES,
      delay: RETRY_INTERVAL,
      headers: { 'Content-Length': '0' },
      url: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/${fileId}`
    }, req);
  }
}
