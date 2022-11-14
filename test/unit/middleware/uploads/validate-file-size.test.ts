import { NextFunction, Response } from 'express';

import { validateFileSize } from 'app/server/middleware/file-upload-validation';
import * as config from 'config';
import { Feature } from 'app/server/utils/featureEnabled';
import { expect, sinon } from '../../../chai-sinon';

const content = require('locale/content');

describe('#validateFileSize middleware', function () {
  const req: any = { cookies: {} };
  let res: Response = null;
  let next: NextFunction = null;
  let sandbox: sinon.SinonSandbox = null;
  let maxDocumentFileSizeInMb: number = null;

  before(function () {
    maxDocumentFileSizeInMb = config.get(
      'evidenceUpload.maxDocumentFileSizeInMb'
    );
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    req.file = {
      originalname: 'word.docx',
      mimetype: 'application/msword',
      size: 104857600,
    };
    req.cookies[Feature.MEDIA_FILES_ALLOWED_ENABLED] = 'true';
    res = {
      locals: {},
    } as any;
    next = sandbox.stub().resolves();
  });

  it('should catch custom multer LIMIT_FILE_SIZE error', function () {
    req.file = {
      originalname: 'word.docx',
      mimetype: 'application/msword',
      size: 104857600,
    };

    validateFileSize(req, res, next);
    expect(res.locals.multerError).to.equal(
      `${content.en.questionUploadEvidence.error.tooLarge} ${maxDocumentFileSizeInMb}MB.`
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });
});
