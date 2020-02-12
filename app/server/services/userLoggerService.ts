import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

enum UserLogTypes {
  LoggedInTimestamp
}

export class UserLoggerService {
  private corApi: string;

  constructor(url: string) {
    this.corApi = url;
  }

  async log(req: Request, logType: UserLogTypes) {
    return RequestPromise.request({
      method: 'PUT',
      uri: `${this.corApi}/cases/${req.session.caseId}/log`,
      body: {
        userEmail: req.session.idamEmail,
        logType: logType
      }
    }, req);
  }

}
