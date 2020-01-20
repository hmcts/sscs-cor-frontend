const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as history from 'app/server/controllers/history';
import * as Paths from 'app/server/paths';

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

  describe('getHistory', () => {
    it('should not render history page when history tab feature is false', async() => {
      history.getHistory(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });
  });
});
