/* eslint-disable no-console */
const rp = require('request-promise');
const faker = require('faker');

const backendApiUrl = require('config').get('api.url');

async function createCase() {
  const email = faker.internet.email();
  const options = {
    url: `${backendApiUrl}/case`,
    body: { email },
    json: true
  };
  const body = await rp.post(options);
  const caseId = body.id;
  const caseReference = body.case_reference;
  console.log(`Created CCD case for ${email} with ID ${caseId}`);
  return { email, caseId, caseReference };
}

module.exports = { createCase };
