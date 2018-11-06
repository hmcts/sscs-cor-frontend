import * as request from 'request-promise';

export class EvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async upload(hearingId: string, questionId: string, file) {
    try {
      const body = await request.post({
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`,
        simple: false,
        resolveWithFullResponse: true,
        formData: {
          file: {
            value: file.buffer,
            options: {
              filename: file.originalname,
              contentType: file.mimetype
            }
          }
        }
      });
      return Promise.resolve(body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async remove(hearingId: string, questionId: string, fileId: string) {
    try {
      await request.delete({
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/${fileId}`,
        headers: {
          'Content-Length': '0'
        }
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
