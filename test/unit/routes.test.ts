import request from 'supertest';
import session from 'express-session';
import { setupApp } from 'app/server/app';
import { expect } from 'test/chai-sinon';
import config from 'config';
import { BAD_REQUEST, OK } from 'http-status-codes';
import nock from 'nock';
import express, { Application } from 'express';
import { createSession } from 'app/server/middleware/session';
import { dysonSetupIdam } from '../mock/idam/dysonSetup';
import { dysonSetupS2s } from '../mock/s2s/dysonSetup';

describe('Routes', function () {
  let tribunalApiUrl: string = null;
  let app: Application = null;

  before(async function () {
    tribunalApiUrl = config.get('tribunals-api.url');

    app = await setupApp(createSession());
    dysonSetupIdam();
    dysonSetupS2s();

    // Mock GET /tokens/macToken
    nock(tribunalApiUrl)
      .persist()
      .get('/tokens/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=')
      .reply(OK, {
        token: {
          appealId: 'md005',
          subscriptionId: 1,
          benefitType: 'pip',
          decryptedToken: '3|1487025828|147plJ7kQ7',
        },
      });

    // Mock POST /appeals/id/subscriptions/id
    nock(tribunalApiUrl)
      .post('/appeals/md005/subscriptions/1', {
        subscription: { email: 'person@example.com' },
      })
      .reply(OK);

    // Mock DELETE /appeals/id/subscriptions/id
    nock(tribunalApiUrl).delete('/appeals/md005/subscriptions/1').reply(OK);
  });

  describe('Non secured routes', function () {
    it('GET / responds with 200', function (done) {
      request(app).get('/').expect(302).expect('Location', '/sign-in', done);
    });
    it.skip('GET /sign-in responds with 200', function (done) {
      request(app)
        .get('/sign-in')
        .expect(302)
        .expect(
          'Location',
          'http://localhost:8082/login?redirect_uri=http%3A%2F%2F127.0.0.1%2Fsign-in&client_id=sscs&response_type=code',
          done
        );
    });
    it.skip('GET /health responds with 200', function (done) {
      request(app).get('/health').expect(200, done);
    });
    it.skip('GET /readiness responds with 200', function (done) {
      request(app).get('/readiness').expect(200, done);
    });
  });

  describe('/manage-email-notifications/mactoken', function () {
    const url = '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=';

    it('should respond with a HTTP 200 when performing a GET', function (done) {
      request(app).get(url).expect(OK, done);
    });

    it("should respond with a HTTP 400 when POSTing an 'unknown' type", function (done) {
      request(app)
        .post(url)
        .send({ type: 'unknown' })
        .expect(BAD_REQUEST, done);
    });
  });

  describe('/manage-email-notifications/mactoken/stop', function () {
    it('should respond with a HTTP 200 when performing a GET', function (done) {
      request(app)
        .get(
          '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/stop'
        )
        .expect(OK, done);
    });
  });

  describe('/manage-email-notifications/mactoken/stopconfirm', function () {
    it('should respond with a HTTP 200 when performing a GET', function (done) {
      request(app)
        .get(
          '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/stopconfirm'
        )
        .expect(OK, done);
    });
  });

  describe('/validate-surname/tya/trackyourappeal', function () {
    it('should respond with a HTTP 200 when performing a GET', function (done) {
      request(app)
        .get('/validate-surname/67sC1UvHy3/trackyourappeal')
        .expect(OK, done);
    });
  });

  describe.skip('/manage-email-notifications/mactoken/change', function () {
    const url =
      '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/change';

    it('should respond with a HTTP 200 when POSTing both email addresses', function (done) {
      request(app)
        .post(url)
        .send({
          email: 'person@example.com',
          confirmEmail: 'person@example.com',
        })
        .expect(OK, done);
    });

    it('should respond with a HTTP 400 when POSTing empty strings', function (done) {
      request(app)
        .post(url)
        .send({
          email: '',
          confirmEmail: '',
        })
        .expect(BAD_REQUEST, done);
    });

    it('should respond with a HTTP 400 when POSTing non email addresses', function (done) {
      request(app)
        .post(url)
        .send({
          email: 'rubb@ish',
          confirmEmail: 'rubb@ish',
        })
        .expect(BAD_REQUEST, done);
    });

    it('should respond with a 400 when POSTing email address that do not match', function (done) {
      request(app)
        .post(url)
        .send({
          email: 'person@example.com',
          confirmEmail: 'person@example.net',
        })
        .expect(BAD_REQUEST, done);
    });
  });

  describe('Secured routes', function () {
    let mockApp: Application;

    before(function () {
      mockApp = express();
      mockApp.use(
        session({
          resave: true,
          saveUninitialized: true,
          secret: 'session.cookie.secret',
        })
      );
    });

    describe.skip('Tasklist Routes', function () {
      before(function () {
        mockApp.all('*', function (req, res, next) {
          req.session.accessToken = 'mock uid';
          req.session.case = {
            appellant_name: 'Adam Jenkins',
            case_reference: '112233',
            online_hearing_id: '2-completed',
          };
          next();
        });
        mockApp.use(app);
      });

      it('GET /task-list should return 200 as user is authenticated', function (done) {
        request(mockApp).get('/task-list').expect(200, done);
      });
      it('GET /about-evidence should return 200', async function () {
        const response = await request(mockApp).get('/about-evidence');
        expect(response.status).to.be.equal(200);
      });

      it('GET /post-evidence should return 200', async function () {
        const response = await request(mockApp).get('/post-evidence');
        expect(response.status).to.be.equal(200);
      });
    });
  });
});
