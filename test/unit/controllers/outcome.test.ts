import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
import * as outcome from 'app/server/controllers/outcome';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import oralHearing from '../../mock/tribunals/data/oral/outcome.json';
import { SinonStub } from 'sinon';

describe('controllers/outcome', function () {
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

  describe('setupOutcomeController', function () {
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
      outcome.setupOutcomeController({});
      expect(getStub).to.have.been.calledWith(Paths.outcome);
      expect(getStub).to.have.been.calledWith(Paths.document);
    });
  });

  describe('getOutcome', function () {
    it('should render outcome page when mya feature enabled for oral (APPEAL_RECEIVED)', async function () {
      req.session.appeal = oralHearing.appeal;
      const outcomes = [
        {
          name: 'Adjournment.pdf',
          date: '2019-11-20',
          url: 'http://dbed7988-4ed5-4965-b1b4-50e5582770f3/binary',
        },
      ];
      outcome.getOutcome(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('outcome-tab.njk', {
        outcomes,
      });
    });
  });

  describe('getDocument', function () {
    let trackYourAppealService;
    const url = 'http://test';

    beforeEach(function () {
      req = {
        session: {
          appeal: {
            hearingOutcome: [{ url }],
          },
        },
        cookies: {},
        query: {
          url,
        },
      } as any;

      res = {
        header: sinon.stub(),
        send: sinon.stub(),
      };

      trackYourAppealService = {};
    });

    it('should return pdf document for the document url', async function () {
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
