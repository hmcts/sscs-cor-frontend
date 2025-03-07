import * as AppInsights from 'app/server/app-insights';
import * as requestTypeService from 'app/server/services/request-type';
import * as requestType from 'app/server/controllers/request-type';
import * as Paths from 'app/server/paths';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import express, { NextFunction, Router } from 'express';
import { expect, sinon } from '../../chai-sinon';
import { SinonStub } from 'sinon';

import hearingRecording from '../../mock/tribunals/data/oral/hearing-recording.json';
import HttpException from 'app/server/exceptions/HttpException';

describe('controllers/request-type', function () {
  let req: any;
  let res: any;
  let next: NextFunction;

  const error = new HttpException(INTERNAL_SERVER_ERROR, 'Server Error');

  beforeEach(function () {
    req = {
      params: {
        action: '',
      },
      session: {
        case: {},
        requestOptions: {},
        hearingRecordingsResponse: {},
      },
      body: {},
      cookies: {},
    } as any;

    res = {
      render: sinon.stub(),
      redirect: sinon.spy(),
    };

    next = sinon.stub().resolves();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('setupRequestTypeController', function () {
    let getStub: SinonStub = null;
    let postStub: SinonStub = null;

    before(function () {
      getStub = sinon.stub();
      postStub = sinon.stub();
      sinon.stub(express, 'Router').returns({
        get: getStub,
        post: postStub,
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('should call Router', function () {
      requestType.setupRequestTypeController({});
      expect(getStub).to.have.been.calledWith(`${Paths.requestType}/:action?`);
      expect(getStub).to.have.been.calledWith(`${Paths.requestType}/recording`);
      expect(postStub).to.have.been.calledWith(`${Paths.requestType}/select`);
      expect(postStub).to.have.been.calledWith(
        `${Paths.requestType}/hearing-recording-request`
      );
    });
  });

  describe('getRequestType', function () {
    it('should render request type select page', async function () {
      req.cookies.manageYourAppeal = 'true';
      await requestType.getRequestType()(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'request-type/index.njk',
        {
          action: '',
          requestOptions: {},
          hearingRecordingsResponse: {},
          pageTitleError: false,
          emptyHearingIdError: false,
          appeal: req.session.appeal,
        }
      );
    });
  });

  describe('selectRequestType', function () {
    let getHearingRecordingStub: SinonStub = null;

    beforeEach(function () {
      getHearingRecordingStub = sinon.stub(
        requestTypeService,
        'getHearingRecording'
      );
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should render request type select page with hearing recordings', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.case = { case_id: 'case_id_1' };
      req.body.requestOptions = 'hearingRecording';

      getHearingRecordingStub.returns(hearingRecording);

      await requestType.selectRequestType()(req, res, next);
      expect(getHearingRecordingStub).to.have.been.calledOnce.calledWith(
        'case_id_1',
        req
      );
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/hearingRecording`
      );
      expect(req.session.hearingRecordingsResponse).to.equal(hearingRecording);
    });

    it('should render request type select page without hearing recordings', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.case = { case_id: 'case_id_1' };
      req.body.requestOptions = 'hearingRecording';

      getHearingRecordingStub.returns(null);

      await requestType.selectRequestType()(req, res, next);
      expect(getHearingRecordingStub).to.have.been.calledOnce.calledWith(
        'case_id_1',
        req
      );
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/hearingRecording`
      );
    });

    it('should catch error and track Excepction with AppInsights', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.case = { case_id: 'case_id_1' };
      req.body.requestOptions = 'hearingRecording';

      getHearingRecordingStub.rejects(error);

      await requestType.selectRequestType()(req, res, next);

      expect(
        requestTypeService.getHearingRecording
      ).to.have.been.calledOnce.calledWith('case_id_1', req);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('submitHearingRecordingRequest', function () {
    let submitHearingRecordingStub: SinonStub = null;

    beforeEach(function () {
      submitHearingRecordingStub = sinon.stub(
        requestTypeService,
        'submitHearingRecordingRequest'
      );
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should render error message for request with empty hearing ids', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearingRecordingsResponse = hearingRecording;

      await requestType.submitHearingRecordingRequest()(req, res, next);

      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/formError`
      );
    });

    it('should render confirm hearing request page for hearing ids', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.case = { case_id: 'case_id_1' };
      req.session.hearingRecordingsResponse = hearingRecording;
      req.body.hearingId = ['hearing_id_1'];

      submitHearingRecordingStub.returns(null);

      await requestType.submitHearingRecordingRequest()(req, res, next);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/confirm`
      );
      expect(submitHearingRecordingStub).to.have.been.calledOnce.calledWith(
        'case_id_1',
        ['hearing_id_1'],
        req
      );
      expect(req.session.hearingRecordingsResponse).to.equal(null);
    });

    it('should catch error and track Excepction with AppInsights', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.case = { case_id: 'case_id_1' };
      req.session.hearingRecordingsResponse = hearingRecording;
      req.body.hearingId = ['hearing_id_1'];

      submitHearingRecordingStub.rejects(error);

      await requestType.submitHearingRecordingRequest()(req, res, next);

      expect(submitHearingRecordingStub).to.have.been.calledOnce.calledWith(
        'case_id_1',
        ['hearing_id_1'],
        req
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHearingRecording', function () {
    const mp3 = '29312380';
    let trackYourAppealService;
    const url = 'http://test';
    const type = 'mp3';

    beforeEach(function () {
      req = {
        query: {
          url,
          type,
        },
      } as any;

      res = {
        header: sinon.stub(),
        send: sinon.stub(),
      };

      trackYourAppealService = {};
    });

    it('should return hearing recording for the document url', async function () {
      trackYourAppealService.getMediaFile = async () => Promise.resolve(mp3);
      await requestType.getHearingRecording(trackYourAppealService)(req, res);
      expect(res.header).to.have.called.calledWith('content-type', 'audio/mp3');
      expect(res.send).to.have.called.calledWith(Buffer.from(mp3, 'binary'));
    });
  });
});
