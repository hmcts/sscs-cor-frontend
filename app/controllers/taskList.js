const appInsights = require('app-insights');
const express = require('express');
const paths = require('paths');

function getTaskList(getAllQuestionsService) {
  return async(req, res, next) => {
    const hearing = req.session.hearing;
    try {
      const questions = await getAllQuestionsService(hearing.online_hearing_id);
      res.render('task-list.html', questions);
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get(paths.taskList, deps.ensureAuthenticated, getTaskList(deps.getAllQuestionsService));
  return router;
}

module.exports = {
  setupTaskListController,
  getTaskList
};
