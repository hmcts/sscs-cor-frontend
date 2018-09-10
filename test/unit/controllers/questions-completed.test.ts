const { expect, sinon } = require('test/chai-sinon');
const { setupQuestionsCompletedController, getQuestionsCompleted } = require('app/server/controllers/questions-completed');
const moment = require('moment');
const express = require('express');
const paths = require('app/server/paths');
import { Request, Response } from 'express';

describe('controllers/questions-completed.js', () => {
  let req: Request;
  let res: Response;

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
    const nextCorrespondenceDate = moment().utc().add(7, 'days').format('D MMMM YYYY');

    it('renders questions completed page with next date', async() => {
      await getQuestionsCompleted(req, res);
      expect(res.render).to.have.been.calledWith('questions-completed.html', { nextCorrespondenceDate });
    });

    it('redirects to /task-list if questions were not completed in this session', async() => {
      delete req.session.questionsCompletedThisSession;
      await getQuestionsCompleted(req, res);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
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
      expect(express.Router().get).to.have.been.calledWith(paths.completed);
    });

    it('returns the router', () => {
      const controller = setupQuestionsCompletedController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
