import * as AppInsights from '../../../app/server/app-insights';

import * as Paths from 'app/server/paths';
import * as requestType from 'app/server/controllers/request-type';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { NextFunction } from 'express';
import { expect, sinon } from '../../chai-sinon';

const express = require('express');
const hearingRecording = require('../../mock/tribunals/data/oral/hearing-recording.json');

describe('controllers/request-type', () => {
  let req: any;
  let res: any;
  let next: NextFunction;
  const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {
        action: '',
      },
      session: {
        hearing: {},
        requestOptions: {},
        hearingRecordingsResponse: {},
      },
      body: {},
      cookies: {},
    } as any;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
    };

    next = sandbox.stub().resolves();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(() => {
    sandbox.restore();
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  describe('setupRequestTypeController', () => {
    let getStub;
    let postStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
      postStub = sandbox.stub(express.Router, 'post');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      requestType.setupRequestTypeController({});
      expect(getStub).to.have.been.calledWith(`${Paths.requestType}/:action?`);
      expect(getStub).to.have.been.calledWith(`${Paths.requestType}/recording`);
      expect(postStub).to.have.been.calledWith(`${Paths.requestType}/select`);
      expect(postStub).to.have.been.calledWith(
        `${Paths.requestType}/hearing-recording-request`
      );
    });
  });

  describe('getRequestType', () => {
    it('should render request type select page', async () => {
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

  describe('selectRequestType', () => {
    let requestTypeService;
    it('should render request type select page with hearing recordings', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearing = { case_id: 'case_id_1' };
      req.body['requestOptions'] = 'hearingRecording';

      requestTypeService = {
        getHearingRecording: sandbox.stub().resolves(hearingRecording),
      };

      await requestType.selectRequestType(requestTypeService)(req, res, next);
      expect(
        requestTypeService.getHearingRecording
      ).to.have.been.calledOnce.calledWith('case_id_1', req);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/hearingRecording`
      );
      expect(req.session.hearingRecordingsResponse).to.equal(hearingRecording);
    });

    it('should render request type select page without hearing recordings', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearing = { case_id: 'case_id_1' };
      req.body['requestOptions'] = 'hearingRecording';

      requestTypeService = {
        getHearingRecording: sandbox.stub().resolves(null),
      };

      await requestType.selectRequestType(requestTypeService)(req, res, next);
      expect(
        requestTypeService.getHearingRecording
      ).to.have.been.calledOnce.calledWith('case_id_1', req);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/hearingRecording`
      );
    });

    it('should catch error and track Excepction with AppInsights', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearing = { case_id: 'case_id_1' };
      req.body['requestOptions'] = 'hearingRecording';

      requestTypeService = {
        getHearingRecording: sandbox.stub().rejects(error),
      };

      await requestType.selectRequestType(requestTypeService)(req, res, next);

      expect(
        requestTypeService.getHearingRecording
      ).to.have.been.calledOnce.calledWith('case_id_1', req);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('submitHearingRecordingRequest', () => {
    let requestTypeService;
    it('should render error message for request with empty hearing ids', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearingRecordingsResponse = hearingRecording;

      await requestType.submitHearingRecordingRequest(requestTypeService)(
        req,
        res,
        next
      );

      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/formError`
      );
    });

    it('should render confirm hearing request page for hearing ids', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearing = { case_id: 'case_id_1' };
      req.session.hearingRecordingsResponse = hearingRecording;
      req.body['hearingId'] = ['hearing_id_1'];

      requestTypeService = {
        submitHearingRecordingRequest: sandbox.stub().resolves(),
      };

      await requestType.submitHearingRecordingRequest(requestTypeService)(
        req,
        res,
        next
      );
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.requestType}/confirm`
      );
      expect(
        requestTypeService.submitHearingRecordingRequest
      ).to.have.been.calledOnce.calledWith('case_id_1', ['hearing_id_1'], req);
      expect(req.session.hearingRecordingsResponse).to.equal('');
    });

    it('should catch error and track Excepction with AppInsights', async () => {
      req.cookies.manageYourAppeal = 'true';
      req.session.hearing = { case_id: 'case_id_1' };
      req.session.hearingRecordingsResponse = hearingRecording;
      req.body['hearingId'] = ['hearing_id_1'];

      requestTypeService = {
        submitHearingRecordingRequest: sandbox.stub().rejects(error),
      };

      await requestType.submitHearingRecordingRequest(requestTypeService)(
        req,
        res,
        next
      );

      expect(
        requestTypeService.submitHearingRecordingRequest
      ).to.have.been.calledOnce.calledWith('case_id_1', ['hearing_id_1'], req);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHearingRecording', () => {
    const mp3 = '29312380';
    let trackYourAppealService;
    const url = 'http://test';
    const type = 'mp3';

    beforeEach(() => {
      req = {
        query: {
          url,
          type,
        },
      } as any;

      res = {
        header: sandbox.stub(),
        send: sandbox.stub(),
      };

      trackYourAppealService = {};
    });

    it('should return hearing recording for the document url', async () => {
      trackYourAppealService.getMediaFile = async () => Promise.resolve(mp3);
      await requestType.getHearingRecording(trackYourAppealService)(req, res);
      expect(res.header).to.have.called.calledWith('content-type', 'audio/mp3');
      expect(res.send).to.have.called.calledWith(Buffer.from(mp3, 'binary'));
    });
  });
});
