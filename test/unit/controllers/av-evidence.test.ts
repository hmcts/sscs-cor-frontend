import * as AppInsights from '../../../app/server/app-insights';

import * as Paths from 'app/server/paths';
import * as avEvidence from 'app/server/controllers/av-evidence';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const caseData = require('../../mock/tribunals/data/oral/av-evidence.json');

describe('controllers/av-evidence-list', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {},
      },
      cookies: {},
    } as any;

    res = {
      render: sandbox.stub(),
    };

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(() => {
    sandbox.restore();
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  describe('setupAvEvidenceController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      avEvidence.setupAvEvidenceController({});
      expect(getStub).to.have.been.calledWith(Paths.avEvidenceList);
      expect(getStub).to.have.been.calledWith(Paths.avEvidence);
    });
  });

  describe('getAvEvidenceList', () => {
    it('should render audio video evidence list when mya feature enabled for (MEDIA_FILES_ALLOWED_ENABLED)', async () => {
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

  describe('getDocument', () => {
    let trackYourAppealService;
    const url = 'http://test';
    const type = 'audioDocument';

    beforeEach(() => {
      req = {
        session: {
          appeal: {},
        },
        cookies: {},
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

    it('should return audio/video evidence for the document url', async () => {
      const mp3 = '29312380';
      trackYourAppealService.getMediaFile = async () => Promise.resolve(mp3);
      await avEvidence.getAvEvidence(trackYourAppealService)(req, res);
      expect(res.header).to.have.called.calledWith('content-type', 'audio/mp3');
      expect(res.send).to.have.called.calledWith(Buffer.from(mp3, 'binary'));
    });
  });
});
