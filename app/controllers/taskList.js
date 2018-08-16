const express = require('express');

function getTaskList(req, res) {
  res.render('task-list.html');
}

function setupTaskListController() {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get('/', getTaskList);
  return router;
}

module.exports = {
  setupTaskListController,
  getTaskList
};
