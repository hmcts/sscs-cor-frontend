import { Request } from 'express';
import { RequestPromise } from './request-wrapper';
import config from 'config';

const apiUrl: string = config.get('tribunals-api.url');

export async function getHearingRecording(
  caseId: number,
  req: Request
): Promise<unknown> {
  return RequestPromise.request(
    {
      method: 'GET',
      uri: `${apiUrl}/api/request/${caseId}/hearingrecording`,
    },
    req
  );
}

export async function submitHearingRecordingRequest(
  caseId: number,
  hearingIds: string[],
  req: Request
) {
  return RequestPromise.request(
    {
      method: 'POST',
      uri: `${apiUrl}/api/request/${caseId}/recordingrequest`,
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
