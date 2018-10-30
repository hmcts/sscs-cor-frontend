import * as request from 'superagent';
import * as AppInsights from '../app-insights';
require('superagent-proxy')(request);
import * as Paths from '../paths';

export interface TokenResponse {
  access_token: string;
}

export interface UserDetails {
  email: string;
}

interface ProxyRequest extends request.SuperAgentRequest {
  proxy: (proxy: string) => ProxyRequest;
}

export class IdamService {
  private apiUrl: string;
  private appPort: string;
  private appSecret: string;
  private httpProxy: string;

  constructor(apiUrl: string, appPort: string, appSecret: string, httpProxy: string) {
    this.apiUrl = apiUrl;
    this.appPort = appPort;
    this.appSecret = appSecret;
    this.httpProxy = httpProxy;
  }

  async getToken(code: string, protocol: string, host: string): Promise<TokenResponse> {
    try {
      const redirectUri: string = this.getRedirectUrl(protocol, host);

      const response: request.Response = await this.makeProxiedRequest(request.post(`${this.apiUrl}/oauth2/token`) as ProxyRequest)
        .auth('sscs-cor', this.appSecret)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .type('form')
        .send({ 'grant_type': 'authorization_code' })
        .send({ 'code': code })
        .send({ 'redirect_uri': redirectUri });

      return Promise.resolve(response.body);
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  async deleteToken(token: string): Promise<void> {
    try {
      const response: request.Response = await this.makeProxiedRequest(request.delete(`${this.apiUrl}/session/${token}`) as ProxyRequest)
        .auth('sscs-cor', this.appSecret)
        .set('Accept', 'application/json');

      return Promise.resolve();
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  async getUserDetails(token: string, username?: string): Promise<UserDetails> {
    try {
      let uri = `${this.apiUrl}/details`;
      if (username) {
        uri += `?username=${username}`;
      }
      const response: request.Response = await this.makeProxiedRequest(request.get(uri) as ProxyRequest)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token);

      return Promise.resolve(response.body);
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  makeProxiedRequest(request: ProxyRequest): request.Request {
    return (this.httpProxy) ? request.proxy(this.httpProxy) : request;
  }

  getRedirectUrl(protocol: string, host: string): string {
    const portString = (host === 'localhost') ? ':' + this.appPort : '';
    return protocol + '://' + host + portString + Paths.login;
  }
}
