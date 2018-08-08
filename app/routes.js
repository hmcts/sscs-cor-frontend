const express = require('express');
const paths = require('paths');

/* eslint-disable new-cap */
const router = express.Router();
/* eslint-enable new-cap */

router.get(paths.helloWorld, (req, res) => {
  res.render('hello-world.html');
});

module.exports = router;
