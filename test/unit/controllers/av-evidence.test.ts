import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
import * as avEvidence from 'app/server/controllers/av-evidence';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import caseData from '../../mock/tribunals/data/oral/av-evidence.json';
import { SinonStub } from 'sinon';

describe('controllers/av-evidence-list', function () {
  let req: any;
  let res: any;

  beforeEach(function () {
    req = {
      session: {
        appeal: {},
      },
      cookies: {},
    } as any;

    res = {
      render: sinon.stub(),
    };

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('setupAvEvidenceController', function () {
    let getStub: SinonStub = null;

    before(function () {
      getStub = sinon.stub();
      sinon.stub(express, 'Router').returns({
        get: getStub,
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('should call Router', function () {
      avEvidence.setupAvEvidenceController({});
      expect(getStub).to.have.been.calledWith(Paths.avEvidenceList);
      expect(getStub).to.have.been.calledWith(Paths.avEvidence);
    });
  });

  describe('getAvEvidenceList', function () {
    it('should render audio video evidence list ', async function () {
      req.cookies.manageYourAppeal = 'true';
      req.session.appeal = caseData.appeal;
      const avEvidenceList = [
        {
          name: 'appellant-evidence.mp3',
          type: 'audioDocument',
          url: 'http://dbed7988-4ed5-4965-b1b4-50e5582770f3/binary',
        },
        {
          name: 'rep-evidence.mp4',
          type: 'videoDocument',
          url: 'http://dbed7988-4ed5-4970-b1b4-50e5582770f3/binary',
        },
      ];
      req.session.appeal.audioVideoEvidence = avEvidenceList;
      const appeal = req.session.appeal;
      avEvidence.getAvEvidenceList(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'av-evidence-tab.njk',
        { appeal }
      );
    });
  });

  describe('getDocument', function () {
    let trackYourAppealService;
    const url = 'http://test';
    const type = 'audioDocument';

    beforeEach(function () {
      req = {
        session: {
          appeal: {
            audioVideoEvidence: [
              { name: 'test-evidence.mp3', type: 'audioDocument', url },
            ],
          },
        },
        cookies: {},
        query: {
          url,
          type,
        },
      } as any;

      res = {
        header: sinon.stub(),
        send: sinon.stub(),
        status: sinon.stub().returnsThis(),
      };

      trackYourAppealService = {};
    });

    it('should return audio/video evidence for the document url', async function () {
      const mp3 = '29312380';
      trackYourAppealService.getMediaFile = async () => Promise.resolve(mp3);
      await avEvidence.getAvEvidence(trackYourAppealService)(req, res);
      expect(res.header).to.have.called.calledWith('content-type', 'audio/mp3');
      expect(res.send).to.have.called.calledWith(Buffer.from(mp3, 'binary'));
    });

    it('should return 404 for invalid evidence url', async function () {
      const mp3 = '29312380';
      req.query.url = 'http://invalid-url';
      trackYourAppealService.getMediaFile = async () => Promise.resolve(mp3);

      await avEvidence.getAvEvidence(trackYourAppealService)(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.send).to.have.been.calledWith('Evidence not found');
      expect(AppInsights.trackException).to.have.been.called;
      expect(AppInsights.trackEvent).to.have.been.calledWith(
        'MYA_INVALID_EVIDENCE_URL'
      );
    });
  });
});
