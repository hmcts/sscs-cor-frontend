import { NextFunction, Request, Response } from 'express';
import config from 'config';
import * as path from 'path';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';
import multer, { FileFilterCallback, MulterError } from 'multer';
import * as AppInsights from '../app-insights';
import {
  mimeTypes,
  mimeTypesWithAudioVideo,
  fileTypes,
  fileTypesWithAudioVideo,
} from '../data/typeWhitelist.json';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import content from '../../common/locale/content.json';

import i18next from 'i18next';

const logger: LoggerInstance = Logger.getLogger('fileUpload');

const unexpectedFileErrorCode = 'LIMIT_UNEXPECTED_FILE';
const FileTypeErrorCode = 'LIMIT_FILE_TYPE';

// eslint-disable-next-line no-magic-numbers
const bytesInMegaByte = Math.pow(2, 20);

type FileErrorCode = 'LIMIT_FILE_TYPE';

export class FileError extends Error {
  code: FileErrorCode;
  constructor(code: FileErrorCode) {
    super(code);
    this.code = code;
  }
}

export function megaBytesToBytes(size: number): number {
  return size * bytesInMegaByte;
}

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const maxDocumentFileSize = megaBytesToBytes(maxFileSizeInMb);
const maxAudioVideoFileSizeInMb: number = config.get(
  'evidenceUpload.maxAudioVideoFileSizeInMb'
);
const maxAudioVideoFileSize = megaBytesToBytes(maxAudioVideoFileSizeInMb);

export function handleFileUploadErrors(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let multerError: string = null;
  if (error instanceof MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        multerError = `${
          content[i18next.language].questionUploadEvidence.error.tooLarge
        } ${maxFileSizeInMb}MB.`;
        break;
      case unexpectedFileErrorCode:
        multerError =
          content[i18next.language].questionUploadEvidence.error
            .limitOnlyDocument;
        break;
      default:
        multerError =
          content[i18next.language].questionUploadEvidence.error
            .fileCannotBeUploaded;
        break;
    }
    res.locals.multerError = multerError;
    return next();
  }
  if (error instanceof FileError) {
    if (error.code === FileTypeErrorCode) {
      multerError =
        content[i18next.language].questionUploadEvidence.error.invalidFileType;
    } else {
      multerError =
        content[i18next.language].questionUploadEvidence.error
          .fileCannotBeUploaded;
    }
    res.locals.multerError = multerError;
    return next();
  }
  return next(error);
}

export function validateFileSize(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const file: Express.Multer.File = req.file;
  if (file) {
    let error: string = null;
    const fileExtension = path.extname(file.originalname).toLocaleLowerCase();
    console.log(fileExtension);
    if (
      mimeTypes.includes(file.mimetype) &&
      fileTypes.includes(fileExtension) &&
      file.size > maxDocumentFileSize
    ) {
      error = `${
        content[i18next.language].questionUploadEvidence.error.tooLarge
      } ${maxFileSizeInMb}MB.`;
      res.locals.multerError = error;
      req.file = null;
      return next();
    }
  }
  return next();
}

export function fileTypeInWhitelist(
  req: Request,
  file: Express.Multer.File,
  filterCallback: FileFilterCallback
): void {
  const fileExtension = path.extname(file.originalname).toLocaleLowerCase();
  if (mimeTypes.includes(file.mimetype) && fileTypes.includes(fileExtension)) {
    filterCallback(null, true);
  } else if (
    mimeTypesWithAudioVideo.includes(file.mimetype) &&
    fileTypesWithAudioVideo.includes(fileExtension)
  ) {
    const caseId = req.session.case?.case_id;
    logger.info(
      `[${caseId}] Allowed only upload letter, document or photo evidence on this page, file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Allowed only upload letter, document or photo evidence on this page, file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    filterCallback(new MulterError(unexpectedFileErrorCode));
  } else {
    const caseId = req.session.case?.case_id;
    logger.info(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    filterCallback(new FileError(FileTypeErrorCode));
  }
}

export function fileTypeAudioVideoInWhitelist(
  req: Request,
  file: Express.Multer.File,
  filterCallback: FileFilterCallback
): void {
  const fileExtension = path.extname(file.originalname).toLocaleLowerCase();
  if (
    mimeTypesWithAudioVideo.includes(file.mimetype) &&
    fileTypesWithAudioVideo.includes(fileExtension)
  ) {
    filterCallback(null, true);
  } else {
    const caseId = req.session.case?.case_id;
    logger.info(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    filterCallback(new FileError(FileTypeErrorCode));
  }
}

export const upload = multer({
  limits: { fileSize: maxDocumentFileSize },
  fileFilter: fileTypeInWhitelist,
}).single('additional-evidence-file');

export const uploadAudioVideo = multer({
  limits: { fileSize: maxAudioVideoFileSize },
  fileFilter: fileTypeAudioVideoInWhitelist,
}).single('additional-evidence-audio-video-file');
