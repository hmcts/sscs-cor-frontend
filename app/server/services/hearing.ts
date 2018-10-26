import * as request from 'request-promise';

interface OnlineHearingDecision {
  decision_award: string;
  decision_header: string;
  decision_reason: string;
  decision_text: string;
  decision_state: string;
  decision_state_datetime: string;
  appellant_reply?: string;
  appellant_reply_datetime?: string;
}

export interface OnlineHearing {
  appellant_name: string;
  case_reference: string;
  online_hearing_id: string;
  decision?: OnlineHearingDecision;
}

export class HearingService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getOnlineHearing(email): Promise<request.Response> {
    try {
      const response = await request.get({
        uri: `${this.apiUrl}/continuous-online-hearings`,
        qs: { email },
        resolveWithFullResponse: true,
        simple: false,
        json: true
      });
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
