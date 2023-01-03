import * as Paths from 'app/server/paths';
import { Dependencies } from 'app/server/routes';
import { Router } from 'express';
import { ExtendSessionResponse } from 'app/server/controllers/session';
import * as config from 'config';

const { expect, sinon } = require('test/chai-sinon');
const {
  setupSessionController,
  extendSession,
} = require('app/server/controllers/session.ts');
const express = require('express');

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
      await extendSession(req, res);
      const response: ExtendSessionResponse = { expireInSeconds };
      const expected = JSON.stringify(response);
      expect(res.send).to.have.been.calledOnceWith(expected);
    });
  });

  describe('setupSessionController', function () {
    let deps: Dependencies = null;
    beforeEach(function () {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      } as Partial<Router> as Router);
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
