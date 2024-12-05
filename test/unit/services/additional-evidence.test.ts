import * as path from 'path';
import * as fs from 'fs';

import { AdditionalEvidenceService } from 'app/server/services/additional-evidence';
import { RequestPromise } from 'app/server/services/request-wrapper';
import { expect, sinon } from 'test/chai-sinon';
import config from 'config';

const retry: number = config.get('tribunals-api.retries');
const delay: number = config.get('tribunals-api.delay');

describe('services/additional-evidence', function () {
  let rpStub: sinon.SinonStub = null;
  let apiUrl: string = null;
  let file: Partial<Express.Multer.File> = null;
  let additionalEvidenceService: AdditionalEvidenceService = null;
  const req: any = {
    session: {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
      tya: 'wqiuvokQlD',
      idamEmail: 'appellant@email.com',
    },
  };
  const hearingId = 'hearingId';
  const evidenceId = 'evidenceId';

  before(function () {
    apiUrl = config.get('tribunals-api.url');
    file = {
      fieldname: 'file-upload-1',
      originalname: 'some_evidence.txt',
      mimetype: 'text/plain',
      buffer: fs.readFileSync(
        path.join(__dirname, '/../../fixtures/evidence/evidence.txt')
      ),
    };
    additionalEvidenceService = new AdditionalEvidenceService(apiUrl);
  });

  beforeEach(function () {
    rpStub = sinon.stub(RequestPromise, 'request');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should save Statement', async function () {
    const expectedRequestOptions = {
      body: {
        body: 'text',
        tya: 'wqiuvokQlD',
      },
      method: 'POST',
      retry,
      delay,
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/statement`,
    };

    await additionalEvidenceService.saveStatement(hearingId, 'text', req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should uploadEvidence', async function () {
    const expectedRequestOptions = {
      formData: {
        file: {
          value: file.buffer,
          options: {
            filename: file.originalname,
            contentType: file.mimetype,
          },
        },
      },
      simple: false,
      resolveWithFullResponse: true,
      method: 'PUT',
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/evidence`,
    };

    await additionalEvidenceService.uploadEvidence(
      hearingId,
      file as Express.Multer.File,
      req
    );
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should removeEvidence', async function () {
    const expectedRequestOptions = {
      method: 'DELETE',
      headers: { 'Content-Length': '0' },
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/evidence/${evidenceId}`,
    };

    await additionalEvidenceService.removeEvidence(hearingId, evidenceId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getEvidences', async function () {
    const expectedRequestOptions = {
      method: 'GET',
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/evidence`,
    };

    await additionalEvidenceService.getEvidences(hearingId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getCoversheet', async function () {
    const expectedRequestOptions = {
      method: 'GET',
      retry,
      delay,
      encoding: 'binary',
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/evidence/coversheet`,
      headers: {
        'Content-type': 'application/pdf',
      },
    };

    await additionalEvidenceService.getCoversheet(hearingId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should submitEvidences', async function () {
    const description = 'An evidence description';
    const expectedRequestOptions = {
      method: 'POST',
      retry,
      delay,
      body: {
        body: description,
        idamEmail: 'appellant@email.com',
      },
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/evidence`,
      headers: {
        'Content-type': 'application/json',
      },
    };

    await additionalEvidenceService.submitEvidences(
      hearingId,
      description,
      req
    );
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should submitSingleEvidences', async function () {
    const description = 'An evidence description';
    const expectedRequestOptions = {
      method: 'POST',
      retry,
      delay,
      formData: {
        body: description,
        idamEmail: 'appellant@email.com',
        file: {
          value: file.buffer,
          options: {
            filename: file.originalname,
            contentType: file.mimetype,
          },
        },
      },
      uri: `${apiUrl}/api/continuous-online-hearings/${hearingId}/singleevidence`,
      headers: {
        'Content-type': 'application/json',
      },
    };

    await additionalEvidenceService.submitSingleEvidences(
      hearingId,
      description,
      file as Express.Multer.File,
      req
    );
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });
});
