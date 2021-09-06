import { RequestTypeService } from 'app/server/services/request-type';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import { RequestPromise } from 'app/server/services/request-wrapper';
import { CONST } from '../../../app/constants';
import HTTP_RETRIES = CONST.HTTP_RETRIES;
import RETRY_INTERVAL = CONST.RETRY_INTERVAL;

describe('services/request-type', () => {
  const hearingId = '121';
  const caseId = '62';
  let requestTypeService;
  const req: any = {};
  let rpStub: sinon.SinonStub;
  before(() => {
    requestTypeService = new RequestTypeService('http://sscs-cor-backend.net');
    req.session = {
      accessToken : 'someUserToken',
      serviceToken : 'someServiceToken'
    };
  });

  beforeEach(() => {
    rpStub = sinon.stub(RequestPromise, 'request');
  });

  afterEach(() => {
    rpStub.restore();
  });

  const apiResponse = {
    body: {
      hearingRecordingResponse: {}
    },
    statusCode: 200
  };

  describe('getHearingRecording', () => {
    it('calls out to service', async () => {
      await requestTypeService.getHearingRecording(caseId, req);

      const expectedOptions = {
        method: 'GET',
        retry: HTTP_RETRIES,
        delay: RETRY_INTERVAL,
        uri: `http://sscs-cor-backend.net/api/request/${caseId}/hearingrecording`
      };

      expect(rpStub).to.have.been.calledOnce.calledWith(sinon.match(expectedOptions, req));
    });

    describe('on success', () => {
      beforeEach(() => {
        rpStub.resolves(apiResponse);
      });

      afterEach(() => {
        rpStub.restore();
      });

      it('resolves with the response body', async () => {
        const body = await requestTypeService.getHearingRecording(caseId, req);
        expect(body).to.deep.equal(apiResponse);
      });
    });

    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        rpStub.rejects(error);
      });

      afterEach(() => {
        rpStub.restore();
      });

      it('rejects the promise with the error', () => (
        expect(requestTypeService.getHearingRecording(caseId, req)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('submitHearingRecordingRequest', () => {

    it('calls out to service', async () => {
      await requestTypeService.submitHearingRecordingRequest(caseId, [hearingId], req);

      const expectedOptions = {
        method: 'POST',
        retry: HTTP_RETRIES,
        delay: RETRY_INTERVAL,
        uri: `http://sscs-cor-backend.net/api/request/${caseId}/recordingrequest`,
        headers: { 'Content-type': 'application/json' },
        formData: {
          hearingIds: [hearingId]
        }
      };

      expect(rpStub).to.have.been.calledOnce.calledWith(expectedOptions, req);
    });

    describe('on success', () => {
      beforeEach(() => {
        rpStub.resolves(true);
      });

      afterEach(() => {
        rpStub.restore();
      });

      it('resolves', async () => {
        const result = await requestTypeService.submitHearingRecordingRequest(caseId, [hearingId], req);
        expect(result).to.equal(true);
      });
    });

    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        rpStub.rejects(error);
      });

      afterEach(() => {
        rpStub.restore();
      });

      it('rejects the promise with the error', () => (
        expect(requestTypeService.submitHearingRecordingRequest(caseId, [hearingId], req)).to.be.rejectedWith(error)
      ));
    });
  });
});
