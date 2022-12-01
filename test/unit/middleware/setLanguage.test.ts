import { expect, sinon } from 'test/chai-sinon';
import { Request, Response, Router } from 'express';
import { SinonStub } from 'sinon';
import * as express from 'express';
import {
  setupSetLanguageController,
  setLanguage,
} from 'app/server/middleware/setLanguage';
import { SessionData } from 'express-session';

const i18next = require('i18next');

describe('middleware/setLanguage', function () {
  const session = {} as SessionData;
  const query = {};
  const req = {
    session,
    query,
  } as Request;
  const res = {} as Response;
  let next: SinonStub = null;

  let routerStub: SinonStub = null;
  let i18ChangeStub: SinonStub = null;
  let i18nextStub: SinonStub = null;

  before(function () {
    res.render = sinon.stub();
    next = sinon.stub();
    routerStub = sinon.stub(express, 'Router').returns({
      get: sinon.stub(),
    } as Partial<Router> as Router);

    i18ChangeStub = sinon.stub(i18next, 'changeLanguage').resolves('');
    i18nextStub = sinon.stub(i18next, 'language').returns('test');
  });

  after(function () {
    sinon.restore();
  });

  describe('supportEvidence', function () {
    afterEach(function () {
      sinon.resetHistory();
    });

    it('#setupSetLanguageController sets up GET supportEvidence', function () {
      setupSetLanguageController();
      expect(express.Router().get).to.have.been.calledOnceWith('*');
    });

    it('#setLanguage sets the language to default en', async function () {
      await setLanguage(req, res, next);
      expect(req.session['language']).to.equal('en');
      expect(next).to.have.been.calledOnce;
    });

    it('#setLanguage sets the language to cy if query is cy', async function () {
      req.session['language'] = 'en';
      req.query = {
        lng: 'cy',
      };
      await setLanguage(req, res, next);
      expect(req.session['language']).to.equal('cy');
      expect(i18ChangeStub).to.have.been.calledOnceWith('cy');
      expect(next).to.have.been.calledOnce;
    });

    it('#setLanguage sets the language to session language if query is blank', async function () {
      req.session['language'] = 'cy';
      req.query = null;
      await setLanguage(req, res, next);
      expect(req.session['language']).to.equal('cy');
      expect(i18ChangeStub).to.have.been.calledOnceWith('cy');
      expect(next).to.have.been.calledOnce;
    });

    it('#setLanguage sets the language to session language if query "lng" is blank', async function () {
      req.session['language'] = 'cy';
      req.query = {
        lng: null,
      };
      await setLanguage(req, res, next);
      expect(req.session['language']).to.equal('cy');
      expect(i18ChangeStub).to.have.been.calledOnceWith('cy');
      expect(next).to.have.been.calledOnce;
    });
  });
});
