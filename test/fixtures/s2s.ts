const config = require('config');
const otp = require('otp');
const rp = require('request-promise');

const microservice = config.get('s2s.microservice');
const s2sSecret = config.get('s2s.secret');
const s2sUrl = config.get('s2s.url');

async function generateToken() {
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
    }
  };

  const body = await rp.post(options);
  return body;
}

export {
  generateToken
};
