import * as request from 'supertest';
import * as session from 'express-session';
import express = require('express');
import { setup } from '../../app/server/app';
import { expect } from 'test/chai-sinon';
const content = require('locale/content');
const { createSession } = require('../../app/server/middleware/session');
const HttpStatus = require('http-status-codes');
const tribunalApiUrl = require('config').get('tribunals.api-url');
const nock = require('nock');
import { CONST } from '../../app/constants';
import moment = require('moment');

const dysonSetupCorBackend = require('../mock/cor-backend/dysonSetup');
const dysonSetupCoh = require('../mock/coh/dysonSetup');
const dysonSetupIdam = require('../mock/idam/dysonSetup');
const dysonSetupS2s = require('../mock/s2s/dysonSetup');

describe('Routes', () => {
  let app;
  before(() => {
    app = setup(createSession(), { disableAppInsights: true });
    dysonSetupCorBackend();
    dysonSetupCoh();
    dysonSetupIdam();
    dysonSetupS2s();

    // Mock GET /tokens/macToken
    nock(tribunalApiUrl)
    .persist()
    .get('/tokens/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=')
    .reply(HttpStatus.OK, {
      token: {
        appealId: 'md005',
        subscriptionId: 1,
        benefitType: 'pip',
        decryptedToken: '3|1487025828|147plJ7kQ7'
      }
    });

    // Mock POST /appeals/id/subscriptions/id
    nock(tribunalApiUrl)
    .post('/appeals/md005/subscriptions/1', { subscription: { email: 'person@example.com' } })
    .reply(HttpStatus.OK);

    // Mock DELETE /appeals/id/subscriptions/id
    nock(tribunalApiUrl)
    .delete('/appeals/md005/subscriptions/1')
    .reply(HttpStatus.OK);

  });

  describe('Non secured routes', () => {
    it('GET / responds with 200', (done) => {
      request(app)
        .get('/')
        .expect(302)
        .expect('Location', '/sign-in', done);
    });
    it.skip('GET /sign-in responds with 200', (done) => {
      request(app)
        .get('/sign-in')
        .expect(302)
        .expect('Location', 'http://localhost:8082/login?redirect_uri=http%3A%2F%2F127.0.0.1%2Fsign-in&client_id=sscs&response_type=code', done);
    });
    it.skip('GET /health responds with 200', (done) => {
      request(app)
        .get('/health')
        .expect(200, done);
    });
    it.skip('GET /readiness responds with 200', (done) => {
      request(app)
        .get('/readiness')
        .expect(200, done);
    });
  });

  describe('/manage-email-notifications/mactoken', () => {
    const url = '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=';

    it('should respond with a HTTP 200 when performing a GET', done => {
      request(app)
      .get(url)
      .expect(HttpStatus.OK, done);
    });

    it('should respond with a HTTP 400 when POSTing an \'unknown\' type', done => {
      request(app)
      .post(url)
      .send({ type: 'unknown' })
      .expect(HttpStatus.BAD_REQUEST, done);
    });
  });

  describe('/manage-email-notifications/mactoken/stop', () => {
    it('should respond with a HTTP 200 when performing a GET', done => {
      request(app)
      .get('/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/stop')
      .expect(HttpStatus.OK, done);
    });
  });

  describe('/manage-email-notifications/mactoken/stopconfirm', () => {
    it('should respond with a HTTP 200 when performing a GET', done => {
      request(app)
      .get('/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/stopconfirm')
      .expect(HttpStatus.OK, done);
    });
  });

  describe('/validate-surname/tya/trackyourappeal', () => {
    it('should respond with a HTTP 200 when performing a GET', done => {
      request(app)
      .get('/validate-surname/67sC1UvHy3/trackyourappeal')
      .expect(HttpStatus.OK, done);
    });
  });

  describe.skip('/manage-email-notifications/mactoken/change', () => {
    const url = '/manage-email-notifications/NnwxNDg3MDY1ODI4fDExN3BsSDdrVDc=/change';

    it('should respond with a HTTP 200 when POSTing both email addresses', done => {
      request(app)
      .post(url)
      .send({
        email: 'person@example.com',
        confirmEmail: 'person@example.com'
      })
      .expect(HttpStatus.OK, done);
    });

    it('should respond with a HTTP 400 when POSTing empty strings', done => {
      request(app)
      .post(url)
      .send({
        email: '',
        confirmEmail: ''
      })
      .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should respond with a HTTP 400 when POSTing non email addresses', done => {
      request(app)
      .post(url)
      .send({
        email: 'rubb@ish',
        confirmEmail: 'rubb@ish'
      })
      .expect(HttpStatus.BAD_REQUEST, done);
    });

    it('should respond with a 400 when POSTing email address that do not match', done => {
      request(app)
      .post(url)
      .send({
        email: 'person@example.com',
        confirmEmail: 'person@example.net'
      })
      .expect(HttpStatus.BAD_REQUEST, done);
    });
  });

  describe('Secured routes', () => {
    const mockApp = express();
    before(() => {
      mockApp.use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'session.redis.secret'
      }));
    });

    describe.skip('Tasklist Routes', () => {
      before(() => {
        mockApp.all('*', function(req, res, next) {
          req.session['accessToken'] = 'mock uid';
          req.session['hearing'] = {
            appellant_name: 'Adam Jenkins',
            case_reference: '112233',
            online_hearing_id: '2-completed'
          };
          next();
        });
        mockApp.use(app);
      });

      it('GET /task-list should return 200 as user is authenticated', (done) => {
        request(mockApp)
          .get('/task-list')
          .expect(200, done);
      });
      it('GET /about-evidence should return 200', async () => {
        const response = await request(mockApp).get('/about-evidence');
        expect(response.status).to.be.equal(200);
      });

      it('GET /post-evidence should return 200', async () => {
        const response = await request(mockApp).get('/post-evidence');
        expect(response.status).to.be.equal(200);
      });
    });
  });
});
