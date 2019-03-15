const request = require('request-promise');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('additional-evidence.ts');
const timeout = require('config').get('apiCallTimeout');

export class AdditionalEvidenceService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveStatement(statementText: string) {
    try {
      const body = await request.put({
        uri: this.apiUrl,
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
}
