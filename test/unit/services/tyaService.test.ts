import * as config from 'config';
import { TrackYourApealService } from 'app/server/services/tyaService';
import { RequestPromise } from 'app/server/services/request-wrapper';

const { expect, sinon } = require('test/chai-sinon');

describe('services/tyaService', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  let rpStub: sinon.SinonStub;
  const tribunalsApiUrl: string = config.get('tribunals.api-url');
  const trackYourAppealService = new TrackYourApealService(tribunalsApiUrl);
  const req: any = {};
  req.session = {
    accessToken: 'someUserToken',
    serviceToken: 'someServiceToken',
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
      uri: `${tribunalsApiUrl}/appeals?mya=true&caseId=${appealId}`,
    };
    await trackYourAppealService.getAppeal(appealId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should validateSurname', async () => {
    const appealId = 'appealNumber';
    const surname = 'burgers';
    const expectedRequestOptions = {
      method: 'GET',
      uri: `${tribunalsApiUrl}/appeals/${appealId}/surname/${surname}`,
    };
    await trackYourAppealService.validateSurname(appealId, surname, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getDocument', async () => {
    const url = 'http://test';
    const expectedRequestOptions = {
      method: 'GET',
      encoding: 'binary',
      uri: `${tribunalsApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': 'application/pdf',
      },
    };
    await trackYourAppealService.getDocument(url, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getMediaFile', async () => {
    const url = 'http://test';
    const expectedRequestOptions = {
      method: 'GET',
      encoding: 'binary',
      uri: `${tribunalsApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': ['audio/mp3', 'video/mp4'],
      },
    };
    await trackYourAppealService.getMediaFile(url, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });
});
