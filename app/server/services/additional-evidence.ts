import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import config from 'config';

const retry: number = config.get('tribunals-api.retries');
const delay: number = config.get('tribunals-api.delay');

export interface EvidenceDescriptor {
  created_date: string;
  file_name: string;
  id: string;
  statusCode: any;
}

export class AdditionalEvidenceService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveStatement(identifier: string, statementText: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'POST',
        retry,
        delay,
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/statement`,
        body: {
          body: statementText,
          tya: req.session.tya,
        },
      },
      req
    );
  }

  async uploadEvidence(
    identifier: string,
    file: Express.Multer.File,
    req: Request
  ): Promise<EvidenceDescriptor> {
    return RequestPromise.request(
      {
        method: 'PUT',
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/evidence`,
        simple: false,
        resolveWithFullResponse: true,
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

  async removeEvidence(identifier: string, evidenceId: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'DELETE',
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/evidence/${evidenceId}`,
        headers: {
          'Content-Length': '0',
        },
      },
      req
    );
  }

  async getEvidences(
    identifier: string,
    req: Request
  ): Promise<EvidenceDescriptor[]> {
    return RequestPromise.request(
      {
        method: 'GET',
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/evidence`,
      },
      req
    );
  }

  async getCoversheet(caseId: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'GET',
        retry,
        delay,
        encoding: 'binary',
        uri: `${this.apiUrl}/api/continuous-online-hearings/${caseId}/evidence/coversheet`,
        headers: {
          'Content-type': 'application/pdf',
        },
      },
      req
    );
  }

  async submitEvidences(identifier: string, description: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'POST',
        retry,
        delay,
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/evidence`,
        body: {
          body: description,
          idamEmail: req.session.idamEmail,
        },
        headers: {
          'Content-type': 'application/json',
        },
      },
      req
    );
  }

  async submitSingleEvidences(
    identifier: string,
    description: string,
    file: Express.Multer.File,
    req: Request
  ) {
    return RequestPromise.request(
      {
        method: 'POST',
        retry,
        delay,
        uri: `${this.apiUrl}/api/continuous-online-hearings/${identifier}/singleevidence`,
        headers: {
          'Content-type': 'application/json',
        },
        formData: {
          body: description,
          idamEmail: req.session.idamEmail,
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
}
