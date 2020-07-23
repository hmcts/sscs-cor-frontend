const multer = require('multer');
import { NextFunction, Request, Response } from 'express';
const { expect, sinon } = require('test/chai-sinon');
import { handleFileUploadErrors } from 'app/server/middleware/file-upload-validation';
import * as config from 'config';
const content = require('locale/content');

describe('#handleFileUploadErrors middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;
  const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    res = {
      locals: {}
    } as any;
    next = sandbox.stub();
  });

  it('should catch multer LIMIT_FILE_SIZE error', () => {
    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_SIZE'), req, res, next);
    expect(res.locals.multerError).to.equal(`${content.en.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer LIMIT_FILE_TYPE error', () => {
    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_TYPE'), req, res, next);
    expect(res.locals.multerError).to.equal(content.en.questionUploadEvidence.error.invalidFileType);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer generic error', () => {
    handleFileUploadErrors(new multer.MulterError(), req, res, next);
    expect(res.locals.multerError).to.equal(content.en.questionUploadEvidence.error.fileCannotBeUploaded);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch error and call next with it', () => {
    const error = new Error('An error');
    handleFileUploadErrors(error, req, res, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
