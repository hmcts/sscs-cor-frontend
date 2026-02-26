import { LoggerInstance } from 'winston';
import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import rp from '@cypress/request-promise';
import ibaAppealPayload from './iba_payload.json';

const logger: LoggerInstance = Logger.getLogger('test ccd');

const apiUrl = config.get('tribunals-api.url');
const timeout: number = config.get('apiCallTimeout');

export interface CCDCase {
  case_reference?: string;
  appellant_tya?: string;
  joint_party_tya?: string;
  representative_tya?: string;
  id?: string;
  email?: string;
}

export async function createIBACase(hearingType): Promise<CCDCase> {
  const randomNumber = parseInt(`${Math.random() * 10000000}`, 10);
  const email = `test${randomNumber}@hmcts.net`;

  // Set MRN date to today in required format DD-MM-YYYY
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const mrnDate = `${day}-${month}-${year}`;

  ibaAppealPayload.appellant.contactDetails.emailAddress = email;

  // Inject the date into payload
  ibaAppealPayload.mrn.date = mrnDate;
  const caseCreateOptions = {
    method: 'POST',
    uri: `${apiUrl}/appeals`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: ibaAppealPayload,
    resolveWithFullResponse: true,
    json: true, // Automatically stringifies the body to JSON
  };
  let response = {};
  try {
    response = await rp(caseCreateOptions);
  } catch (error) {
    logger.error('Error at IBA createCase:', error.error);
  }
  // eslint-disable-next-line
  const caseId = response['headers'].location.split('/').pop();
  const getTyaOptions = {
    method: 'GET',
    uri: `${apiUrl}/appeals`,
    headers: {
      'Content-Type': 'application/json',
    },
    qs: {
      caseId,
    },
    resolveWithFullResponse: true,
    json: true,
    timeout: 5000,
  };
  try {
    response = await rp(getTyaOptions);
  } catch (error) {
    logger.error('Error at IBA createCase:', error.error);
  }
  // eslint-disable-next-line
  const id = response['body'].appeal.appealNumber;

  return {
    case_reference: '',
    appellant_tya: id,
    joint_party_tya: '',
    representative_tya: '',
    id: caseId,
    email: ibaAppealPayload.appellant.contactDetails.emailAddress,
  };
}

export async function createCase(hearingType): Promise<CCDCase> {
  const randomNumber = parseInt(`${Math.random() * 10000000}`, 10);
  const email = `test${randomNumber}@hmcts.net`;
  const options = {
    url: `${apiUrl}/api/case`,
    qs: { email, hearingType },
    json: true,
    timeout,
  };
  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error at CCD createCase:', error.error);
  }

  const {
    id,
    case_reference: caseReference,
    appellant_tya: appellantTya,
    joint_party_tya: jointPartyTya,
    representative_tya: representativeTya,
  } = body;
  logger.info(
    `Created CCD case for ${email} with ID ${id} and reference ${caseReference} and appellant_tya ${appellantTya} and jp_tya ${jointPartyTya} and representative_tya ${representativeTya}`
  );
  return {
    email,
    id,
    case_reference: caseReference,
    appellant_tya: appellantTya,
    joint_party_tya: jointPartyTya,
    representative_tya: representativeTya,
  };
}
