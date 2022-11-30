import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import * as config from 'config';

const rp = require('request-promise');

const logger: LoggerInstance = Logger.getLogger('test sidam');

const sidamApiUrl: string = config.get('idam.api-url');
const testUrl: string = config.get('testUrl');
const timeout: number = config.get('apiCallTimeout');

async function manageRedirectUri(operation) {
  const redirectUri = `${testUrl}/sign-in`;
  if (redirectUri.startsWith('https://pr-')) {
    const options = {
      url: `${sidamApiUrl}/testing-support/services/sscs`,
      json: true,
      body: [
        {
          operation,
          field: 'redirect_uri',
          value: redirectUri,
        },
      ],
      timeout,
    };

    try {
      await rp.patch(options);
    } catch (error) {
      logger.error('Error manageRedirectUri', error);
    }

    if (operation === 'add') {
      logger.info(`Register redirect uri [${redirectUri}]`);
    } else {
      logger.info(`Unregister redirect uri [${redirectUri}]`);
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
      password,
      surname: 'ATestSurname',
      roles: [
        {
          code: 'citizen',
        },
      ],
    },
    insecure: true,
    timeout,
  };

  try {
    await rp.post(options);
    logger.info(
      `Created idam user for ${ccdCase.email} with password ${password}`
    );
    return { email: ccdCase.email, password };
  } catch (error) {
    logger.error('Error createUser', error.message);
  }
}

async function deleteUser(sidamUser) {
  const email = encodeURIComponent(sidamUser.email);
  const options = {
    url: `${sidamApiUrl}/testing-support/accounts/${email}`,
    insecure: true,
    timeout,
  };

  try {
    await rp.delete(options);
  } catch (error) {
    logger.error('Error deleteUser', error);
  }

  logger.info(`Deleted SIDAM user for ${sidamUser.email}`);
}

export { createUser, deleteUser, registerRedirectUri, unregisterRedirectUri };
