import { AdditionalEvidenceService } from 'app/server/services/additional-evidence';
import * as path from 'path';
import * as fs from 'fs';
const { expect } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR, NO_CONTENT } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

describe('services/additional-evidence', () => {
  let additionalEvidenceService;
  const apiUrl = config.get('api.url');
  const req: any = {};
  before(() => {
    additionalEvidenceService = new AdditionalEvidenceService(apiUrl);
    req.session = {
      accessToken : 'someUserToken',
      serviceToken : 'someServiceToken'
    };
  });

  describe('#saveStatement', () => {
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
        expect(additionalEvidenceService.saveStatement(statementText, req)).to.eventually.eql(apiResponse);
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
        expect(additionalEvidenceService.saveStatement(statementText, req)).to.be.rejectedWith(error)
      ));
    });
  });

});
