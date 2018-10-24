import { uploadEvidence } from 'app/server/services/evidenceUpload';
import * as path from 'path';
import * as fs from 'fs';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const config = require('config');
const request = require('request-promise');

describe('services/uploadEvidence', () => {
  const hearingId = '121';
  const questionId = '62';

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

  describe('#uploadEvidence', () => {
    let rpPostStub: sinon.SinonStub;
    beforeEach(() => {
      rpPostStub = sinon.stub(request, 'post');
    });
    afterEach(() => {
      rpPostStub.restore();
    });

    describe('on success', () => {
      beforeEach(() => {
        rpPostStub.resolves(apiResponse);
      });
      it('resolves with the response body', async () => {
        const body = await uploadEvidence(hearingId, questionId, file);
        expect(body).to.deep.equal(apiResponse);
      });
    });

    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        rpPostStub.rejects(error);
      });

      it('rejects the promise with the error', () => (
        expect(uploadEvidence(hearingId, questionId, {})).to.be.rejectedWith(error)
      ));
    });
  });
});

export {};
