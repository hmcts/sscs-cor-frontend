const rp = require('request-promise');

const backendApiUrl = require('config').get('api.url');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ccd.ts');
const timeout = require('config').get('apiCallTimeout');

async function createCase(hearingType) {
  const randomNumber = parseInt(Math.random() * 10000000 + '', 10);
  const email = `test${randomNumber}@hmcts.net`;
  const options = {
    url: `${backendApiUrl}/api/case`,
    qs: { email, hearingType },
    json: true,
    timeout
  };

  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error at CCD createCase:', error.error);
  }

  const { id, case_reference, appellant_tya } = body;
  console.log(`Created CCD case for ${email} with ID ${id} and reference ${case_reference} and appellant_tya ${appellant_tya}`);
  return { email, id, case_reference, appellant_tya };
}

export { createCase };
