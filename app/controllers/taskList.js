const appInsights = require('app-insights');
const express = require('express');

function getTaskList(getAllQuestionsService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    try {
      const questions = await getAllQuestionsService(hearingId);
      res.render('task-list.html', Object.assign({ hearingId }, questions));
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get('/:hearingId', getTaskList(deps.getAllQuestionsService));
  return router;
}

module.exports = {
  setupTaskListController,
  getTaskList
};
