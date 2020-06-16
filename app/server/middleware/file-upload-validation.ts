const multer = require('multer');
const i18next = require('i18next');
import { NextFunction, Request, Response } from 'express';
import * as config from 'config';
const content = require('../../../locale/content');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

function handleFileUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  let error: string;
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = `${content[i18next.language].questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      error = content[i18next.language].questionUploadEvidence.error.invalidFileType;
    } else {
      error = content[i18next.language].questionUploadEvidence.error.fileCannotBeUploaded;
    }
    res.locals.multerError = error;
    return next();
  }
  return next(err);
}

export {
    handleFileUploadErrors
};
