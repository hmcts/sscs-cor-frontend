import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

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
}

export class RequestTypeService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getHearingRecording(identifier: string, req: Request) {
    return RequestPromise.request(
      {
        method: 'GET',
        uri: `${this.apiUrl}/api/request/${identifier}/hearingrecording`,
      },
      req
    );
  }

  async submitHearingRecordingRequest(
    identifier: string,
    hearingIds: string[],
    req: Request
  ) {
    return RequestPromise.request(
      {
        method: 'POST',
        uri: `${this.apiUrl}/api/request/${identifier}/recordingrequest`,
        headers: {
          'Content-type': 'application/json',
        },
        formData: {
          hearingIds,
        },
      },
      req
    );
  }
}
