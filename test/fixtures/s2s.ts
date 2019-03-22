const config = require('config');
const otp = require('otp');
const rp = require('request-promise');
const microservice = config.get('s2s.microservice');
const s2sSecret = config.get('s2s.secret');
const s2sUrl = config.get('s2s.url');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('question.ts');
const timeout = require('config').get('apiCallTimeout');

interface TokenResponse {
  access_token: string;
}

interface AuthorizeResponse {
  code: string;
}
// todo turn this into an object that can be injected
async function generateToken(): Promise<string> {
  const oneTimePassword = otp({ secret: s2sSecret }).totp();
  const options = {
    headers: {
      'Content-Type' : 'application/json'
    },
    url: `${s2sUrl}/lease`,
    json: true,
    body: {
      microservice,
      oneTimePassword
    },
    timeout
  };
  let body;
  try {
    body = await rp.post(options);
  } catch (error) {
    logger.error('Error generateToken', error);
  }

  return body;
}

export {
  generateToken
};
