import * as request from 'request-promise';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';

export interface TokenResponse {
  access_token: string;
}

export interface UserDetails {
  email: string;
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
      const body = await request.post({
        uri: `${this.apiUrl}/oauth2/token`,
        json: true,
        headers: {
          'Accept': 'application/json'
        },
        auth: {
          user: 'sscs-cor',
          pass: this.appSecret
        },
        form: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        }
      });

      return Promise.resolve(body);
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  async deleteToken(token: string): Promise<void> {
    try {
      await request.delete({
        uri: `${this.apiUrl}/session/${token}`,
        headers: {
          'Accept': 'application/json'
        },
        auth: {
          user: 'sscs-cor',
          pass: this.appSecret
        }
      });
      return Promise.resolve();
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  async getUserDetails(token: string): Promise<UserDetails> {
    try {
      const body = await request.get({
        uri: `${this.apiUrl}/details`,
        json: true,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return Promise.resolve(body);
    } catch (error) {
      AppInsights.trackException(error);
      return Promise.reject(error);
    }
  }

  getUrl(protocol: string, host: string, path: string): string {
    const portString = (host === 'localhost') ? ':' + this.appPort : '';
    return protocol + '://' + host + portString + path;
  }

  getRedirectUrl(protocol: string, host: string): string {
    return this.getUrl(protocol, host, Paths.login);
  }

  getRegisterUrl(protocol: string, host: string): string {
    return this.getUrl(protocol, host, Paths.register);
  }
}
