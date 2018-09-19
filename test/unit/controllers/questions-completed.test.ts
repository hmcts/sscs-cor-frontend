const { expect, sinon } = require('test/chai-sinon');
const { setupQuestionsCompletedController, getQuestionsCompleted } = require('app/server/controllers/questions-completed.ts');
import * as moment from 'moment';
const express = require('express');
import { Paths } from 'app/server/paths';

describe('controllers/questions-completed.js', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      session: {
        questionsCompletedThisSession: true
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getQuestionsCompleted', () => {

    const nextCorrespondenceDate = moment().utc().add(7, 'days');

    it('renders questions completed page with next correspondence date', async() => {
      await getQuestionsCompleted(req, res);
 
      const theTemplate = res.render.getCall(0).args[0];
      const theCorrespondenceDate = res.render.getCall(0).args[1].nextCorrespondenceDate;

      expect(theTemplate).to.equal('questions-completed.html');
      expect(moment(theCorrespondenceDate).format('LL')).to.equal(moment(nextCorrespondenceDate).format('LL'));

    });

    it('redirects to /task-list if questions were not completed in this session', async() => {
      delete req.session.questionsCompletedThisSession;
      await getQuestionsCompleted(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });
  });

  describe('setupQuestionsCompletedController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub()
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionsCompletedController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.completed);
    });

    it('returns the router', () => {
      const controller = setupQuestionsCompletedController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
