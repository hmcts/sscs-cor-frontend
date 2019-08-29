import { Request } from 'express';
import { Logger } from '@hmcts/nodejs-logging';
import { RequestPromise } from './request-wrapper';
const logger = Logger.getLogger('login.js');

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
      uri: `${this.apiUrl}/continuous-online-hearings`,
      qs: { email },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

  async getOnlineHearingsForCitizen(email: string, tya: string, req: Request) {
    const path = tya ? `/${tya}` : '';
    logger.info(`getOnlineHearingsForCitizen path: ${path} email: ${email} uri: ${this.apiUrl}/citizen${path}`);
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/citizen${path}`,
      qs: { email },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

  async assignOnlineHearingsToCitizen(email: string, tya: string, postcode: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      uri: `${this.apiUrl}/citizen/${tya}`,
      body: { email, postcode },
      resolveWithFullResponse: true,
      simple: false
    }, req);
  }

  async extendDeadline(hearingId: string, req: Request) {
    return RequestPromise.request({
      method: 'PATCH',
      uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}`
    }, req);
  }

  async recordTribunalViewResponse(hearingId: string, reply: string, req: Request, reason?: string) {
    return RequestPromise.request({
      method: 'PATCH',
      uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}/tribunal-view`,
      body: { reply, reason: reason ? reason : '' }
    }, req);
  }
}
