import { EvidenceService } from 'app/server/services/evidence';
import * as path from 'path';
import * as fs from 'fs';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import { RequestPromise } from 'app/server/services/request-wrapper';
import { CONST } from '../../../app/constants';
import HTTP_RETRIES = CONST.HTTP_RETRIES;
import RETRY_INTERVAL = CONST.RETRY_INTERVAL;

describe('services/evidence', () => {
  const hearingId = '121';
  const questionId = '62';
  let evidenceService;
  const req: any = {};
  let rpStub: sinon.SinonStub;
  before(() => {
    evidenceService = new EvidenceService('http://sscs-cor-backend.net');
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
      id: '5425f1eb-92bd-4784-83df-9afa348fd1b3',
      file_name: 'some_file_name.txt'
    },
    statusCode: 200
  };

  const file = {
    fieldname: 'file-upload-1',
    originalname: 'some_evidence.txt',
    mimetype: 'text/plain',
    buffer: fs.readFileSync(path.join(__dirname, '/../../fixtures/evidence/evidence.txt'))
  };

  describe('#upload', () => {
    it('calls out to service', async () => {
      await evidenceService.upload(hearingId, questionId, file, req);

      const expectedOptions = {
        formData: {
          file: {
            options: { contentType: file.mimetype, filename: file.originalname },
            value: file.buffer
          }
        },
        method: 'POST',
        retry: HTTP_RETRIES,
        resolveWithFullResponse: true,
        simple: false,
        url: `http://sscs-cor-backend.net/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`
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
        const body = await evidenceService.upload(hearingId, questionId, file, req);
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
        expect(evidenceService.upload(hearingId, questionId, {}, req)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#remove', () => {

    it('calls out to service', async () => {
      await evidenceService.remove(hearingId, questionId, '123', req);

      const expectedOptions = {
        method: 'DELETE',
        retry: HTTP_RETRIES,
        delay: RETRY_INTERVAL,
        headers: { 'Content-Length': '0' },
        url: `http://sscs-cor-backend.net/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/123`
      };

      expect(rpStub).to.have.been.calledOnce.calledWith(expectedOptions, req);
    });

    describe('on success', () => {
      beforeEach(() => {
        rpStub.resolves(apiResponse);
      });

      afterEach(() => {
        rpStub.restore();
      });

      it('resolves', async () => {
        const result = await evidenceService.remove(hearingId, questionId, '123', req);
        expect(result).to.equal(apiResponse);
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
        expect(evidenceService.remove(hearingId, questionId, '123', req)).to.be.rejectedWith(error)
      ));
    });
  });
});
