const { expect, sinon } = require('test/chai-sinon');
import * as config from 'config';
import { TrackYourApealService } from 'app/server/services/tyaService';
import { RequestPromise } from 'app/server/services/request-wrapper';
import { CONST } from '../../../app/constants';
import HTTP_RETRIES = CONST.HTTP_RETRIES;

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
      retry: 3,
      uri: `${tribunalsApiUrl}/appeals?mya=true&caseId=${appealId}`
    };
    await trackYourAppealService.getAppeal(appealId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getDocument', async () => {
    const url = 'http://test';
    const expectedRequestOptions = {
      method: 'GET',
      retry: HTTP_RETRIES,
      encoding: 'binary',
      uri: `${tribunalsApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': 'application/pdf'
      }
    };
    await trackYourAppealService.getDocument(url, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getMediaFile', async () => {
    const url = 'http://test';
    const expectedRequestOptions = {
      method: 'GET',
      retry: HTTP_RETRIES,
      encoding: 'binary',
      uri: `${tribunalsApiUrl}/document?url=${url}`,
      headers: {
        'Content-type': ['audio/mp3', 'video/mp4']
      }
    };
    await trackYourAppealService.getMediaFile(url, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });
});
