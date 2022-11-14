import { EvidenceService } from 'app/server/services/evidence';
import * as path from 'path';
import * as fs from 'fs';

import { RequestPromise } from 'app/server/services/request-wrapper';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

describe('services/evidence', function () {
  const hearingId = '121';
  const questionId = '62';
  let evidenceService = null;
  const req = {
    session: {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    },
  };
  let rpStub: sinon.SinonStub = null;
  let apiResponse = null;
  let file = null;

  before(function () {
    evidenceService = new EvidenceService('http://sscs-cor-backend.net');
    apiResponse = {
      body: {
        id: '5425f1eb-92bd-4784-83df-9afa348fd1b3',
        file_name: 'some_file_name.txt',
      },
      statusCode: 200,
    };

    file = {
      fieldname: 'file-upload-1',
      originalname: 'some_evidence.txt',
      mimetype: 'text/plain',
      buffer: fs.readFileSync(
        path.join(__dirname, '/../../fixtures/evidence/evidence.txt')
      ),
    };
  });

  beforeEach(function () {
    rpStub = sinon.stub(RequestPromise, 'request');
  });

  afterEach(function () {
    rpStub.restore();
  });

  describe('#upload', function () {
    it('calls out to service', async function () {
      await evidenceService.upload(hearingId, questionId, file, req);

      const expectedOptions = {
        formData: {
          file: {
            options: {
              contentType: file.mimetype,
              filename: file.originalname,
            },
            value: file.buffer,
          },
        },
        method: 'POST',
        resolveWithFullResponse: true,
        simple: false,
        url: `http://sscs-cor-backend.net/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`,
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
        const body = await evidenceService.upload(
          hearingId,
          questionId,
          file,
          req
        );
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
          evidenceService.upload(hearingId, questionId, {}, req)
        ).to.be.rejectedWith(error);
      });
    });
  });

  describe('#remove', function () {
    it('calls out to service', async function () {
      await evidenceService.remove(hearingId, questionId, '123', req);

      const expectedOptions = {
        method: 'DELETE',
        headers: { 'Content-Length': '0' },
        url: `http://sscs-cor-backend.net/api/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/123`,
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

      it('resolves', async function () {
        const result = await evidenceService.remove(
          hearingId,
          questionId,
          '123',
          req
        );
        expect(result).to.equal(apiResponse);
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
          evidenceService.remove(hearingId, questionId, '123', req)
        ).to.be.rejectedWith(error);
      });
    });
  });
});
