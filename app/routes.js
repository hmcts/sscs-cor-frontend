const express = require('express');
const paths = require('paths');

const questionController = require('app/controllers/question');

/* eslint-disable new-cap */
const router = express.Router();
/* eslint-enable new-cap */

router.get(paths.helloWorld, (req, res) => {
  res.render('hello-world.html');
});

router.get(`${paths.question}/:hearingId/:questionId`, questionController);

module.exports = router;
