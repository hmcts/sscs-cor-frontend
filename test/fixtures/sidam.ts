/* eslint-disable no-console */
const rp = require('request-promise');

const sidamApiUrl = require('config').get('idam.api-url');

async function createUser(ccdCase) {
// eslint-disable-next-line no-magic-numbers
  let password = 'Apassword123';
  const options = {
    url: `${sidamApiUrl}/testing-support/accounts`,
    json: true,
    body: {
      email: ccdCase.email,
      forename: 'ATestForename',
      password: password,
      surname: 'ATestSurname'
    }
  };
  await rp.post(options);
  console.log(`Created idam user for ${ccdCase.email} with password ${password}`);
  return { email: ccdCase.email, password };
}

export {
  createUser
};
