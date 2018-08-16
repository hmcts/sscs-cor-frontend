/* eslint-disable no-console */
const rp = require('request-promise');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const mockData = require('test/mock/services/question').template;

const cohUrl = require('config').get('cohUrl');

const JURISDICTION = 'SSCS';
const PANEL_NAME = 'John Smith';
const PANEL_IDENTITY_TOKEN = 'string';
const HEARING_STATUS = 'NEW';

const QUESTION_OWNER_REF = 'SSCS-COR';
const QUESTION_ORDINAL = '1';
const QUESTION_ROUND = '1';

const headers = {
  Authorization: '123',
  ServiceAuthorization: '123',
  'Content-Type': 'application/json'
};

const onlineHearingBody = {
  case_id: uuidv4(),
  jurisdiction: JURISDICTION,
  panel: [
    {
      identity_token: PANEL_IDENTITY_TOKEN,
      name: PANEL_NAME
    }
  ],
  start_date: moment().utc().format(),
  state: HEARING_STATUS
};

const questionBody = {
  owner_reference: QUESTION_OWNER_REF,
  question_body_text: mockData.question_body_text,
  question_header_text: mockData.question_header_text,
  question_ordinal: QUESTION_ORDINAL,
  question_round: QUESTION_ROUND
};

async function createOnlineHearing() {
  const options = {
    url: `${cohUrl}/continuous-online-hearings`,
    headers: { ...headers },
    body: onlineHearingBody,
    json: true
  };
  const body = await rp.post(options);
  console.log('Created online hearing with ID', body.online_hearing_id);
  return body.online_hearing_id;
}

async function createQuestion(hearingId) {
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/questions`,
    headers: { ...headers },
    body: questionBody,
    json: true
  };
  const body = await rp.post(options);
  console.log('Created question with ID', body.question_id);
  return body;
}

async function setQuestionRoundToIssued(hearingId) {
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/questionrounds/1`,
    headers: { ...headers },
    body: { state_name: 'question_issue_pending' },
    json: true
  };
  await rp.put(options);
  console.log('Question round issued successfully');
}

module.exports = { createOnlineHearing, createQuestion, setQuestionRoundToIssued };
