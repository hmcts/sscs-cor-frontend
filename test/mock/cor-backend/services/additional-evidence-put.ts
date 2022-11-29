const { promisify } = require('util');
const fs = require('fs');
const moment = require('moment');
const cache = require('memory-cache');
const uuid = require('uuid/v4');

const writeFile = promisify(fs.writeFile);

function cacheEvidence(hearingId, file) {
  const evidence = cache.get(`${hearingId}.evidence`) || [];
  cache.put(`${hearingId}.evidence`, evidence.concat(file));
}

export = {
  path: '/api/continuous-online-hearings/:onlineHearingId/evidence',
  method: 'PUT',
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

    cacheEvidence(req.params.onlineHearingId, res.body);
    next();
  },
};
