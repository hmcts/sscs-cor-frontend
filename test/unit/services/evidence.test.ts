import { EvidenceService } from 'app/server/services/evidence';
import * as path from 'path';
import * as fs from 'fs';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const config = require('config');
const request = require('request-promise');

describe('services/evidence', () => {
  const hearingId = '121';
  const questionId = '62';
  let evidenceService;

  before(() => {
    evidenceService = new EvidenceService('http://sscs-cor-backend.net');
  });

  const apiResponse = {
    document_link: 'http://dm-store-aat.service.core-compute-aat.internal/documents/8f79deb3-5d7a-4e6f-846a-a8131ac6a3bb',
    file_name: 'some_file_name.txt'
  };

  const file = {
    fieldname: 'file-upload-1',
    originalname: 'some_evidence.txt',
    mimetype: 'text/plain',
    buffer: fs.readFileSync(path.join(__dirname, '/../../fixtures/evidence/some_evidence.txt'))
  };

  describe('#upload', () => {
    let rpPostStub: sinon.SinonStub;
    beforeEach(() => {
      rpPostStub = sinon.stub(request, 'post');
    });
    afterEach(() => {
      rpPostStub.restore();
    });

    it('calls out to service', async () => {
      await evidenceService.upload(hearingId, questionId, file);
      expect(rpPostStub).to.have.been.calledOnce.calledWith({
        formData: {
          file: {
            options: { contentType: file.mimetype, filename: file.originalname },
            value: file.buffer
          }
        },
        url: `http://sscs-cor-backend.net/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`
      });
    });

    describe('on success', () => {
      beforeEach(() => {
        rpPostStub.resolves(apiResponse);
      });
      it('resolves with the response body', async () => {
        const body = await evidenceService.upload(hearingId, questionId, file);
        expect(body).to.deep.equal(apiResponse);
      });
    });

    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        rpPostStub.rejects(error);
      });

      it('rejects the promise with the error', () => (
        expect(evidenceService.upload(hearingId, questionId, {})).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#remove', () => {
    let rpDeleteStub: sinon.SinonStub;
    beforeEach(() => {
      rpDeleteStub = sinon.stub(request, 'delete');
    });
    afterEach(() => {
      rpDeleteStub.restore();
    });

    it('calls out to service', async () => {
      await evidenceService.remove(hearingId, questionId, '123');
      expect(rpDeleteStub).to.have.been.calledOnce.calledWith({
        headers: { 'Content-Length': '0' },
        url: `http://sscs-cor-backend.net/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/123`
      });
    });

    describe('on success', () => {
      beforeEach(() => {
        rpDeleteStub.resolves(apiResponse);
      });
      it('resolves', async () => {
        const result = await evidenceService.remove(hearingId, questionId, '123');
        expect(result).to.be.undefined;
      });
    });

    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        rpDeleteStub.rejects(error);
      });

      it('rejects the promise with the error', () => (
        expect(evidenceService.remove(hearingId, questionId, '123')).to.be.rejectedWith(error)
      ));
    });
  });
});
