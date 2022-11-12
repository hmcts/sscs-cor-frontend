const { promisify } = require('util');
const fs = require('fs');
const moment = require('moment');
const cache = require('memory-cache');
const uuid = require('uuid/v4');

const writeFile = promisify(fs.writeFile);

function cacheEvidence(questionId, file) {
  cache.put(`${questionId}.state`, 'draft');
  const evidence = cache.get(`${questionId}.evidence`) || [];
  cache.put(`${questionId}.evidence`, evidence.concat(file));
}

/* eslint-disable max-len */
module.exports = {
  path: '/api/continuous-online-hearings/:onlineHearingId/questions/:questionId/evidence',
  method: 'POST',
  status: async (req, res, next) => {
    const uploadedFile = req.files[0];

    await writeFile(
      `./public/files/${uploadedFile.originalname}`,
      uploadedFile.buffer
    );

    res.body = {
      id: uuid(),
      file_name: uploadedFile.originalname,
      created_date: moment.utc().format(),
    };

    cacheEvidence(req.params.questionId, res.body);

    next();
  },
};
