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

interface ExtendDeadlineResponse {
  deadline_expiry_date: string;
}

export class HearingService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getOnlineHearing(email): Promise<request.Response> {
    try {
      const response: request.Response = await request.get({
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

  async extendDeadline(hearingId: string): Promise<ExtendDeadlineResponse> {
    try {
      const body = await request.patch({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}`,
        json: true
      });
      return Promise.resolve(body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async recordTribunalViewResponse(hearingId: string, reply: string, reason?: string): Promise<void> {
    try {
      await request.patch({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}/tribunal-view`,
        body: { reply, reason: reason ? reason : '' },
        json: true
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
