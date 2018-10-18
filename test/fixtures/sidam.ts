/* eslint-disable no-console */
const rp = require('request-promise');
const querystring = require('querystring');

const sidamApiUrl = require('config').get('idam.api-url');
const testUrl = require('config').get('testUrl');

async function manageRedirectUri(operation) {
// eslint-disable-next-line no-magic-numbers
  const redirectUri = `${testUrl}/sign-in`;
  if (redirectUri.startsWith('https://pr-')) {
    const options = {
      url: `${sidamApiUrl}/testing-support/service/sscs-cor`,
      json: true,
      body: {
        operation: operation,
        field: 'redirect_uri',
        value: redirectUri
      }
    };
    await rp.patch(options);
    if (operation === 'add') {
      console.log(`Register redirect uri [${redirectUri}]`);
    } else {
      console.log(`Unregister redirect uri [${redirectUri}]`);
    }
  }
}

async function registerRedirectUri() {
  await manageRedirectUri('add');
}

async function unregisterRedirectUri() {
  await manageRedirectUri('remove');
}

async function createUser(ccdCase) {
// eslint-disable-next-line no-magic-numbers
  const password = 'Apassword123';
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
  deleteUser,
  registerRedirectUri,
  unregisterRedirectUri
};
