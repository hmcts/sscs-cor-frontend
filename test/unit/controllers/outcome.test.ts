import * as AppInsights from '../../../app/server/app-insights';

import { TrackYourApealService } from '../../../app/server/services/tyaService';

import * as Paths from 'app/server/paths';
import * as outcome from 'app/server/controllers/outcome';
import { OK } from 'http-status-codes';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralHearing = require('../../mock/tribunals/data/oral/outcome');

describe('controllers/outcome', () => {
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

  describe('setupOutcomeController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      outcome.setupOutcomeController({});
      expect(getStub).to.have.been.calledWith(Paths.outcome);
      expect(getStub).to.have.been.calledWith(Paths.document);
    });
  });

  describe('getOutcome', () => {
    it('should render outcome page when mya feature enabled for oral (APPEAL_RECEIVED)', async () => {
      req.session.appeal = oralHearing.appeal;
      const outcomes = [
        {
          name: 'Adjournment.pdf',
          date: '20-11-2019',
          url: 'http://dbed7988-4ed5-4965-b1b4-50e5582770f3/binary',
        },
      ];
      outcome.getOutcome(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('outcome-tab.njk', {
        outcomes,
      });
    });
  });

  describe('getDocument', () => {
    let trackYourAppealService;
    const url = 'http://test';

    beforeEach(() => {
      req = {
        session: {
          appeal: {},
        },
        cookies: {},
        query: {
          url,
        },
      } as any;

      res = {
        header: sandbox.stub(),
        send: sandbox.stub(),
      };

      trackYourAppealService = {};
    });

    it('should return pdf document for the document url', async () => {
      const pdf = 'PDF';
      trackYourAppealService.getDocument = async () => Promise.resolve(pdf);
      await outcome.getDocument(trackYourAppealService)(req, res);
      expect(res.header).to.have.called.calledWith(
        'content-type',
        'application/pdf'
      );
      expect(res.send).to.have.called.calledWith(Buffer.from(pdf, 'binary'));
    });
  });
});
