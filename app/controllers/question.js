const appInsights = require('app-insights');
const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

function question(req, res, next) {
  const hearingId = req.params.hearingId;
  const questionId = req.params.questionId;

  return request
    .get(`${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`)
    .then(response => {
      res.render('question.html', { header: response.body.question_header_text });
    })
    .catch(error => {
      appInsights.trackException(error);
      next(error);
    });
}

module.exports = question;
