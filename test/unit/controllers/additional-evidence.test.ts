import config from 'config';
import {
  getAboutEvidence,
  getAdditionalEvidence,
  getCaseId,
  postAdditionalEvidence,
  postEvidenceStatement,
  postFileUpload,
} from 'app/server/controllers/additional-evidence';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';
import { EvidenceDescriptor } from 'app/server/services/additional-evidence';
import { Feature } from 'app/server/utils/featureEnabled';
import { NextFunction, Response } from 'express';
import { expect, sinon } from '../../chai-sinon';
import content from 'app/common/locale/content.json';

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

import { INTERNAL_SERVER_ERROR } from 'http-status-codes';

import HttpException from 'app/server/exceptions/HttpException';

describe('controllers/additional-evidence.js', function () {
  let req;
  let res: Response;
  let next: NextFunction;
  let additionalEvidenceService;

  const caseId = '1234567890';
  const sessionID = '345345';

  const accessToken = 'accessToken';
  const serviceToken = 'serviceToken';

  const error = new HttpException(INTERNAL_SERVER_ERROR, 'Server Error');

  beforeEach(function () {
    req = {
      params: {
        action: '',
      },
      session: {
        accessToken,
        serviceToken,
        case: {
          online_hearing_id: '',
          case_reference: 'mockedCaseRef',
          case_id: caseId,
        },
        appeal: {
          benefitType: 'UC',
        },
        additional_evidence: {},
      },
      sessionID,
      body: {},
      file: null,
      query: {},
      cookies: {},
    } as any;

    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
      locals: {},
    } as any;
    additionalEvidenceService = {
      getEvidences: sinon.stub().resolves([]),
      uploadEvidence: sinon.stub().resolves(),
      submitSingleEvidences: sinon.stub().resolves(),
      removeEvidence: sinon.stub().resolves(),
    };
    next = sinon.stub().resolves();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackTrace');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should render about evidence page', function () {
    getAboutEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/about-evidence.njk'
    );
  });

  it('should pass "options" as argument to view if param action empty', async function () {
    req.session.case.case_id = caseId;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'options',
        benefitType: 'UC',
      }
    );
  });

  it('should pass "upload" as argument to view if param action is "upload"', async function () {
    const description = 'this is a description for the files to be upload';
    req.params.action = 'upload';
    req.session.case.online_hearing_id = 'hearingId';
    req.session.case.case_id = caseId;
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

  it('should catch error and track Excepction with AppInsights', async function () {
    additionalEvidenceService = {
      getEvidences: sinon.stub().rejects(error),
    };
    req.params.action = 'upload';
    req.session.case.online_hearing_id = 'hearingId';
    req.session.case.case_id = caseId;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(
      additionalEvidenceService.getEvidences
    ).to.have.been.calledOnce.calledWith(caseId);
    expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
      error
    );
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('should pass "statement" as argument to view if param action is "statement"', async function () {
    req.params.action = 'statement';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'statement',
        benefitType: 'UC',
      }
    );
  });

  it('should return benefitType null if appeal is null', async function () {
    req.params.action = 'statement';
    req.session.appeal = null;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'statement',
        benefitType: '',
      }
    );
  });

  it('should pass "post" as argument to view if param action is "post"', async function () {
    req.params.action = 'post';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'post',
        benefitType: 'UC',
      }
    );
  });

  it('should pass "options" as argument to view if param action is other', async function () {
    req.params.action = 'no-valid-argument';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith(
      'additional-evidence/index.njk',
      {
        action: 'options',
        benefitType: 'UC',
      }
    );
  });

  describe('#postAdditionalEvidence', function () {
    it('should render the send by post additional evidence page', function () {
      req.body['additional-evidence-option'] = 'post';
      postAdditionalEvidence(req, res);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.additionalEvidence}/${req.body['additional-evidence-option']}`
      );
    });

    it('should return page with error when action is invalid', function () {
      req.body['additional-evidence-option'] = null;
      postAdditionalEvidence(req, res);
      expect(res.render).to.have.been.calledWith(
        'additional-evidence/index.njk'
      );
    });
  });

  describe('#postEvidenceStatement', function () {
    let additionalEvidenceService;
    beforeEach(function () {
      additionalEvidenceService = {
        saveStatement: sinon.stub().resolves(),
      };
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should save statement and redirect to confirmation page', async function () {
      req.body['question-field'] = 'My amazing statement';
      req.session.case.online_hearing_id = 'hearingId';
      req.session.case.case_id = caseId;
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

    it('should not save statement and render index page with validation error', async function () {
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

    it('should call next and appInsights with the error when there is one', async function () {
      req.body['question-field'] = 'My amazing answer';
      additionalEvidenceService.saveStatement.rejects(error);
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('#postFileUpload', function () {
    it('should catch error and track Excepction with AppInsights', async function () {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sinon.stub().rejects(error),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(req.session.case.case_id, req.file);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should send error message for file upload error', async function () {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sinon.stub().resolves({
          id: null,
        }),
      };
      const description = 'this is a description for the files to be upload';
      req.session.additional_evidence.description = description;
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(req.session.case.case_id, req.file);
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

    it('should upload file and render upload page', async function () {
      req.file = {
        name: 'myfile.txt',
        buffer: new Buffer('some content'),
      };
      additionalEvidenceService = {
        uploadEvidence: sinon.stub().resolves({
          id: '1',
          statusCode: 200,
        }),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.uploadEvidence
      ).to.have.been.calledOnce.calledWith(req.session.case.case_id, req.file);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${Paths.additionalEvidence}/upload`
      );
      expect(AppInsights.trackTrace).to.have.been.calledOnce;
    });

    it('should delete file and render upload page', async function () {
      req.body.delete = { fileId1: 'Delete' };
      const fileId = 'fileId1';
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.removeEvidence
      ).to.have.been.calledOnce.calledWith(req.session.case.case_id, fileId);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${Paths.additionalEvidence}/upload`
      );
    });

    it('should catch error trying to delete file and track Exception with AppInsights', async function () {
      req.body.delete = { fileId1: 'Delete' };
      const fileId = 'fileId1';
      additionalEvidenceService = {
        removeEvidence: sinon.stub().rejects(error),
      };
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);

      expect(
        additionalEvidenceService.removeEvidence
      ).to.have.been.calledOnce.calledWith(req.session.case.case_id, fileId);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should show errors when no files submitted and missing descr', async function () {
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

    it('should submit evidences and description and redirect to confirmation page', async function () {
      req.body.buttonSubmit = 'there';
      const caseId = req.session.case.case_id;
      const evidence: EvidenceDescriptor = {
        created_date: "2018-10-24'T'12:11:21Z",
        file_name: 'some_file_name.txt',
        id: '8f79deb3-5d7a-4e6f-846a-a8131ac6a3bb',
        statusCode: 200,
      };
      additionalEvidenceService = {
        getEvidences: sinon.stub().resolves([evidence]),
        submitEvidences: sinon.stub().resolves(),
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

    it('should show errors when file size is bigger than certain limit', async function () {
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

    it('should show errors when audio/video file size is bigger than certain limit', async function () {
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

    it('should redirect to Task List if no file to upload or delete', async function () {
      await postFileUpload('upload', additionalEvidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });

    it('should submit audio/video evidences and description and redirect to confirmation page', async function () {
      req.body.buttonSubmit = 'there';
      const caseId = req.session.case.case_id;
      req.file = { name: 'myfile.mp3' };
      additionalEvidenceService = {
        submitSingleEvidences: sinon.stub().resolves(),
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

  describe('#getCaseId', function () {
    it('should return case id when case is not null', function () {
      req.session.case = {
        case_id: caseId,
      };
      expect(getCaseId(req)).to.equal(caseId);
    });

    it('should throw an error when case is null', function () {
      req.session.case = null;
      expect(() => {
        getCaseId(req);
      }).to.throw(`No Case for session ${sessionID}`);
    });
  });
});
