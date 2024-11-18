import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import config from 'config';

const retry: number = config.get('api.retries');
const delay: number = config.get('api.delay');

interface ExtendDeadlineResponse {
  deadline_expiry_date: string;
}

export class CaseService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getOnlineHearing(email: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'GET',
        uri: `${this.apiUrl}/api/continuous-online-hearings`,
        qs: { email },
        resolveWithFullResponse: true,
        simple: false,
      },
      req
    );
  }

  async getCasesForCitizen(email: string, tya: string, req: Request) {
    const path = tya ? `/${tya}` : '';
    return RequestPromise.request(
      {
        method: 'GET',
        retry,
        delay,
        uri: `${this.apiUrl}/api/citizen${path}`,
        qs: { email },
        resolveWithFullResponse: true,
        simple: false,
      },
      req
    );
  }

  async assignOnlineHearingsToCitizen(
    email: string,
    tya: string,
    postcode: string,
    ibcaReference: string,
    req: Request
  ) {
    return RequestPromise.request(
      {
        method: 'POST',
        uri: `${this.apiUrl}/api/citizen/${tya}`,
        body: { email, postcode, ibcaReference },
        resolveWithFullResponse: true,
        simple: false,
      },
      req
    );
  }
}
