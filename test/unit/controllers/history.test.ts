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

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      history.setupHistoryController({});
      expect(getStub).to.have.been.calledWith(Paths.history);
    });
  });

  describe.only('getHistory', () => {
    it('should render history page when history tab feature is true', () => {
      let isFeatureEnabledStub = sinon.stub(FeatureEnabled, 'isFeatureEnabled');
      isFeatureEnabledStub.withArgs(FeatureEnabled.Feature.HISTORY_TAB, sinon.match.object).returns(true);
      history.getHistory(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('history.html');
    });
  });
});
