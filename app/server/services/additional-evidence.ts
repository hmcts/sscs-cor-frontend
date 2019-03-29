const request = require('request-promise');
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

  async saveStatement(onlineHearingId: string, statementText: string) {
    try {
      const body = await request.put({
        uri: `${this.apiUrl}/continuous-online-hearings/${onlineHearingId}/statement`,
        body: {
          statementText
        },
        json: true,
        timeout
      });

      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error saveAnswer', error);
      return Promise.reject(error);
    }
  }

  async uploadEvidence(hearingId: string, file: Express.Multer.File): Promise<EvidenceDescriptor> {
    try {
      const evidence: EvidenceDescriptor = await request.put({
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
      });
      return Promise.resolve(evidence);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async removeEvidence(hearingId: string, evidenceId: string) {
    try {
      await request.delete({
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence/${evidenceId}`,
        headers: {
          'Content-Length': '0'
        }
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getEvidences(hearingId: string): Promise<EvidenceDescriptor[]> {
    try {
      const evidences: EvidenceDescriptor[] = await request.get({
        url: `${this.apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        json: true,
        timeout
      });
      return Promise.resolve(evidences);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async submitEvidences(hearingId: string) {
    try {
      await request.post({
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
