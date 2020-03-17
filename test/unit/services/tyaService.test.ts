const { expect, sinon } = require('test/chai-sinon');
import * as config from 'config';
import { TrackYourApealService } from 'app/server/services/tyaService';
import { RequestPromise } from 'app/server/services/request-wrapper';

describe('services/tyaService', () => {
  let sandbox: sinon.SinonSandbox = sinon.sandbox.create();
  let rpStub: sinon.SinonStub;
  const tribunalsApiUrl: string = config.get('tribunals.api-url');
  const trackYourAppealService = new TrackYourApealService(tribunalsApiUrl);
  const req: any = {};
  req.session = {
    accessToken : 'someUserToken',
    serviceToken : 'someServiceToken'
  };

  beforeEach(() => {
    rpStub = sandbox.stub(RequestPromise, 'request');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should getAppeal', async () => {
    const appealId = 'appealNumber';
    const expectedRequestOptions = {
      method: 'GET',
      uri: `${tribunalsApiUrl}/appeals?mya=true&caseId=${appealId}`
    };
    await trackYourAppealService.getAppeal(appealId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should changeEmailAddress', async () => {
    const appealId = 'appealNumber';
    const subscriptionId = 'subscriptionId';
    const email = 'email';
    const expectedRequestOptions = {
      method: 'POST',
      uri: `${tribunalsApiUrl}/appeals/${appealId}/subscriptions/${subscriptionId}`,
      body: { subscription: { email: email } }
    };
    await trackYourAppealService.changeEmailAddress(appealId, email, subscriptionId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should stopReceivingEmails', async () => {
    const appealId = 'appealNumber';
    const subscriptionId = 'subscriptionId';
    const expectedRequestOptions = {
      method: 'DELETE',
      uri: `${tribunalsApiUrl}/appeals/${appealId}/subscriptions/${subscriptionId}`
    };
    await trackYourAppealService.stopReceivingEmails(appealId, subscriptionId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

});
