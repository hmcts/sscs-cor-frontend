import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export class RequestTypeService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getHearingRecording(caseId: number, req: Request) {
    return RequestPromise.request(
      {
        method: 'GET',
        uri: `${this.apiUrl}/api/request/${caseId}/hearingrecording`,
      },
      req
    );
  }

  async submitHearingRecordingRequest(
    caseId: number,
    hearingIds: string[],
    req: Request
  ) {
    return RequestPromise.request(
      {
        method: 'POST',
        uri: `${this.apiUrl}/api/request/${caseId}/recordingrequest`,
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
