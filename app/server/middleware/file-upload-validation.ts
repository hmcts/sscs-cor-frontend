import { NextFunction, Request, Response } from 'express';
import * as config from 'config';
import * as path from 'path';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';

const multer = require('multer');
const i18next = require('i18next');
const content = require('../../../locale/content');
const mimeTypeWhitelist = require('../utils/mimeTypeWhitelist');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const maxDocumentFileSizeInMb: number = config.get(
  'evidenceUpload.maxDocumentFileSizeInMb'
);
const evidenceMediaFilesAllowed =
  config.get('featureFlags.mediaFilesAllowed') === 'true';

function handleFileUploadErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error: string;
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = `${
        content[i18next.language].questionUploadEvidence.error.tooLarge
      } ${maxFileSizeInMb}MB.`;
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      error =
        content[i18next.language].questionUploadEvidence.error.invalidFileType;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error =
        content[i18next.language].questionUploadEvidence.error
          .limitOnlyDocument;
    } else {
      error =
        content[i18next.language].questionUploadEvidence.error
          .fileCannotBeUploaded;
    }
    res.locals.multerError = error;
    return next();
  }
  return next(err);
}

function validateFileSize(req: Request, res: Response, next: NextFunction) {
  if (isFeatureEnabled(Feature.MEDIA_FILES_ALLOWED_ENABLED, req.cookies)) {
    if (req.file) {
      let error: string;
      const fileExtension = path.extname(req.file.originalname);
      if (
        mimeTypeWhitelist.mimeTypes.includes(req.file.mimetype) &&
        mimeTypeWhitelist.fileTypes.includes(
          fileExtension.toLocaleLowerCase()
        ) &&
        req.file.size > maxDocumentFileSizeInMb * 1048576
      ) {
        error = `${
          content[i18next.language].questionUploadEvidence.error.tooLarge
        } ${maxDocumentFileSizeInMb}MB.`;
        res.locals.multerError = error;
        req.file = null;
        return next();
      }
    }
  }
  return next();
}

export { handleFileUploadErrors, validateFileSize };
