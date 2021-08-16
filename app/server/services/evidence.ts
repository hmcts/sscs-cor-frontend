import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
const httpRetries = 3;
export class EvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async upload(hearingId: string, questionId: string, file, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      retry: httpRetries,
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
      retry: httpRetries,
      headers: { 'Content-Length': '0' },
      url: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/${fileId}`
    }, req);
  }
}
