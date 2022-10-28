import { RequestPromise } from './request-wrapper';
const config = require('config');
const otp = require('otp');

const microservice = config.get('s2s.microservice');
const s2sSecret = config.get('s2s.secret');
const s2sUrl = config.get('s2s.url');

async function generateToken(): Promise<string> {
  const oneTimePassword = otp({ secret: s2sSecret }).totp();
  return await RequestPromise.request({
    method: 'POST',
    url: `${s2sUrl}/lease`,
    body: {
      microservice,
      oneTimePassword,
    },
  });
}

export { generateToken };
