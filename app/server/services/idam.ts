import * as Paths from '../paths';
import { RequestPromise } from './request-wrapper';
import { Logger } from '@hmcts/nodejs-logging';
const logger = Logger.getLogger('login.js');
import i18next from 'i18next';

import config from 'config';

export interface TokenResponse {
  access_token: string;
}

export interface UserDetails {
  email: string;
}

export class IdamService {
  private readonly apiUrl: string;
  private readonly appPort: number;
  private readonly appSecret: string;

  constructor(apiUrl: string, appPort: number, appSecret: string) {
    this.apiUrl = apiUrl;
    this.appPort = appPort;
    this.appSecret = appSecret;
  }

  async getToken(
    code: string,
    protocol: string,
    host: string
  ): Promise<TokenResponse> {
    const redirectUri: string = this.getRedirectUrl(protocol, host);

    return RequestPromise.request({
      method: 'POST',
      uri: `${this.apiUrl}/oauth2/token?client_id=sscs&client_secret=${this.appSecret}`,
      auth: {
        user: 'sscs',
        pass: this.appSecret,
      },
      form: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        ui_locales: i18next.language,
      },
    });
  }

  async deleteToken(token: string): Promise<void> {
    return RequestPromise.request({
      method: 'DELETE',
      uri: `${this.apiUrl}/session/${token}`,
      auth: {
        user: 'sscs',
        pass: this.appSecret,
      },
    });
  }

  async getUserDetails(token: string): Promise<UserDetails> {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/details`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getUrl(protocol: string, host: string, path: string): string {
    const portString = host === 'localhost' ? `:${this.appPort}` : '';
    return `${protocol}://${host}${portString}${path}`;
  }

  getRedirectUrl(protocol: string, host: string): string {
    return this.getUrl(protocol, host, Paths.login);
  }

  getRegisterUrl(protocol: string, host: string): string {
    return this.getUrl(protocol, host, Paths.register);
  }
}
