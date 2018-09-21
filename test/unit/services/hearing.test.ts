import * as Hearing from 'app/server/services/hearing.ts';
import * as moment from 'moment';

const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/hearing.ts', () => {
  const hearingId = '121';
  const path = `/continuous-online-hearings/${hearingId}`;

  const apiResponse = {
    questions: [
      {
        question_id: '001',
        question_header_text: 'How do you interact with people?',
        answer_state: 'draft'
      }
    ]
  };

  describe('Get a hearing', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .reply(OK, apiResponse);
    });
    it('resolves the promise with the response', async () => (
      expect(Hearing.get(hearingId)).to.eventually.eql(apiResponse)
    ));
  });

  describe('Update hearing deadline', () => {
    beforeEach(() => {
      nock(apiUrl)
        .patch(path)
        .reply(OK, apiResponse);
    });
    it('resolves the promise with the response', async () => (
      expect(Hearing.updateDeadline(hearingId)).to.eventually.eql(apiResponse)
    ));
  });  

  describe('rejecting the promises', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .replyWithError(error);
    });

    it('rejects get with the error', () => (
      expect(Hearing.get(hearingId)).to.be.rejectedWith(error)
    ));

    it('rejects updateDeadline with the error', () => (
      expect(Hearing.updateDeadline(hearingId)).to.be.rejectedWith(error)
    ));
  });
});

export {};