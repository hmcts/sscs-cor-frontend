import * as history from 'app/server/controllers/history';
import * as Paths from 'app/server/paths';
import * as FeatureEnabled from 'app/server/utils/featureEnabled';
import { SinonSandbox } from 'sinon';

const itParam = require('mocha-param');
const express = require('express');
const { expect, sinon } = require('test/chai-sinon');

describe('controllers/history', function () {
  let req: any = null;
  let res: any = null;
  let sandbox: SinonSandbox = null;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
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
      render: sandbox.stub(),
      send: sandbox.stub(),
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('setupHistoryController', function () {
    let getStub;
    beforeEach(function () {
      getStub = sandbox.stub(express.Router, 'get');
    });

    it('should call Router', function () {
      history.setupHistoryController({});
      expect(getStub).to.have.been.calledWith(Paths.history);
    });
  });

  describe('getHistory', function () {
    let isFeatureEnabledStub;
    beforeEach(function () {
      isFeatureEnabledStub = sandbox.stub(FeatureEnabled, 'isFeatureEnabled');
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
