import { getAboutEvidence, getAdditionalEvidence, postEvidenceStatement, postAdditionalEvidence, postFileUpload } from 'app/server/controllers/additional-evidence';
import * as Paths from 'app/server/paths';
const { expect, sinon } = require('test/chai-sinon');
import * as AppInsights from 'app/server/app-insights';

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
          online_hearing_id: ''
        }
      },
      body: {},
      file: null,
      query: {}
    } as any;

    res = {
      render: sandbox.spy(),
      redirect: sandbox.spy()
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
      action: 'options'
    });
  });

  it('should pass "upload" as argument to view if param action is "upload"', async () => {
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(additionalEvidenceService.getEvidences).to.have.been.calledOnce.calledWith('hearingId');
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'upload',
      question: { evidence: [] },
      success: false
    });
  });

  it('should catch error and track Excepction with AppInsights', async () => {
    additionalEvidenceService = {
      getEvidences: sandbox.stub().rejects(error)
    };
    req.params.action = 'upload';
    req.session.hearing.online_hearing_id = 'hearingId';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);

    expect(additionalEvidenceService.getEvidences).to.have.been.calledOnce.calledWith('hearingId');
    expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('should pass "statement" as argument to view if param action is "statement"', async () => {
    req.params.action = 'statement';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'statement'
    });
  });

  it('should pass "post" as argument to view if param action is "post"', async () => {
    req.params.action = 'post';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'post'
    });
  });

  it('should pass "options" as argument to view if param action is other', async () => {
    req.params.action = 'no-valid-argument';
    await getAdditionalEvidence(additionalEvidenceService)(req, res, next);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'options'
    });
  });

  describe('#postAdditionalEvidence', () => {
    it('should render the send by post additional evidence page.', () => {
      postAdditionalEvidence(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', { action: req.body['additional-evidence-option'] });
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

    it('should call res.redirect when saving an statement and there are no errors', async() => {
      req.body['question-field'] = 'My amazing statement';
      req.session.hearing.online_hearing_id = 'hearingId';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).to.have.been.calledOnce.calledWith('hearingId', req.body['question-field']);
      expect(res.redirect).to.have.been.calledWith(`${Paths.additionalEvidence}/confirm`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      additionalEvidenceService.saveStatement.rejects(error);
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('should not update an empty answer when saving', async () => {
      req.body['question-field'] = '';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).not.to.have.been.called;
    });

    it('should call res.render with the validation error message when submitting', async () => {
      req.body['question-field'] = '';
      req.body.submit = 'submit';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(res.render).to.have.been.calledOnce;
    });

  });

  describe('#postFileUpload', () => {

    it('should catch error and track Excepction with AppInsights', async () => {
      req.file = { name: 'myfile.txt' };
      additionalEvidenceService = {
        uploadEvidence: sandbox.stub().rejects(error)
      };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.uploadEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.online_hearing_id, req.file);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should upload file and render upload page', async () => {
      req.file = { name: 'myfile.txt' };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.uploadEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.online_hearing_id, req.file);
      expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.additionalEvidence}/upload`);
    });

    it('should delete file and render upload page', async () => {
      req.body.delete = { 'fileId1': 'Delete' };
      const fileId: string = 'fileId1';
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.removeEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.online_hearing_id, fileId);
      expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.additionalEvidence}/upload`);
    });

    it('should catch error trying to delete file and track Exception with AppInsights', async () => {
      req.body.delete = { 'fileId1': 'Delete' };
      const fileId: string = 'fileId1';
      additionalEvidenceService = {
        removeEvidence: sandbox.stub().rejects(error)
      };
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(additionalEvidenceService.removeEvidence).to.have.been.calledOnce.calledWith(req.session.hearing.online_hearing_id, fileId);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to Task List if no file to upload or delete', async () => {
      await postFileUpload(additionalEvidenceService)(req, res, next);

      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });

  });

});
