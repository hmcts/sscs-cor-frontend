import { NextFunction, Request, Response } from 'express';

import { handleFileUploadErrors } from 'app/server/middleware/file-upload-validation';
import * as config from 'config';
import { expect, sinon } from '../../../chai-sinon';

const multer = require('multer');
const content = require('locale/content');

describe('#handleFileUploadErrors middleware', function () {
  const req: Request = null;
  let res: Response = null;
  let next: NextFunction = null;
  let sandbox: sinon.SinonSandbox = null;
  let maxFileSizeInMb: number = null;

  before(function () {
    maxFileSizeInMb = config.get('evidenceUpload.maxDocumentFileSizeInMb');
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    res = {
      locals: {},
    } as any;
    next = sandbox.stub().resolves();
  });

  it('should catch multer LIMIT_FILE_SIZE error', function () {
    handleFileUploadErrors(
      new multer.MulterError('LIMIT_FILE_SIZE'),
      req,
      res,
      next
    );
    expect(res.locals.multerError).to.equal(
      `${content.en.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer LIMIT_FILE_TYPE error', function () {
    handleFileUploadErrors(
      new multer.MulterError('LIMIT_FILE_TYPE'),
      req,
      res,
      next
    );
    expect(res.locals.multerError).to.equal(
      content.en.questionUploadEvidence.error.invalidFileType
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer LIMIT_UNEXPECTED_FILE error', function () {
    handleFileUploadErrors(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE'),
      req,
      res,
      next
    );
    expect(res.locals.multerError).to.equal(
      content.en.questionUploadEvidence.error.limitOnlyDocument
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer generic error', function () {
    handleFileUploadErrors(new multer.MulterError(), req, res, next);
    expect(res.locals.multerError).to.equal(
      content.en.questionUploadEvidence.error.fileCannotBeUploaded
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch error and call next with it', function () {
    const error = new Error('An error');
    handleFileUploadErrors(error, req, res, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
