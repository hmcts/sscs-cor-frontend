import * as Paths from 'app/server/paths';
import { Dependencies } from 'app/server/routes';
import express, { Router } from 'express';
import {
  extendSession,
  setupSessionController,
  ExtendSessionResponse,
} from 'app/server/controllers/session';
import config from 'config';
import { expect, sinon } from 'test/chai-sinon';
import { SinonStub } from 'sinon';

const expireInSeconds: number = config.get('session.cookie.maxAgeInMs');

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
      extendSession(req, res);
      const response: ExtendSessionResponse = { expireInSeconds };
      const expected = JSON.stringify(response);
      expect(res.send).to.have.been.calledOnceWith(expected);
    });
  });

  describe('setupSessionController', function () {
    let deps: Dependencies = null;
    let routerStub: SinonStub = null;

    beforeEach(function () {
      deps = {};
      routerStub = sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      routerStub.restore();
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
