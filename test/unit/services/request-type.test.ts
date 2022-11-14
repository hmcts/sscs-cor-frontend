import { RequestTypeService } from 'app/server/services/request-type';

import { RequestPromise } from 'app/server/services/request-wrapper';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

describe('services/request-type', function () {
  const hearingId = '121';
  const caseId = '62';
  let requestTypeService;
  const req: any = {};
  let rpStub: sinon.SinonStub;
  before(function () {
    requestTypeService = new RequestTypeService('http://sscs-cor-backend.net');
    req.session = {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    };
  });

  beforeEach(function () {
    rpStub = sinon.stub(RequestPromise, 'request');
  });

  afterEach(function () {
    rpStub.restore();
  });

  const apiResponse = {
    body: {
      hearingRecordingResponse: {},
    },
    statusCode: 200,
  };

  describe('getHearingRecording', function () {
    it('calls out to service', async function () {
      await requestTypeService.getHearingRecording(caseId, req);

      const expectedOptions = {
        method: 'GET',
        uri: `http://sscs-cor-backend.net/api/request/${caseId}/hearingrecording`,
      };

      expect(rpStub).to.have.been.calledOnce.calledWith(expectedOptions, req);
    });

    describe('on success', function () {
      beforeEach(function () {
        rpStub.resolves(apiResponse);
      });

      afterEach(function () {
        rpStub.restore();
      });

      it('resolves with the response body', async function () {
        const body = await requestTypeService.getHearingRecording(caseId, req);
        expect(body).to.deep.equal(apiResponse);
      });
    });

    describe('on failure', function () {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(function () {
        rpStub.rejects(error);
      });

      afterEach(function () {
        rpStub.restore();
      });

      it('rejects the promise with the error', function () {
        return expect(
          requestTypeService.getHearingRecording(caseId, req)
        ).to.be.rejectedWith(error);
      });
    });
  });

  describe('submitHearingRecordingRequest', function () {
    it('calls out to service', async function () {
      await requestTypeService.submitHearingRecordingRequest(
        caseId,
        [hearingId],
        req
      );

      const expectedOptions = {
        method: 'POST',
        uri: `http://sscs-cor-backend.net/api/request/${caseId}/recordingrequest`,
        headers: { 'Content-type': 'application/json' },
        formData: {
          hearingIds: [hearingId],
        },
      };

      expect(rpStub).to.have.been.calledOnce.calledWith(expectedOptions, req);
    });

    describe('on success', function () {
      beforeEach(function () {
        rpStub.resolves(true);
      });

      afterEach(function () {
        rpStub.restore();
      });

      it('resolves', async function () {
        const result = await requestTypeService.submitHearingRecordingRequest(
          caseId,
          [hearingId],
          req
        );
        expect(result).to.equal(true);
      });
    });

    describe('on failure', function () {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(function () {
        rpStub.rejects(error);
      });

      afterEach(function () {
        rpStub.restore();
      });

      it('rejects the promise with the error', function () {
        return expect(
          requestTypeService.submitHearingRecordingRequest(
            caseId,
            [hearingId],
            req
          )
        ).to.be.rejectedWith(error);
      });
    });
  });
});
