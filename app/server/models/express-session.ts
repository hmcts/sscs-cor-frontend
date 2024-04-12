export interface DecisionRates {
  daily_living: string;
  mobility: string;
  compared_to_dwp: string;
}

export interface Activity {
  activity: string;
  selection_key: string;
}

export interface Activities {
  daily_living: Array<Activity>;
  mobility: Array<Activity>;
}

export interface Decision {
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

export interface FinalDecision {
  reason: string;
}

export interface HearingArrangements {
  language_interpreter: boolean;
  languages: string;
  sign_language_interpreter: boolean;
  sign_langauge_type?: string;
  hearing_loop_required: boolean;
  disabled_access_required: boolean;
  other_arrangements: string;
}

export interface AddressDetails {
  line1: string;
  line2?: string;
  town: string;
  county: string;
  postcode: string;
}

export interface Subscription {
  type?: string;
  email?: string;
  mobile?: string;
}

export interface UserDetails {
  type?: string;
  name?: string;
  address_details: AddressDetails;
  email: string;
  phone?: string;
  mobile?: string;
  subscriptions?: Array<Subscription>;
}

export interface AppealDetails {
  submitted_date?: string;
  mrn_date?: string;
  benefit_type: string;
  state: string;
}

export interface CaseDetails {
  online_hearing_id?: string;
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

export interface AdditionalEvidence {
  description: string;
}

export interface CaseDocument {
  name?: string;
  date?: string;
  url?: string;
}

export interface AVEvidence {
  name?: string;
  url?: string;
  type?: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  mobile?: string;
}

export interface CaseEvent {
  date: string;
  type: string;
  contentKey: string;
  dwpResponseDate?: string;
  dwpDueDate?: string;
  evidenceType?: string;
  evidenceProvidedBy?: string;
  hearingContactDate?: string;
  hearingDateTime?: string;
  venueName?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  googleMapUrl?: string;
  adjournedDate?: string;
  adjournedLetterReceivedByDate?: string;
  decisionLetterReceiveByDate?: string;
}

export interface RpcDetails {
  name: string;
  addressLines: Array<string>;
  city: string;
  postcode: string;
  phoneNumber?: string;
  faxNumber?: string;
}

export interface Appeal {
  caseId?: string;
  caseReference?: string;
  appealNumber?: string;
  status?: string;
  hideHearing?: boolean;
  hearingOutcome?: Array<CaseDocument>;
  audioVideoEvidence?: Array<AVEvidence>;
  benefitType?: string;
  hearingType?: string;
  createdInGapsFrom?: string;
  name?: string;
  surname?: string;
  contact?: Contact;
  latestEvents?: Array<CaseEvent>;
  historicalEvents?: Array<CaseEvent>;
  regionalProcessingCenter?: RpcDetails;
}

export interface Recording {
  fileName?: string;
  fileType?: string;
  documentUrl?: string;
}

export interface HearingRecording {
  hearingId?: string;
  venue?: string;
  hearingDate?: string;
  hearingRecordings?: Array<Recording>;
}

export interface HearingRecordings {
  releasedHearingRecordings?: Array<HearingRecording>;
  outstandingHearingRecordings?: Array<HearingRecording>;
  requestableHearingRecordings?: Array<HearingRecording>;
}

declare module 'express-session' {
  interface SessionData {
    case?: CaseDetails;
    cases?: Array<CaseDetails>;
    additional_evidence?: AdditionalEvidence;
    appeal?: Appeal;
    idamEmail?: string;
    tya?: string;
    hideHearing?: boolean;
    accessToken?: string;
    subscriptions?: Array<Subscription>;
    requestOptions?: string;
    hearingRecordingsResponse?: HearingRecordings;
    serviceToken?: string;
    language?: string;
  }
}
