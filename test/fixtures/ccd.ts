import { LoggerInstance } from 'winston';
import * as config from 'config';
import { Logger } from '@hmcts/nodejs-logging';

const rp = require('request-promise');

const logger: LoggerInstance = Logger.getLogger('test ccd');

const apiUrl = config.get('api.url');
const timeout: number = config.get('apiCallTimeout');

async function createCase(hearingType) {
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

export { createCase };
