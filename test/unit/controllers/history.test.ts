const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as history from 'app/server/controllers/history';
import * as Paths from 'app/server/paths';
import * as FeatureEnabled from 'app/server/utils/featureEnabled';

describe('controllers/history', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {
        appeal: {
          latestEvents: [],
          historicalEvents: []
        }
      },
      cookies: {}
    } as any;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHistoryController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    it('should call Router', () => {
      history.setupHistoryController({});
      expect(getStub).to.have.been.calledWith(Paths.history);
    });
  });

  describe('getHistory', () => {
    let isFeatureEnabledStub;
    beforeEach(() => {
      isFeatureEnabledStub = sandbox.stub(FeatureEnabled, 'isFeatureEnabled');
    });

    const scenarios = [
      { historyTabFeature: true, expected: 'history.html' },
      { historyTabFeature: false, expected: 'errors/404.html' }
    ];
    
    scenarios.forEach((scenario) => {
      it('should render ' + scenario.expected + ' view when history tab feature is ' + scenario.historyTabFeature, () => {
        isFeatureEnabledStub.withArgs(FeatureEnabled.Feature.HISTORY_TAB, sinon.match.object).returns(scenario.historyTabFeature);
        history.getHistory(req, res);
        expect(res.render).to.have.been.calledOnce.calledWith(scenario.expected);
      });
    });
  });
});
