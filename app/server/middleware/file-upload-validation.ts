const multer = require('multer');
import { NextFunction, Request, Response } from 'express';
import * as config from 'config';
const i18n = require('../../../locale/en.json');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

function handleFileUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  let error: string;
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = `${i18n.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      error = i18n.questionUploadEvidence.error.invalidFileType;
    } else {
      error = i18n.questionUploadEvidence.error.fileCannotBeUploaded;
    }
    res.locals.multerError = error;
    return next();
  }
  return next(err);
}

export {
    handleFileUploadErrors
};
