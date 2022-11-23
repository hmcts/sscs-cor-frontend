import { setupLoginController } from 'app/server/controllers/login';
import * as express from 'express';
import * as Paths from 'app/server/paths';
import { Dependencies } from 'app/server/routes';
import { Router } from 'express';
const { expect, sinon } = require('test/chai-sinon');

describe('#setupLoginController', function () {
  const deps: Dependencies = {};

  beforeEach(function () {
    sinon.stub(express, 'Router').returns({
      get: sinon.stub(),
      post: sinon.stub(),
    } as Partial<Router> as Router);
  });

  afterEach(function () {
    (express.Router as sinon.SinonStub).restore();
  });

  it('sets up GET login', function () {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.login);
  });

  it('sets up GET logout', function () {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.logout);
  });

  it('sets up GET register', function () {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.register);
  });

  it('returns the router', function () {
    const controller = setupLoginController(deps);
    expect(controller).to.equal(express.Router());
  });
});
