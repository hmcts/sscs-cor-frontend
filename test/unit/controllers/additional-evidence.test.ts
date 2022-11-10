import * as config from 'config';
import {
  getAboutEvidence,
  getAdditionalEvidence,
  postEvidenceStatement,
  postAdditionalEvidence,
  postFileUpload,
  fileTypeInWhitelist,
  fileTypeAudioVideoInWhitelist,
} from 'app/server/controllers/additional-evidence';
import * as Paths from 'app/server/paths';

import * as AppInsights from 'app/server/app-insights';
import { EvidenceDescriptor } from 'app/server/services/additional-evidence';
import { Feature, isFeatureEnabled } from 'app/server/utils/featureEnabled';
import { NextFunction, Response } from 'express';
import { expect, sinon } from '../../chai-sinon';

const multer = require('multer');
const content = require('locale/content');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const maxAudioVideoFileSizeInMb: number = config.get(
  'evidenceUpload.maxAudioVideoFileSizeInMb'
);

describe('controllers/additional-evidence.js', () => {
  let req;
  let res: Response;
  let next: NextFunction;
  let additionalEvidenceService;
  let sandbox: sinon.SinonSandbox;

  const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');

  const accessToken = 'accessToken';
  const serviceToken = 'serviceToken';
  const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {
        action: '',
      },
      session: {
        accessToken,
        serviceToken,
        hearing: {
          online_hearing_id: '',
          case_reference: 'mockedCaseRef',
          case_id: '1234567890',
        },
        appeal: {
          benefitType: 'UC',
        },
        additional_evidence: {},
      },
      body: {},
      file: null,
      query: {},
      cookies: {},
    } as any;

    req.cookies[Feature.POST_BULK_SCAN] = 'false';
    res = {
      render: sandbox.spy(),
      redirect: sandbox.spy(),
      locals: {},
    } as any;
    additionalEvidenceService = {
      getEvidences: sandbox.stub().resolves([]),
      uploadEvidence: sandbox.stub().resolves(),
      submitSingleEvidences: sandbox.stub().resolves(),
      removeEvidence: sandbox.stub().resolves(),
    };
    next = sandbox.stub().resolves();
    sandbox.stub(AppInsights, 'trackException');
    sandbox.stub(AppInsights, 'trackTrace');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render about evidence page', () => {
    getAboutEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/about-evidence.njk'
    );
  });

  it('should pass "options" as argument to view if param action empty', async () => {
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'options',
        benefitType: 'UC',
        postBulkScan: false,
      }
    );
  });

  it('should pass "upload" as argument to view if param action is "upload"', async () => {
    const description = 'this is a description for the files to be upload';
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    const caseId = '1234567890';
    req.session.hearing.case_id = caseId;
    req.session.additional_evidence.description = description;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(
      additionalEvidenceService.getEvidences
    ).to.have.been.calledOnce.calledWith(caseId);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'upload',
        description,
        evidences: [],
      }
    );
  });

  it('should catch error and track Excepction with AppInsights', async () => {
    additionalEvidenceService = {
      getEvidences: sandbox.stub().rejects(error),
    };
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    const caseId = '1234567890';
    req.session.hearing.case_id = caseId;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(
      additionalEvidenceService.getEvidences
    ).to.have.been.calledOnce.calledWith(caseId);
    expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
      error
    );
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('should pass "statement" as argument to view if param action is "statement"', async () => {
    req.params.action = 'statement';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'statement',
        postBulkScan: false,
        benefitType: 'UC',
      }
    );
  });

  it('should pass "post" as argument to view if param action is "post"', async () => {
    req.params.action = 'post';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'post',
        postBulkScan: false,
        benefitType: 'UC',
      }
    );
  });

  it('should pass "options" as argument to view if param action is other', async () => {
    req.params.action = 'no-valid-argument';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'options',
        postBulkScan: false,
        benefitType: 'UC',
      }
    );
  });

  describe('#postAdditionalEvidence', () => {
    it('should render the send by post additional evidence page', () => {
      req.body['additional-evidence-option'] = 'post';
      postAdditionalEvidence(req, res);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.additionalEvidence}/${req.body['additional-evidence-option']}`
      );
    });
  });

  describe('#postEvidenceStatement', () => {
    let additionalEvidenceService;
    beforeEach(() => {
      additionalEvidenceService = {
        saveStatement: sandbox.stub().resolves(),
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save statement and redirect to confirmation page', async () => {
      req.body['question-field'] = 'My amazing statement';
      req.session.hearing.online_hearing_id = 'hearingId';
      const caseId = '1234567890';
      req.session.hearing.case_id = caseId;
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(
        additionalEvidenceService.saveStatement
      ).to.have.been.calledOnce.calledWith(
        caseId,
        req.body['question-field'],
        req
      );
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `[${caseId}] - User has provided a statement`
      );
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.additionalEvidence}/confirm`
      );
    });

    it('should not save statement and render index page with validation error', async () => {
      req.body['question-field'] = '';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith(
        'additional-evidence/index.njk',
        {
          action: 'statement',
          pageTitleError: true,
          error: content.en.question.textareaField.errorOnSave.empty,
        }
      );
    });

    it('should call next and appInsights with the error when there is one', async () => {
      req.body['question-field'] = 'My amazing answer';
      additionalEvidenceService.saveStatement.rejects(error);
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('#postFileUpload', () => {
    it('should catch error and track Excepction with AppInsights', async () => {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sandbox.stub().rejects(error),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(
        req.session.hearing.case_id,
        req.file
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should send error message for file upload error', async () => {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sandbox.stub().resolves({
          id: null,
        }),
      };
      const description = 'this is a description for the files to be upload';
      req.session.additional_evidence.description = description;
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(
        req.session.hearing.case_id,
        req.file
      );
      expect(res.render).to.have.been.calledOnce.calledWith(
        'additional-evidence/index.njk',
        {
          action: 'upload',
          pageTitleError: true,
          description: '',
          fileUploadError:
            content.en.additionalEvidence.evidenceUpload.error
              .fileCannotBeUploaded,
        }
      );
    });

    it('should upload file and render upload page', async () => {
      req.file = {
        name: 'myfile.txt',
        buffer: new Buffer('some content'),
      };
      additionalEvidenceService = {
        uploadEvidence: sandbox.stub().resolves({
          id: '1',
          statusCode: 200,
        }),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(
        req.session.hearing.case_id,
        req.file
      );
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${Paths.additionalEvidence}/upload`
      );
      expect(AppInsights.trackTrace).to.have.been.calledOnce;
    });

    it('should delete file and render upload page', async () => {
      req.body.delete = { fileId1: 'Delete' };
      const fileId = 'fileId1';
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.removeEvidence
      ).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, fileId);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${Paths.additionalEvidence}/upload`
      );
    });

    it('should catch error trying to delete file and track Exception with AppInsights', async () => {
      req.body.delete = { fileId1: 'Delete' };
      const fileId = 'fileId1';
      additionalEvidenceService = {
        removeEvidence: sandbox.stub().rejects(error),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.removeEvidence
      ).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, fileId);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should show errors when no files submitted and missing descr', async () => {
      req.body.buttonSubmit = 'there';
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(res.render).to.have.been.calledOnce.calledWith(
        `additional-evidence/index.njk`,
        {
          action: 'upload',
          pageTitleError: true,
          evidences: [],
          description: '',
          error:
            content.en.additionalEvidence.evidenceUpload.error.emptyDescription,
          fileUploadError:
            content.en.additionalEvidence.evidenceUpload.error.noFilesUploaded,
        }
      );
    });

    it('should submit evidences and description and redirect to confirmation page', async () => {
      req.body.buttonSubmit = 'there';
      const caseId = req.session.hearing.case_id;
      const evidence: EvidenceDescriptor = {
        created_date: "2018-10-24'T'12:11:21Z",
        file_name: 'some_file_name.txt',
        id: '8f79deb3-5d7a-4e6f-846a-a8131ac6a3bb',
        statusCode: 200,
      };
      additionalEvidenceService = {
        getEvidences: sandbox.stub().resolves([evidence]),
        submitEvidences: sandbox.stub().resolves(),
      };
      const description = 'this is a description for the files to be upload';
      req.body['additional-evidence-description'] = description;

      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.submitEvidences
      ).to.have.been.calledOnce.calledWith(caseId, description, req);
      expect(req.session.additional_evidence.description).to.equal('');
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `[${caseId}] - User has uploaded a total of 1 file(s)`
      );
    });

    it('should show errors when file size is bigger than certain limit', async () => {
      const fileSizeErrorMsg = `${content.en.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
      res.locals.multerError = fileSizeErrorMsg;
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(res.render).to.have.been.calledOnce.calledWith(
        `additional-evidence/index.njk`,
        {
          action: 'upload',
          pageTitleError: true,
          evidences: [],
          description: '',
          fileUploadError: fileSizeErrorMsg,
        }
      );
    });

    it('should show errors when audio/video file size is bigger than certain limit', async () => {
      const fileSizeErrorMsg = `${content.en.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
      res.locals.multerError = fileSizeErrorMsg;
      await postFileUpload('uploadAudioVideo', additionalEvidenceService)(
        req,
        res,
        next
      );

      expect(res.render).to.have.been.calledOnce.calledWith(
        `additional-evidence/index.njk`,
        {
          action: 'uploadAudioVideo',
          pageTitleError: true,
          description: '',
          fileUploadError: fileSizeErrorMsg,
        }
      );
    });

    it('should redirect to Task List if no file to upload or delete', async () => {
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });

    it('should submit audio/video evidences and description and redirect to confirmation page', async () => {
      req.body.buttonSubmit = 'there';
      const caseId = req.session.hearing.case_id;
      req.file = { name: 'myfile.mp3' };
      additionalEvidenceService = {
        submitSingleEvidences: sandbox.stub().resolves(),
      };
      const description = 'this is a description for the files to be upload';
      req.body['additional-evidence-description'] = description;

      await postFileUpload('uploadAudioVideo', additionalEvidenceService)(
        req,
        res,
        next
      );

      expect(
        additionalEvidenceService.submitSingleEvidences
      ).to.have.been.calledOnce.calledWith(caseId, description, req.file, req);
      expect(req.session.additional_evidence.description).to.equal('');
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `[${caseId}] - User has uploaded a file`
      );
    });
  });

  describe('#fileTypeInWhitelist', () => {
    const cb = sinon.stub();
    const file = {
      mimetype: 'image/png',
      originalname: 'someImage.png',
    };

    beforeEach(() => {
      cb.resetHistory();
    });

    it('file is in whitelist', () => {
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWith(null, true);
    });

    it('file mime type is not in whitelist', () => {
      file.mimetype = 'plain/disallowed';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file extension type is not in whitelist', () => {
      file.originalname = 'disallowed.file';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file does not have an extension ', () => {
      file.originalname = 'disallowedfile';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file is audio ', () => {
      file.originalname = 'audio.MP3';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file is audio with feature flag on', () => {
      file.originalname = 'audio.MP3';
      file.mimetype = 'audio/mp3';
      req.cookies[Feature.MEDIA_FILES_ALLOWED_ENABLED] = 'true';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_UNEXPECTED_FILE')
      );
    });
  });

  describe('#fileTypeAudioVideoInWhitelist', () => {
    const cb = sinon.stub();
    const file = {
      mimetype: 'audio/mp3',
      originalname: 'someImage.mp3',
    };

    beforeEach(() => {
      cb.resetHistory();
    });

    it('file is in whitelist', () => {
      file.mimetype = 'audio/mp3';
      req.cookies[Feature.MEDIA_FILES_ALLOWED_ENABLED] = 'true';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWith(null, true);
    });

    it('file mime type is not in whitelist', () => {
      file.mimetype = 'plain/disallowed';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file extension type is not in whitelist', () => {
      file.originalname = 'disallowed.file';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file does not have an extension ', () => {
      file.originalname = 'disallowedfile';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file is audio ', () => {
      file.originalname = 'audio.MP3';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(
        new multer.MulterError('LIMIT_FILE_TYPE')
      );
    });

    it('file is audio with feature flag on', () => {
      file.originalname = 'audio.MP3';
      file.mimetype = 'audio/mp3';
      req.cookies[Feature.MEDIA_FILES_ALLOWED_ENABLED] = 'true';
      fileTypeAudioVideoInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWith(null, true);
    });
  });
});
