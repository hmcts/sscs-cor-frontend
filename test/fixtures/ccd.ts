const rp = require('request-promise');

const backendApiUrl = require('config').get('api.url');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ccd.ts');
const timeout = 40 * 1000;

async function createCase() {
  const randomNumber = parseInt(Math.random() * 10000000 + '', 10);
  const email = `test${randomNumber}@hmcts.net`;
  const options = {
    url: `${backendApiUrl}/case`,
    qs: { email },
    json: true,
    timeout
  };

  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error createCase', error);
  }

  const caseId = body.id;
  const caseReference = body.case_reference;
  console.log(`Created CCD case for ${email} with ID ${caseId} and reference ${caseReference}`);
  return { email, caseId, caseReference };
}

export { createCase };
