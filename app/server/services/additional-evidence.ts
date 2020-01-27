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

  async saveStatement(identifier: string, statementText: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      uri: `${this.apiUrl}/continuous-online-hearings/${identifier}/statement`,
      body: {
        body: statementText,
        tya: req.session.tya
      }
    }, req);
  }

  async uploadEvidence(identifier: string, file: Express.Multer.File, req: Request): Promise<EvidenceDescriptor> {
    return RequestPromise.request({
      method: 'PUT',
      uri: `${this.apiUrl}/continuous-online-hearings/${identifier}/evidence`,
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

  async removeEvidence(identifier: string, evidenceId: string, req: Request) {
    return RequestPromise.request({
      method: 'DELETE',
      uri: `${this.apiUrl}/continuous-online-hearings/${identifier}/evidence/${evidenceId}`,
      headers: {
        'Content-Length': '0'
      }
    }, req);
  }

  async getEvidences(identifier: string, req: Request): Promise<EvidenceDescriptor[]> {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/continuous-online-hearings/${identifier}/evidence`
    }, req);
  }

  async getCoversheet(caseId: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      encoding: 'binary',
      uri: `${this.apiUrl}/continuous-online-hearings/${caseId}/evidence/coversheet`,
      headers: {
        'Content-type': 'applcation/pdf'
      }
    }, req);
  }

  async submitEvidences(identifier: string, description: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      uri: `${this.apiUrl}/continuous-online-hearings/${identifier}/evidence`,
      body: {
        body: description,
        idamEmail: req.session.idamEmail
      },
      headers: {
        'Content-Length': '0'
      }
    }, req);
  }
}
