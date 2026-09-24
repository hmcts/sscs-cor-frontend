import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import rp from '@cypress/request-promise';

const microservice = config.get('s2s.microservice');
const s2sUrl: string = config.get('s2s.url');
const s2sOauthUrl: string = config.get('s2s.oauth2.url');
const systemUpdateUser: string = config.get('s2s.oauth2.user');
const systemUpdatePassword: string = config.get('s2s.oauth2.password');
const clientSecret: string = config.get('s2s.oauth2.client.secret');
const redirectUrl = config.get('s2s.oauth2.redirectUrl');

const logger = Logger.getLogger('s2s.ts');
const timeout: number = config.get('apiCallTimeout');

interface TokenResponse {
  access_token: string;
  id_token?: string;
}

async function generateToken(): Promise<string> {
  try {
    return await rp.post({
      url: `${s2sUrl}/testing-support/lease`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        microservice,
      },
      timeout,
    });
  } catch (error) {
    logger.error(`Error generateToken: ${(error as Error).message}`);
    throw error;
  }
}

async function generateOauth2(): Promise<string> {
  const tokenResponse = await getSystemUserToken();
  return tokenResponse.access_token;
}

async function getSystemUserToken(): Promise<TokenResponse> {
  let response;
  try {
    response = await rp.post({
      uri: `${s2sOauthUrl}/o/token`,
      json: true,
      resolveWithFullResponse: true,
      headers: {
        Accept: 'application/json',
      },
      form: {
        grant_type: 'password',
        username: systemUpdateUser,
        password: systemUpdatePassword,
        client_id: microservice,
        client_secret: clientSecret,
        scope: 'openid profile roles',
        redirect_uri: redirectUrl,
      },
      timeout,
    });
  } catch (error) {
    const err = error as {
      statusCode?: number;
      error?: unknown;
      message: string;
    };
    logger.error(
      `Error getSystemUserToken: status=${err.statusCode} body=${JSON.stringify(
        err.error
      )}`
    );
    throw error;
  }

  const { accessToken, idToken, ...safe } = response.body;
  logger.info(
    `getSystemUserToken succeeded: status=${response.statusCode} ` +
      `response=${JSON.stringify({
        ...safe,
        access_token: accessToken ? '[***]' : undefined,
      })}`
  );

  return response.body;
}

export { generateToken, generateOauth2 };
