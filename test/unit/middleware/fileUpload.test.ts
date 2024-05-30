import { NextFunction, Request, Response } from 'express';
import {
  FileError,
  fileTypeAudioVideoInWhitelist,
  fileTypeInWhitelist,
  handleFileUploadErrors,
  validateFileSize,
} from 'app/server/middleware/fileUpload';
import config from 'config';
import { expect, sinon } from '../../chai-sinon';
import { Feature } from 'app/server/utils/featureEnabled';
import { SinonStub } from 'sinon';
import { before } from 'mocha';
import { SessionData } from 'express-session';
import { MulterError } from 'multer';
import content from 'app/common/locale/content.json';

describe('fileUpload middleware', function () {
  const caseId = 1234;
  const session = {
    case: {
      case_id: caseId,
    },
  } as Partial<SessionData> as SessionData;
  const req = {
    session,
    cookies: {},
  } as Request;
  let res: Response = null;
  let next: NextFunction = null;

  let sandbox: sinon.SinonSandbox = null;
  let maxFileSizeInMb: number = null;
  let maxDocumentFileSizeInMb: number = null;

  let filterCallbackStub: SinonStub = null;

  const unexpectedFileErrorCode = 'LIMIT_UNEXPECTED_FILE';
  const FileTypeErrorCode = 'LIMIT_FILE_TYPE';

  before(function () {
    filterCallbackStub = sinon.stub().resolves();
    maxFileSizeInMb = config.get('evidenceUpload.maxDocumentFileSizeInMb');
    maxDocumentFileSizeInMb = config.get(
      'evidenceUpload.maxDocumentFileSizeInMb'
    );
  });

  describe('#handleFileUploadErrors', function () {
    beforeEach(function () {
      sandbox = sinon.createSandbox();
      res = {
        locals: {},
      } as any;
      next = sandbox.stub().resolves();
    });

    it('should catch multer LIMIT_FILE_SIZE error', function () {
      handleFileUploadErrors(
        new MulterError('LIMIT_FILE_SIZE'),
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
      handleFileUploadErrors(new FileError(FileTypeErrorCode), req, res, next);
      expect(res.locals.multerError).to.equal(
        content.en.questionUploadEvidence.error.invalidFileType
      );
      expect(next).to.have.been.calledOnce.calledWith();
    });

    it('should catch multer LIMIT_UNEXPECTED_FILE error', function () {
      handleFileUploadErrors(
        new MulterError(unexpectedFileErrorCode),
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
      handleFileUploadErrors(new MulterError(null), req, res, next);
      expect(res.locals.multerError).to.equal(
        content.en.questionUploadEvidence.error.fileCannotBeUploaded
      );
      expect(next).to.have.been.calledOnce.calledWith();
    });

    it('should catch FileError generic error', function () {
      handleFileUploadErrors(new FileError(null), req, res, next);
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

  describe('#validateFileSize', function () {
    beforeEach(function () {
      sandbox = sinon.createSandbox();
      req.file = {
        originalname: 'word.docx',
        mimetype: 'application/msword',
        size: 104857600,
      } as Express.Multer.File;
      res = {
        locals: {},
      } as any;
      next = sandbox.stub().resolves();
    });

    it('should not filter when no file', function () {
      req.file = null;
      validateFileSize(req, res, next);
      expect(res.locals.multerError).to.equal(undefined);
      expect(next).to.have.been.calledOnce.calledWith();
    });

    it('should catch custom multer LIMIT_FILE_SIZE error', function () {
      req.file = {
        originalname: 'word.docx',
        mimetype: 'application/msword',
        size: 104857600,
      } as Express.Multer.File;

      validateFileSize(req, res, next);
      expect(res.locals.multerError).to.equal(
        `${content.en.questionUploadEvidence.error.tooLarge} ${maxDocumentFileSizeInMb}MB.`
      );
      expect(next).to.have.been.calledOnce.calledWith();
    });

    it('should allow file under the size limit', function () {
      req.file = {
        originalname: 'word.docx',
        mimetype: 'application/msword',
        size: 1000,
      } as Express.Multer.File;

      validateFileSize(req, res, next);
      expect(res.locals.multerError).to.equal(undefined);
      expect(next).to.have.been.calledOnce.calledWith();
    });
  });

  describe('#fileTypeInWhitelist', function () {
    const file = {
      mimetype: 'image/png',
      originalname: 'someImage.png',
    } as Partial<Express.Multer.File> as Express.Multer.File;

    beforeEach(function () {
      session.case = {
        appellant_name: '',
        case_reference: '',
        online_hearing_id: '',
        case_id: caseId,
      };
      filterCallbackStub.resetHistory();
    });

    it('file is in whitelist', function () {
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWith(null, true);
    });

    it('file mime type is not in whitelist', function () {
      file.mimetype = 'plain/disallowed';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file extension type is not in whitelist', function () {
      file.originalname = 'disallowed.file';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file does not have an extension ', function () {
      file.originalname = 'disallowedfile';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file is audio ', function () {
      file.originalname = 'audio.MP3';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('returns correct LIMIT_FILE_TYPE error when case is null', function () {
      session.case = null;
      file.originalname = 'audio.MP3';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file is audio with feature flag on', function () {
      file.originalname = 'audio.MP3';
      file.mimetype = 'audio/mp3';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch(
        new MulterError(unexpectedFileErrorCode)
      );
    });

    it('returns correct LIMIT_UNEXPECTED_FILE error when case is null', function () {
      session.case = null;
      file.originalname = 'audio.MP3';
      file.mimetype = 'audio/mp3';
      fileTypeInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch(
        new MulterError(unexpectedFileErrorCode)
      );
    });
  });

  describe('#fileTypeAudioVideoInWhitelist', function () {
    const file = {
      mimetype: 'audio/mp3',
      originalname: 'someImage.mp3',
    } as Partial<Express.Multer.File> as Express.Multer.File;

    beforeEach(function () {
      session.case = {
        appellant_name: '',
        case_reference: '',
        online_hearing_id: '',
        case_id: caseId,
      };
      filterCallbackStub.resetHistory();
    });

    it('file is in whitelist', function () {
      file.mimetype = 'audio/mp3';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWith(null, true);
    });

    it('file mime type is not in whitelist', function () {
      file.mimetype = 'plain/disallowed';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file extension type is not in whitelist', function () {
      file.originalname = 'disallowed.file';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file does not have an extension ', function () {
      file.originalname = 'disallowedfile';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file is audio ', function () {
      file.originalname = 'audio.MP3';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('returns correct LIMIT_FILE_TYPE error when case is null', function () {
      file.originalname = 'audio.MP3';
      session.case = null;
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWithMatch({
        code: FileTypeErrorCode,
      });
    });

    it('file is audio with feature flag on', function () {
      file.originalname = 'audio.MP3';
      file.mimetype = 'audio/mp3';
      fileTypeAudioVideoInWhitelist(req, file, filterCallbackStub);
      expect(filterCallbackStub).to.have.been.calledOnce.calledWith(null, true);
    });
  });
});
