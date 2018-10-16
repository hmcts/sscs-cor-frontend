/* eslint-disable no-console */
const rp = require('request-promise');
const querystring = require('querystring');

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

async function deleteUser(sidamUser) {
// eslint-disable-next-line no-magic-numbers
  const email = querystring.stringify(sidamUser.email);
  const options = {
    url: `${sidamApiUrl}/testing-support/accounts/${email}`
  };
  await rp.delete(options);
  console.log(`Deleted SIDAM user for ${sidamUser.email}`);
}

export {
  createUser,
  deleteUser
};
