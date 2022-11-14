import * as Paths from 'app/server/paths';

const { expect, sinon } = require('test/chai-sinon');
const {
  setupSessionController,
  extendSession,
} = require('app/server/controllers/session.ts');
const express = require('express');

describe('controllers/session.ts', function () {
  let req: any;
  let res: any;

  beforeEach(function () {
    req = {
      session: { cookie: { expires: new Date() } },
    } as any;
    res = {
      send: sinon.spy(),
      setHeader: sinon.spy(),
    } as any;
  });

  describe('extendSession', function () {
    it('renders Cookie Policy page', async function () {
      await extendSession(req, res);
      expect(res.send).to.have.been.calledOnce;
    });
  });

  describe('setupSessionController', function () {
    let deps: any;
    beforeEach(function () {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      });
    });

    afterEach(function () {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', function () {
      setupSessionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(
        Paths.sessionExtension
      );
    });
  });
});
