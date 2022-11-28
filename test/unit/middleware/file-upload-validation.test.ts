import { NextFunction, Request, Response } from 'express';

import {
  handleFileUploadErrors,
  validateFileSize,
} from 'app/server/middleware/file-upload-validation';
import * as config from 'config';
import { Feature, isFeatureEnabled } from 'app/server/utils/featureEnabled';
import { expect, sinon } from '../../chai-sinon';

const multer = require('multer');
const content = require('locale/content');

describe('#handleFileUploadErrors middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;
  const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    res = {
      locals: {},
    } as any;
    next = sandbox.stub().resolves();
  });

  it('should catch multer LIMIT_FILE_SIZE error', () => {
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

  it('should catch multer LIMIT_FILE_TYPE error', () => {
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

  it('should catch multer LIMIT_UNEXPECTED_FILE error', () => {
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

  it('should catch multer generic error', () => {
    handleFileUploadErrors(new multer.MulterError(), req, res, next);
    expect(res.locals.multerError).to.equal(
      content.en.questionUploadEvidence.error.fileCannotBeUploaded
    );
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch error and call next with it', () => {
    const error = new Error('An error');
    handleFileUploadErrors(error, req, res, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
describe('#validateFileSize middleware', () => {
  const req: any = { cookies: {} };
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;
  const maxFileSizeInMb: number = config.get(
    'evidenceUpload.maxDocumentFileSizeInMb'
  );
  const maxDocumentFileSizeInMb: number = config.get(
    'evidenceUpload.maxDocumentFileSizeInMb'
  );

  beforeEach(() => {
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

  it('should catch custom multer LIMIT_FILE_SIZE error', () => {
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
