const { promisify } = require('util');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);

/* eslint-disable max-len */
module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId/questions/:questionId/evidence',
  method: 'POST',
  status: async(req, res, next) => {
    const file = req.files[0];

    res.body = {
      document_link: 'http://dm-store-aat.service.core-compute-aat.internal/documents/8f79deb3-5d7a-4e6f-846a-a8131ac6a3bb',
      file_name: 'some_file_name.txt'
    };

    await writeFile(`./test/mock/files/${file.originalname}`, file.buffer);
    next();
  }
};