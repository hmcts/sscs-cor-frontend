const multer = require('multer');
import * as config from 'config';
import { getAboutEvidence, getAdditionalEvidence, postEvidenceStatement, postAdditionalEvidence, postFileUpload } from 'app/server/controllers/additional-evidence';
import * as Paths from 'app/server/paths';
const { expect, sinon } = require('test/chai-sinon');
import * as AppInsights from 'app/server/app-insights';
import { EvidenceDescriptor } from 'app/server/services/additional-evidence';
const i18n = require('locale/en');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

describe('controllers/additional-evidence.js', () => {
  let req;
  let res;
  let next;
  let additionalEvidenceService;
  let sandbox: sinon.SinonSandbox;

  const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
  const accessToken = 'accessToken';
  const serviceToken = 'serviceToken';
  const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      params: {
        action: ''
      },
      session: {
        accessToken: accessToken,
        serviceToken: serviceToken,
        hearing: {
          online_hearing_id: '',
          case_reference: 'mockedCaseRef',
          case_id: '1234567890'
        },
        additional_evidence: {}
      },
      body: {},
      file: null,
      query: {}
    } as any;

    res = {
      render: sandbox.spy(),
      redirect: sandbox.spy(),
      locals: {}
    } as any;
    additionalEvidenceService = {
      getEvidences: sandbox.stub().resolves([]),
      uploadEvidence: sandbox.stub().resolves(),
      removeEvidence: sandbox.stub().resolves()
    };
    next = sandbox.stub();
    sandbox.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render about evidence page', () => {
    getAboutEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/about-evidence.html');
  });

  it('should pass "options" as argument to view if param action empty', async () => {
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'options',
      postBulkScan: false
    });
  });

  it('should pass "upload" as argument to view if param action is "upload"', async () => {
    const description: string = 'this is a description for the files to be upload';
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    const caseId = '1234567890';
    req.session.hearing.case_id = caseId;
    req.session.additional_evidence.description = description;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(additionalEvidenceService.getEvidences).to.have.been.calledOnce.calledWith(caseId);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'upload',
      description,
      evidences: []
    });
  });

  it('should catch error and track Excepction with AppInsights', async () => {
    additionalEvidenceService = {
      getEvidences: sandbox.stub().rejects(error)
    };
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    const caseId = '1234567890';
    req.session.hearing.case_id = caseId;
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(additionalEvidenceService.getEvidences).to.have.been.calledOnce.calledWith(caseId);
    expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('should pass "statement" as argument to view if param action is "statement"', async () => {
    req.params.action = 'statement';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'statement',
      postBulkScan: false
    });
  });

  it('should pass "post" as argument to view if param action is "post"', async () => {
    req.params.action = 'post';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'post',
      postBulkScan: false
    });
  });

  it('should pass "options" as argument to view if param action is other', async () => {
    req.params.action = 'no-valid-argument';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'options',
      postBulkScan: false
    });
  });

  describe('#postAdditionalEvidence', () => {
    it('should render the send by post additional evidence page', () => {
      postAdditionalEvidence(req, res);
      expect(res.redirect).to.have.been.calledWith(`${Paths.additionalEvidence}/${req.body['additional-evidence-option']}`);
    });
  });

  describe('#postEvidenceStatement', () => {
    let additionalEvidenceService;
    beforeEach(() => {
      additionalEvidenceService = {
        saveStatement: sandbox.stub().resolves()
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save statement and redirect to confirmation page', async() => {
      req.body['question-field'] = 'My amazing statement';
      req.session.hearing.online_hearing_id = 'hearingId';
      const caseId = '1234567890';
      req.session.hearing.case_id = caseId;
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).to.have.been.calledOnce.calledWith(caseId, req.body['question-field']);
      expect(res.redirect).to.have.been.calledWith(`${Paths.additionalEvidence}/confirm`);
    });

    it('should not save statement and render index page with validation error', async () => {
      req.body['question-field'] = '';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
        action: 'statement',
        error: i18n.question.textareaField.errorOnSave.empty
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      additionalEvidenceService.saveStatement.rejects(error);
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('#postFileUpload', () => {

    it('should catch error and track Excepction with AppInsights', async () => {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sandbox.stub().rejects(error)
      };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.uploadEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, req.file);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should upload file and render upload page', async () => {
      req.file = { name: 'myfile.txt' };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.uploadEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, req.file);
      expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.additionalEvidence}/upload`);
    });

    it('should delete file and render upload page', async () => {
      req.body.delete = { 'fileId1': 'Delete' };
      const fileId: string = 'fileId1';
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.removeEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, fileId);
      expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.additionalEvidence}/upload`);
    });

    it('should catch error trying to delete file and track Exception with AppInsights', async () => {
      req.body.delete = { 'fileId1': 'Delete' };
      const fileId: string = 'fileId1';
      additionalEvidenceService = {
        removeEvidence: sandbox.stub().rejects(error)
      };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.removeEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.case_id, fileId);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should show errors when no files submitted and missing descr', async () => {
      req.body.buttonSubmit = 'there';
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(res.render).to.have.been.calledOnce.calledWith(`additional-evidence/index.html`, {
        action: 'upload',
        evidences: [],
        description: '',
        error: i18n.additionalEvidence.evidenceUpload.error.emptyDescription,
        fileUploadError: i18n.additionalEvidence.evidenceUpload.error.noFilesUploaded
      });
    });

    it('should submit evidences and description and redirect to confirmation page', async () => {
      req.body.buttonSubmit = 'there';
      const caseId = req.session.hearing.case_id;
      const evidence: EvidenceDescriptor = {
        'created_date': "2018-10-24'T'12:11:21Z",
        'file_name': 'some_file_name.txt',
        'id': '8f79deb3-5d7a-4e6f-846a-a8131ac6a3bb'
      };
      additionalEvidenceService = {
        getEvidences: sandbox.stub().resolves([evidence]),
        submitEvidences: sandbox.stub().resolves()
      };
      const description: string = 'this is a description for the files to be upload';
      req.body['additional-evidence-description'] = description;

      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.submitEvidences).to.have.been.calledOnce.calledWith(caseId, description, req);
      expect(req.session.additional_evidence.description).to.equal('');
    });

    it('should show errors when file size is bigger than certain limit', async () => {
      const fileSizeErrorMsg = `${i18n.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
      res.locals.multerError = fileSizeErrorMsg;
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(res.render).to.have.been.calledOnce.calledWith(`additional-evidence/index.html`, {
        action: 'upload',
        evidences: [],
        description: '',
        fileUploadError: fileSizeErrorMsg
      });
    });

    it('should redirect to Task List if no file to upload or delete', async () => {
      await postFileUpload(additionalEvidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });

  });
});
