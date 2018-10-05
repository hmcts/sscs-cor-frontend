import * as request from 'superagent';
import * as AppInsights from "../app-insights";
require('superagent-proxy')(request);
const config = require('config');
import * as Paths from 'app/server/paths';

const appPort = config.get('node.port');
const apiUrl = config.get('idam.api-url');
const appSecret = config.get('idam.client.secret');
const httpProxy = config.get('httpProxy');

interface TokenResponse {
  access_token: string
}

interface UserDetails {
  email: string
}

async function getToken(code: string, protocol: string, host: string): Promise<TokenResponse> {
  try {
    const redirectUri: string = getRedirectUrl(protocol, host);

    const response: request.Response = await makeProxiedRequest(request.post(`${apiUrl}/oauth2/token`) as ProxyRequest)
      .auth('sscs-cor', appSecret)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .type('form')
      .send({"grant_type": 'authorization_code'})
      .send({"code": code})
      .send({"redirect_uri": redirectUri});

    return Promise.resolve(response.body);
  } catch (error) {
    AppInsights.trackException(error);
    return Promise.reject(error);
  }
}

async function getUserDetails(token: string): Promise<UserDetails> {
  try {
    const response: request.Response = await makeProxiedRequest(request.get(`${apiUrl}/details`) as ProxyRequest)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token);

    return Promise.resolve(response.body);
  } catch (error) {
    AppInsights.trackException(error);
    return Promise.reject(error);
  }
}

interface ProxyRequest extends request.SuperAgentRequest{
  proxy: (string) => ProxyRequest
}

function makeProxiedRequest(request: ProxyRequest): request.Request {
  return (httpProxy) ? request.proxy(httpProxy) : request;
}

function getRedirectUrl(protocol: string, host: string): string {
  const portString = (host == 'localhost') ? ':' + appPort : '';
  return protocol + "://" + host + portString + Paths.login;
}

export {
  getToken,
  getRedirectUrl,
  getUserDetails,
  TokenResponse,
  UserDetails
}