const express = require('express');
const paths = require('paths');
const health = require('app/middleware/health');

/* eslint-disable new-cap */
const router = express.Router();
/* eslint-enable new-cap */

router.use('/health', health);

router.get(paths.helloWorld, (req, res) => {
  res.render('hello-world.html');
});

module.exports = router;
