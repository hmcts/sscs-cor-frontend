const { expect, sinon } = require('test/chai-sinon');
const question = require('app/controllers/question');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('question.js', () => {
  const req = sinon.stub();
  const res = sinon.stub();
  const next = sinon.stub();

  const apiResponse = nock

  it('should call render with the question header', () => {
      nock(apiUrl)
          .get(`/continuous-online-hearings/${hearingId}/questions/${questionId}`)
          .reply(HttpStatus.OK, { appealId });
    question(req, res, next)
      .then(response => {

      });
  });
});
