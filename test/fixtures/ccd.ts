const rp = require('request-promise');

const backendApiUrl = require('config').get('api.url');

async function createCase() {
  const randomNumber = parseInt(Math.random() * 10000000 + '', 10);
  const email = `test${randomNumber}@hmcts.net`;
  const options = {
    url: `${backendApiUrl}/case`,
    qs: { email },
    json: true
  };
  const body = await rp.post(options);
  const caseId = body.id;
  const caseReference = body.case_reference;
  console.log(`Created CCD case for ${email} with ID ${caseId} and reference ${caseReference}`);
  return { email, caseId, caseReference };
}

export { createCase };
