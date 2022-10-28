import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
export class EvidenceService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async upload(hearingId: string, questionId: string, file, req: Request) {
    return await RequestPromise.request(
      {
        method: 'POST',
        simple: false,
        resolveWithFullResponse: true,
        url: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`,
        formData: {
          file: {
            value: file.buffer,
            options: {
              filename: file.originalname,
              contentType: file.mimetype,
            },
          },
        },
      },
      req
    );
  }

  async remove(
    hearingId: string,
    questionId: string,
    fileId: string,
    req: Request
  ) {
    return await RequestPromise.request(
      {
        method: 'DELETE',
        headers: { 'Content-Length': '0' },
        url: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/${fileId}`,
      },
      req
    );
  }
}
