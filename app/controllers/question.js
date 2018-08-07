const appInsights = require('app-insights');
const express = require('express');
const getQuestion = require('app/middleware/getQuestion');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/:hearingId/:questionId', getQuestion);

module.exports = router;
