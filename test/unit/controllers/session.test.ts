
const { expect, sinon } = require('test/chai-sinon');
const { setupSessionController, extendSession } = require('app/server/controllers/session.ts');
const express = require('express');
import * as Paths from 'app/server/paths';

describe('controllers/session.ts', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      session: { cookie : { expires : new Date() } }
    } as any;
    res = {
      send: sinon.spy(),
      setHeader : sinon.spy()
    } as any;
  });

  describe('extendSession', () => {
    it('renders Cookie Policy page', async() => {
      await extendSession(req, res);
      expect(res.send).to.have.been.calledOnce;
    });
  });

  describe('setupSessionController', () => {
    let deps: any;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub()
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupSessionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.sesionExtension);
    });
  });
});
