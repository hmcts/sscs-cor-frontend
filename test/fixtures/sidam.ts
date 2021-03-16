const rp = require('request-promise');
const querystring = require('querystring');

const sidamApiUrl = require('config').get('idam.api-url');
const testUrl = require('config').get('testUrl');

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sidam.ts');
const timeout = require('config').get('apiCallTimeout');

async function manageRedirectUri(operation) {
  const redirectUri = `${testUrl}/sign-in`;
  if (redirectUri.startsWith('https://pr-')) {
    const options = {
      url: `${sidamApiUrl}/testing-support/services/sscs`,
      json: true,
      body: [{
        operation: operation,
        field: 'redirect_uri',
        value: redirectUri
      }],
      timeout
    };

    try {
      await rp.patch(options);
    } catch (error) {
      logger.error('Error manageRedirectUri', error);
    }

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
  logger.info(`Creating user [${ccdCase.email}] on [${sidamApiUrl}]`);
  const password = 'Apassword123';
  const options = {
    url: `${sidamApiUrl}/testing-support/accounts`,
    json: true,
    body: {
      email: ccdCase.email,
      forename: 'ATestForename',
      password: password,
      surname: 'ATestSurname',
      roles: [
        {
          code: 'citizen'
        }
      ]
    },
    insecure: true,
    timeout
  };

  try {
    await rp.post(options);
    console.log(`Created idam user for ${ccdCase.email} with password ${password}`);
    return { email: ccdCase.email, password };
  } catch (error) {
    logger.error('Error createUser', error.message);
  }
}

async function deleteUser(sidamUser) {
  const value = sidamUser.email;
  console.log('email value is..', value);
  console.log('email querystring string value is..', querystring.stringify(value));
  console.log('email querystring string2 value is..',querystring.stringify(sidamUser.email));
  const email = querystring.stringify(sidamUser.email);
  console.log('sidam user is...', sidamUser);
  console.log('url is..', `${sidamApiUrl}/testing-support/accounts/${email}`);
  const options = {
    url: `${sidamApiUrl}/testing-support/accounts/${email}`,
    insecure: true,
    timeout
  };

  try {
    await rp.delete(options);
  } catch (error) {
    logger.error('Error deleteUser', error);
  }

  console.log(`Deleted SIDAM user for ${sidamUser.email}`);
}

export {
  createUser,
  deleteUser,
  registerRedirectUri,
  unregisterRedirectUri
};
