import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import { CONST } from '../../constants';
import HTTP_RETRIES = CONST.HTTP_RETRIES;

export interface HearingRecordingResponse {
  releasedHearingRecordings: CitizenHearingRecording[];
  outstandingHearingRecordings: CitizenHearingRecording[];
  requestableHearingRecordings: CitizenHearingRecording[];
}

export interface CitizenHearingRecording {
  hearingId: string;
  venue: string;
  hearingDate: string;
  hearingRecordings: HearingRecording[];
}

export interface HearingRecording {
  fileName: string;
  fileType: string;
  documentUrl: string;
  documentBinaryUrl: string;
}

export class RequestTypeService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getHearingRecording(identifier: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      retry: 3,
      uri: `${this.apiUrl}/api/request/${identifier}/hearingrecording`
    }, req);
  }

  async submitHearingRecordingRequest(identifier: string, hearingIds: string[], req: Request) {
    return RequestPromise.request({
      method: 'POST',
      retry: HTTP_RETRIES,
      uri: `${this.apiUrl}/api/request/${identifier}/recordingrequest`,
      headers: {
        'Content-type': 'application/json'
      },
      formData: {
        hearingIds: hearingIds
      }
    }, req);
  }
}
