import { AdditionalEvidenceService, EvidenceDescriptor } from 'app/server/services/additional-evidence';
import * as path from 'path';
import * as fs from 'fs';
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR, OK, NO_CONTENT } = require('http-status-codes');
const request = require('request-promise');
const nock = require('nock');
const config = require('config');
const timeout = require('config').get('apiCallTimeout');

describe('services/additional-evidence', () => {
  let additionalEvidenceService;
  const apiUrl = config.get('api.url');
  before(() => {
    additionalEvidenceService = new AdditionalEvidenceService(apiUrl);
  });

  describe('#saveStatement', () => {
    let rpPostStub: sinon.SinonStub;
    let statementText = 'This is my statement';

    const apiResponse = {
      success: true
    };

    describe('resolving the save statement promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .put(path, {
            statementText
          })
          .reply(NO_CONTENT, apiResponse);
      });

      it('resolves the promise with the response', () => {
        expect(additionalEvidenceService.saveStatement(statementText)).to.eventually.eql(apiResponse);
      });
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .put(path, {
            statementText
          })
          .replyWithError(error);
      });

      it('rejects the save statement promise with the error', () => (
        expect(additionalEvidenceService.saveStatement(statementText)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#uploadEvidence', () => {
    let sandbox: sinon.SinonSandbox;
    const file = {
      fieldname: 'file-upload-1',
      originalname: 'evidence.txt',
      mimetype: 'text/plain',
      buffer: fs.readFileSync(path.join(__dirname, '/../../fixtures/evidence/evidence.txt'))
    };
    const hearingId: string = 'hearingId';
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call upload service and resolve', async () => {
      const apiResponse = { statusCode: 200 };
      const requestStub = sandbox.stub(request, 'put').resolves(apiResponse);
      const response = await additionalEvidenceService.uploadEvidence(hearingId, file);

      expect(requestStub).to.have.been.calledOnce.calledWith({
        url: `${apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        simple: false,
        resolveWithFullResponse: true,
        formData: {
          file: {
            value: file.buffer,
            options: { filename: file.originalname, contentType: file.mimetype }
          }
        }
      });

      expect(apiResponse).to.deep.equal(response);
    });

    it('should catch error and reject with error', async () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      sandbox.stub(request, 'post').rejects(error);

      expect(additionalEvidenceService.uploadEvidence(hearingId, file)).to.be.rejectedWith(error);
    });
  });

  describe('#removeEvidence', () => {
    const hearingId: string = 'hearingId';
    const evidenceId: string = 'the-file';
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call remove evidence service and resolve', async () => {
      const requestStub = sandbox.stub(request, 'delete').resolves();
      const response = await additionalEvidenceService.removeEvidence(hearingId, evidenceId);

      expect(requestStub).to.have.been.calledOnce.calledWith({
        url: `${apiUrl}/continuous-online-hearings/${hearingId}/evidence/${evidenceId}`,
        headers: { 'Content-Length': '0' }
      });
      expect(response).to.deep.equal();
    });

    it('should catch error and reject with error', async () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      sandbox.stub(request, 'delete').rejects(error);

      expect(additionalEvidenceService.removeEvidence(hearingId, evidenceId)).to.be.rejectedWith(error);
    });
  });

  describe('#getEvidences', () => {
    const hearingId: string = 'hearingId';
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call getEvidences service and resolve', async () => {
      const evidences: EvidenceDescriptor[] = [{
        created_date: 'date',
        file_name: 'filename',
        id: 'id'
      }];
      const requestStub = sandbox.stub(request, 'get').resolves(evidences);
      const response = await additionalEvidenceService.getEvidences(hearingId);

      expect(requestStub).to.have.been.calledOnce.calledWith({
        url: `${apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        json: true,
        timeout
      });
      expect(response).to.deep.equal(evidences);
    });

    it('should catch error and reject with error', async () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      sandbox.stub(request, 'get').rejects(error);

      expect(additionalEvidenceService.getEvidences(hearingId)).to.be.rejectedWith(error);
    });
  });

  describe('#submitEvidences', () => {
    const hearingId: string = 'hearingId';
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should call submitEvidences endpoint and resolve', () => {
      const requestStub = sandbox.stub(request, 'post').resolves();
      additionalEvidenceService.submitEvidences(hearingId);

      expect(requestStub).to.have.been.calledOnce.calledWith({
        url: `${apiUrl}/continuous-online-hearings/${hearingId}/evidence`,
        headers: { 'Content-Length': '0' },
        json: true,
        timeout
      });
    });
  });
});
