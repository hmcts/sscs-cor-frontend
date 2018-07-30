const express = require('express');
const paths = require('paths');

const router = express.Router();

router.get(paths.helloWorld, (req, res) => {
  res.render('hello-world');
});

module.exports = router;
