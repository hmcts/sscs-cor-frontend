import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export interface EvidenceDescriptor {
  created_date: string;
  file_name: string;
  id: string;
}

export class AdditionalEvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveStatement(onlineHearingId: string, statementText: string, req: Request) {
    return RequestPromise.request({
      method: 'PUT',
      uri: `${this.apiUrl}/continuous-online-hearings/${onlineHearingId}/statement`,
      body: {
        statementText
      }
    }, req);
  }

  async uploadEvidence(hearingId: string, file: Express.Multer.File, req: Request): Promise<EvidenceDescriptor> {
    return RequestPromise.request({
      method: 'PUT',
      url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
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
    }, req);
  }

  async removeEvidence(hearingId: string, evidenceId: string, req: Request) {
    return RequestPromise.request({
      method: 'delete',
      url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence/${evidenceId}`,
      headers: {
        'Content-Length': '0'
      }
    }, req);
  }

  async getEvidences(hearingId: string, req: Request): Promise<EvidenceDescriptor[]> {
    return RequestPromise.request({
      method: 'get',
      url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`
    }, req);
  }

  async submitEvidences(hearingId: string, req: Request) {
    return RequestPromise.request({
      method: 'post',
      url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
      headers: {
        'Content-Length': '0'
      }
    }, req);
  }
}
