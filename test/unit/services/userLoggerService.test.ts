import { UserLoggerService, UserLogTypes } from 'app/server/services/userLoggerService';
const { expect, sinon } = require('test/chai-sinon');
import { RequestPromise } from 'app/server/services/request-wrapper';

describe('services/evidence', () => {
  it('should log user action', async () => {
    let rpStub: sinon.SinonStub;
    rpStub = sinon.stub(RequestPromise, 'request');
    const userLoggerService = new UserLoggerService('http://localhost');
    const req: any = {
      session: {
        caseId: '123',
        idamEmail: 'appellant@email.com'
      }
    };
    const expectedRequestOptions = {
      method: 'PUT',
      uri: 'http://localhost/cases/123/log',
      body: {
        userEmail: 'appellant@email.com',
        userLogType: 0
      }
    };
    await userLoggerService.log(req, UserLogTypes.USER_LOGIN_TIMESTAMP);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
    rpStub.restore();
  });
});
