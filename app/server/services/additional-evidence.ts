import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
const timeout = require('config').get('apiCallTimeout');
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('additional-evidence.ts');

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
    try {
      const body = await RequestPromise.request({
        method: 'PUT',
        uri: `${this.apiUrl}/continuous-online-hearings/${onlineHearingId}/statement`,
        body: {
          statementText
        },
        json: true,
        timeout
      }, req);

      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error saveStatement', error.message);
      return Promise.reject(error.message);
    }
  }

  async uploadEvidence(hearingId: string, file: Express.Multer.File, req: Request): Promise<EvidenceDescriptor> {
    try {
      const evidence: EvidenceDescriptor = await RequestPromise.request({
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
      return Promise.resolve(evidence);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async removeEvidence(hearingId: string, evidenceId: string, req: Request) {
    try {
      await RequestPromise.request({
        method: 'delete',
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence/${evidenceId}`,
        headers: {
          'Content-Length': '0'
        }
      }, req);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getEvidences(hearingId: string, req: Request): Promise<EvidenceDescriptor[]> {
    try {
      const evidences: EvidenceDescriptor[] = await RequestPromise.request({
        method: 'get',
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        json: true,
        timeout
      }, req);
      return Promise.resolve(evidences);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async submitEvidences(hearingId: string, req: Request) {
    try {
      await RequestPromise.request({
        method: 'post',
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        headers: {
          'Content-Length': '0'
        },
        json: true,
        timeout
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
