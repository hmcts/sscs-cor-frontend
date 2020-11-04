const { expect, sinon } = require('test/chai-sinon');
import { setupIdamStubController } from 'app/server/controllers/idam-stub.ts';
import * as express from 'express';

describe('#setupIdamStubController', () => {
  beforeEach(() => {
    sinon.stub(express, 'Router').returns({
      get: sinon.stub(),
      post: sinon.stub(),
      delete: sinon.stub()
    });
  });

  afterEach(() => {
    (express.Router as sinon.SinonStub).restore();
  });

  it('sets up GET login', () => {
    setupIdamStubController();
    expect(express.Router().get).to.have.been.calledWith('/idam-stub/login');
  });

  it('sets up POST login', () => {
    setupIdamStubController();
    expect(express.Router().post).to.have.been.calledWith('/idam-stub/login');
  });

  it('sets up POST oauth2 token', () => {
    setupIdamStubController();
    expect(express.Router().post).to.have.been.calledWith('/idam-stub/oauth2/token');
  });

  it('sets up GET idam-stub details', () => {
    setupIdamStubController();
    expect(express.Router().get).to.have.been.calledWith('/idam-stub/details');
  });

  it('sets up DELETE idam-stub session token', () => {
    setupIdamStubController();
    expect(express.Router().delete).to.have.been.calledWith('/idam-stub/session/:token');
  });

  it('returns the router', () => {
    const controller = setupIdamStubController();
    expect(controller).to.equal(express.Router());
  });
});
