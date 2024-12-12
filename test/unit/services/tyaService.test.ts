import config from 'config';
import { TrackYourApealService } from 'app/server/services/tyaService';
import { RequestPromise } from 'app/server/services/request-wrapper';

import { expect, sinon } from 'test/chai-sinon';

describe('services/tyaService', function () {
  let rpStub: sinon.SinonStub = null;
  let tribunalsApiUrl: string = null;
  let trackYourAppealService = null;
  const req = {
    session: {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    },
  };

  before(function () {
    tribunalsApiUrl = config.get('tribunals-api.url');
    trackYourAppealService = new TrackYourApealService(tribunalsApiUrl);
  });

  beforeEach(function () {
    rpStub = sinon.stub(RequestPromise, 'request');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should getAppeal', async function () {
    const appealId = 'appealNumber';
    const expectedRequestOptions = {
      method: 'GET',
      uri: `${tribunalsApiUrl}/appeals?mya=true&caseId=${appealId}`,
    };
    await trackYourAppealService.getAppeal(appealId, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should validateSurname', async function () {
    const appealId = 'appealNumber';
    const surname = 'burgers';
    const expectedRequestOptions = {
      method: 'GET',
      uri: `${tribunalsApiUrl}/appeals/${appealId}/surname/${surname}`,
    };
    await trackYourAppealService.validateSurname(appealId, surname, req);
    expect(rpStub).to.have.been.calledOnce.calledWith(expectedRequestOptions);
  });

  it('should getDocument', async function () {
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

  it('should getMediaFile', async function () {
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
