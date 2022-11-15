import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import * as CONST from '../../constants';
const HTTP_RETRIES = CONST.HTTP_RETRIES;
const RETRY_INTERVAL = CONST.RETRY_INTERVAL;

interface DecisionRates {
  daily_living: string;
  mobility: string;
  compared_to_dwp: string;
}

interface Activity {
  activity: string;
  selection_key: string;
}

interface Activities {
  daily_living: Array<Activity>;
  mobility: Array<Activity>;
}

interface Decision {
  decision_state: string;
  decision_state_datetime: string;
  appellant_reply?: string;
  appellant_reply_datetime?: string;
  start_date: string;
  end_date: string;
  decision_rates?: DecisionRates;
  reason?: string;
  activities?: Activities;
}

interface FinalDecision {
  reason: string;
}

interface HearingArrangements {
  language_interpreter: boolean;
  languages: string;
  sign_language_interpreter: boolean;
  sign_langauge_type: string;
  hearing_loop_required: boolean;
  disabled_access_required: boolean;
  other_arrangements: string;
}

interface AddressDetails {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
}

interface Subscription {
  type: string;
  email: string;
  mobile: string;
}

interface UserDetails {
  type: string;
  name: string;
  address_details: AddressDetails;
  email: string;
  phone: string;
  mobile: string;
  subscriptions: Array<Subscription>;
}

interface AppealDetails {
  submitted_date: string;
  mrn_date: string;
  benefit_type: string;
  state: string;
}

export interface CaseDetails {
  online_hearing_id: string;
  appellant_name: string;
  case_reference: string;
  case_id?: number;
  decision?: Decision;
  final_decision?: FinalDecision;
  has_final_decision?: boolean;
  hearing_arrangements?: HearingArrangements;
  user_details?: UserDetails;
  appeal_details?: AppealDetails;
}

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
        retry: HTTP_RETRIES,
        delay: RETRY_INTERVAL,
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
    req: Request
  ) {
    return RequestPromise.request(
      {
        method: 'POST',
        uri: `${this.apiUrl}/api/citizen/${tya}`,
        body: { email, postcode },
        resolveWithFullResponse: true,
        simple: false,
      },
      req
    );
  }
}
