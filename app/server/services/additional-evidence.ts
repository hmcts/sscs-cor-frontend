import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

const httpRetries = 3;

export interface EvidenceDescriptor {
  created_date: string;
  file_name: string;
  id: string;
  statusCode: any;
}

export class AdditionalEvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveStatement(identifier: string, statementText: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      retry: httpRetries,
      uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/statement`,
      body: {
        body: statementText,
        tya: req.session['tya']
      }
    }, req);
  }

  async getCoversheet(caseId: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      retry: httpRetries,
      encoding: 'binary',
      uri: `${this.apiUrl}/api/continuous-online-hearings/${caseId}/evidence/coversheet`,
      headers: {
        'Content-type': 'application/pdf'
      }
    }, req);
  }

  async submitEvidences(identifier: string, description: string, file: Express.Multer.File, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      retry: httpRetries,
      uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/singleevidence`,
      headers: {
        'Content-type': 'application/json'
      },
      formData: {
        body: description,
        idamEmail: req.session['idamEmail'],
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
}
