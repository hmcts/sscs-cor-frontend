import { setupLoginController } from 'app/server/controllers/login';
import express, { Router } from 'express';
import request from 'supertest';
import config from 'config';
import * as Paths from 'app/server/paths';
import { Dependencies } from 'app/server/routes';
import { IdamService } from 'app/server/services/idam';

import { expect, sinon } from 'test/chai-sinon';

const idamUrl: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');

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

  describe('register route redirect', function () {
    beforeEach(function () {
      (express.Router as sinon.SinonStub).restore();
    });

    afterEach(function () {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub(),
      } as Partial<Router> as Router);
    });

    it('redirects GET register to idam /o/authorize', function (done) {
      const idamServiceStub = {
        getRedirectUrl: sinon.stub().returns('http://redirect_url'),
      } as Partial<IdamService> as IdamService;

      const app = express();
      app.use(setupLoginController({ idamService: idamServiceStub }));

      request(app)
        .get(Paths.register)
        .expect(302)
        .expect(
          'Location',
          `${idamUrl}/o/authorize?redirect_uri=http%3A%2F%2Fredirect_url&client_id=${idamClientId}&response_type=code&scope=openid+profile+roles`,
          done
        );
    });
  });
});
