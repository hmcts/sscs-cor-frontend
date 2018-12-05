const config = require('config');
const otp = require('otp');
const rp = require('request-promise');

const microservice = config.get('s2s.microservice');
const s2sSecret = config.get('s2s.secret');
const s2sUrl = config.get('s2s.url');
const s2sOauthUrl = config.get('s2s.oauth2.url');
const systemUpdateUser = config.get('s2s.oauth2.user');
const systemUpdatePassword = config.get('s2s.oauth2.password');
const clientSecret = config.get('s2s.oauth2.client.secret');

interface TokenResponse {
  access_token: string;
}

interface AuthorizeResponse {
  code: string;
}

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
    }
  };

  const body = await rp.post(options);
  return body;
}

async function generateOauth2(): Promise<string> {
  const authorizeToken: AuthorizeResponse = await authorize();
  const tokenResponse: TokenResponse = await getToken(authorizeToken.code);
  return tokenResponse.access_token;
}

async function authorize(): Promise<AuthorizeResponse> {
  const body = await rp.post({
    uri: `${s2sOauthUrl}/oauth2/authorize`,
    json: true,
    headers: {
      'Accept': 'application/json'
    },
    auth: {
      user: systemUpdateUser,
      pass: systemUpdatePassword
    },
    form: {
      response_type: 'code',
      client_id: microservice,
      redirect_uri: 'https://evidence-sharing-preprod.sscs.reform.hmcts.net'
    }
  });

  return Promise.resolve(body);
}

async function getToken(code: string): Promise<TokenResponse> {
  const body = await rp.post({
    uri: `${s2sOauthUrl}/oauth2/token`,
    json: true,
    form: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://evidence-sharing-preprod.sscs.reform.hmcts.net',
      client_id: microservice,
      client_secret: clientSecret
    }
  });

  return Promise.resolve(body);
}

export {
  generateToken,
  generateOauth2
};
