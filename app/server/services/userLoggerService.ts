import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

export enum UserLogTypes {
  USER_LOGIN_TIMESTAMP
}

export class UserLoggerService {
  private corApi: string;

  constructor(url: string) {
    this.corApi = url;
  }

  async log(req: Request, userLogType: UserLogTypes) {
    return RequestPromise.request({
      method: 'PUT',
      uri: `${this.corApi}/cases/${req.session.caseId}/log`,
      body: {
        userEmail: req.session.idamEmail,
        userLogType: userLogType
      }
    }, req);
  }

}
