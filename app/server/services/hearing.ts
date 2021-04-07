import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

interface OnlineHearingDecision {
  start_date: string;
  end_date: string;
  decision_state: string;
  decision_state_datetime: string;
  appellant_reply?: string;
  appellant_reply_datetime?: string;
}

interface FinalDecision {
  reason: string;
}

export interface OnlineHearing {
  appellant_name: string;
  case_reference: string;
  online_hearing_id: string;
  decision?: OnlineHearingDecision;
  has_final_decision: boolean;
  final_decision?: FinalDecision;
}

interface ExtendDeadlineResponse {
  deadline_expiry_date: string;
}

export class HearingService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getOnlineHearing(email: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/api/continuous-online-hearings`,
      qs: { email },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

  async getOnlineHearingsForCitizen(email: string, tya: string, req: Request) {
    const path = tya ? `/${tya}` : '';
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/api/citizen${path}`,
      qs: { email },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

  async assignOnlineHearingsToCitizen(email: string, tya: string, postcode: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      uri: `${this.apiUrl}/api/citizen/${tya}`,
      body: { email, postcode },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

}
