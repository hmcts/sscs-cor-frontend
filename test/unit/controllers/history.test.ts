import * as history from 'app/server/controllers/history';
import * as Paths from 'app/server/paths';
import * as FeatureEnabled from 'app/server/utils/featureEnabled';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import itParam from 'mocha-param';
import { SinonStub } from 'sinon';

describe('controllers/history', function () {
  let req: any = null;
  let res: any = null;

  beforeEach(function () {
    req = {
      session: {
        appeal: {
          latestEvents: [],
          historicalEvents: [],
        },
      },
      cookies: {},
    } as any;

    res = {
      render: sinon.stub(),
      send: sinon.stub(),
    };
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('setupHistoryController', function () {
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
      history.setupHistoryController({});
      expect(getStub).to.have.been.calledWith(Paths.history);
    });
  });

  describe('getHistory', function () {
    let isFeatureEnabledStub;

    beforeEach(function () {
      isFeatureEnabledStub = sinon.stub(FeatureEnabled, 'isFeatureEnabled');
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    itParam(
      `renders Cookie Policy page for cookieBanner.enabled`,
      [
        { historyTabFeature: true, expected: 'history.njk' },
        { historyTabFeature: false, expected: 'errors/404.njk' },
      ],
      function (value) {
        it(`should render ${value.expected} view when history tab feature is ${value.historyTabFeature}`, function () {
          isFeatureEnabledStub
            .withArgs(FeatureEnabled.Feature.HISTORY_TAB, sinon.match.object)
            .returns(value.historyTabFeature);
          history.getHistory(req, res);
          expect(res.render).to.have.been.calledOnce.calledWith(value.expected);
        });
      }
    );
  });
});
