import * as request from 'request-promise';

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

  async getOnlineHearing(email: string, userCode: string, serviceToken: string): Promise<request.Response> {
    try {
      const response: request.Response = await request.get({
        uri: `${this.apiUrl}/continuous-online-hearings`,
        qs: { email },
        headers: {
          Authorization: `Bearer ${userCode}`,
          ServiceAuthorization: `Bearer ${serviceToken}`
        },
        resolveWithFullResponse: true,
        simple: false,
        json: true
      });
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async extendDeadline(hearingId: string, userCode: string, serviceToken: string): Promise<ExtendDeadlineResponse> {
    try {
      const body = await request.patch({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}`,
        headers: {
          Authorization: `Bearer ${userCode}`,
          ServiceAuthorization: `Bearer ${serviceToken}`
        },
        json: true
      });
      return Promise.resolve(body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async recordTribunalViewResponse(hearingId: string, reply: string, userCode: string, serviceToken: string, reason?: string): Promise<void> {
    try {
      await request.patch({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}/tribunal-view`,
        headers: {
          Authorization: `Bearer ${userCode}`,
          ServiceAuthorization: `Bearer ${serviceToken}`
        },
        body: { reply, reason: reason ? reason : '' },
        json: true
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
