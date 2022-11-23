import { RequestPromise } from 'app/server/services/request-wrapper';
import {
  getHearingRecording,
  submitHearingRecordingRequest,
} from '../../../app/server/services/request-type';
import * as config from 'config';
import { SinonStub } from 'sinon';

const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

describe('services/request-type', function () {
  const hearingId = '121';
  const caseId = 62;
  const req: any = {};
  let rpStub: SinonStub = null;
  let tribunalsApiUrl: string = null;
  before(function () {
    req.session = {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    };
    tribunalsApiUrl = config.get('tribunals.api-url');
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
      await getHearingRecording(caseId, req);

      const expectedOptions = {
        method: 'GET',
        uri: `${tribunalsApiUrl}/api/request/${caseId}/hearingrecording`,
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
        const body = await getHearingRecording(caseId, req);
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
        return expect(getHearingRecording(caseId, req)).to.be.rejectedWith(
          error
        );
      });
    });
  });

  describe('submitHearingRecordingRequest', function () {
    it('calls out to service', async function () {
      await submitHearingRecordingRequest(caseId, [hearingId], req);

      const expectedOptions = {
        method: 'POST',
        uri: `${tribunalsApiUrl}/api/request/${caseId}/recordingrequest`,
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
        const result = await submitHearingRecordingRequest(
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
          submitHearingRecordingRequest(caseId, [hearingId], req)
        ).to.be.rejectedWith(error);
      });
    });
  });
});
