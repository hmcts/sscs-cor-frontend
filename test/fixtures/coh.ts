const rp = require('request-promise');
const moment = require('moment');
const mockData = require('test/mock/cor-backend/services/question').template;
import { generateToken, generateOauth2 } from './s2s';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('coh.ts');
const cohUrl = require('config').get('cohUrl');

const JURISDICTION = 'SSCS';
const PANEL_NAME = 'John Smith';
const PANEL_IDENTITY_TOKEN = 'string';
const HEARING_STATUS = 'continuous_online_hearing_started';

const QUESTION_OWNER_REF = 'SSCS-COR';
const QUESTION_ROUND = '1';

const timeout = require('config').get('apiCallTimeOut');
async function getHeaders() {
  const token = await generateToken();
  const oauthToken: string = await generateOauth2();

  return {
    Authorization: `Bearer ${oauthToken}`,
    ServiceAuthorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

const onlineHearingBody = caseId => {
  return {
    case_id: caseId,
    jurisdiction: JURISDICTION,
    panel: [
      {
        identity_token: PANEL_IDENTITY_TOKEN,
        name: PANEL_NAME
      }
    ],
    start_date: moment.utc().format(),
    state: HEARING_STATUS
  };
};

const questionBody = (mockQuestionRef, ordinal) => {
  return {
    owner_reference: QUESTION_OWNER_REF,
    question_body_text: mockData.question_body_text({ questionId: mockQuestionRef }),
    question_header_text: mockData.question_header_text({ questionId: mockQuestionRef }),
    question_ordinal: ordinal,
    question_round: QUESTION_ROUND
  };
};

const decisionText = '{\"decisions_SSCS_benefit_{case_id}\":{\"preliminaryView\":\"yes\",\"visitedPages\":{\"create\":true,\"preliminary-advanced\":true,\"set-award-dates\":true,\"scores\":true,\"budgeting-decisions\":true,\"planning-journeys\":true},\"forDailyLiving\":\"noAward\",\"forMobility\":\"enhancedRate\",\"compareToDWPAward\":\"Higher\",\"awardEndDateDay\":\"11\",\"awardEndDateMonth\":\"12\",\"awardEndDateYear\":\"2018\",\"endDateRadio\":\"indefinite\",\"preparingFood\":false,\"takingNutrition\":false,\"managingTherapy\":false,\"washingBathing\":false,\"managingToilet\":false,\"dressingUndressing\":false,\"communicatingVerbally\":false,\"readingAndUnderstanding\":false,\"engagingWithOtherPeople\":false,\"makingBudgetingDecisions\":true,\"planningFollowingJourneys\":true,\"movingAround\":false,\"dailyLivingMakingBudgetDecisions\":\"6\",\"MobilityPlanningJourneys\":\"12\",\"reasonsTribunalView\":\"There was a reason!\",\"awardStartDateDay\":\"1\",\"awardStartDateMonth\":\"4\",\"awardStartDateYear\":\"2017\"}}';

async function createOnlineHearing(caseId) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings`,
    headers,
    body: onlineHearingBody(caseId),
    json: true,
    timeout
  };

  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error createOnlineHearing', error);
  }

  console.log('Created online hearing with ID', body.online_hearing_id);
  return body.online_hearing_id;
}

async function createQuestion(hearingId, mockQuestionRef, ordinal) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/questions`,
    headers,
    body: questionBody(mockQuestionRef, ordinal),
    json: true,
    timeout
  };
  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error Created question with ID', error);
  }
  console.log('Created question with ID', body.question_id);
  return body;
}

async function createQuestions(hearingId) {
  const questionList = [];
  questionList.push(await createQuestion(hearingId, '001', 1));
  questionList.push(await createQuestion(hearingId, '002', 2));
  questionList.push(await createQuestion(hearingId, '003', 3));
  return questionList;
}

async function setQuestionRoundToIssued(hearingId) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/questionrounds/1`,
    headers,
    body: { state_name: 'question_issue_pending' },
    json: true,
    timeout
  };

  try {
    await rp.put(options);
  } catch (error) {
    logger.error('Error setQuestionRoundToIssued',error);
  }
  console.log('Question round issued, status pending');
}

async function getQuestionRound(hearingId, roundNum) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/questionrounds/${roundNum}`,
    headers,
    json: true,
    timeout
  };
  let body;
  try {
    body = await rp.get(options);
  } catch (error) {
    logger.error('Error getQuestionRound',error);
  }
  return body;
}

async function getDecision(hearingId) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/decisions`,
    headers,
    json: true,
    timeout
  };
  let body;
  try {
    body = await rp.get(options);
  } catch (error) {
    logger.error('Error getDecision' , error);
  }
  return body;
}

function decisionBody(caseId) {
  return {
    decision_award: 'appeal-upheld',
    decision_header: 'appeal-upheld',
    decision_reason: 'This is the decision.',
    decision_text: decisionText.replace('{case_id}', caseId)
  };
}

async function createDecision(hearingId, caseId) {
  const headers = await getHeaders();
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/decisions`,
    headers,
    body: decisionBody(caseId),
    json: true,
    timeout
  };
  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error Created decision with ID',error);
  }
  console.log('Created decision with ID', body.decision_id);
  return body;
}

async function issueDecision(hearingId, caseId) {
  const headers = await getHeaders();
  const body = { ...decisionBody(caseId), decision_state: 'decision_issue_pending' };
  const options = {
    url: `${cohUrl}/continuous-online-hearings/${hearingId}/decisions`,
    headers,
    body,
    json: true,
    timeout
  };

  try {
    await rp.put(options);
  } catch (error) {
    logger.error('Error Decision issued, status pending',error);
  }
  console.log('Decision issued, status pending');
}

export {
  createOnlineHearing,
  createQuestions,
  setQuestionRoundToIssued,
  getQuestionRound,
  getDecision,
  createDecision,
  issueDecision,
  getHeaders
};
