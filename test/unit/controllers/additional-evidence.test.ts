import { getAboutEvidence, getadditionalEvidence, postEvidenceStatement, postAdditionalEvidence } from 'app/server/controllers/additional-evidence';
import * as Paths from 'app/server/paths';
const { expect, sinon } = require('test/chai-sinon');
import * as AppInsights from 'app/server/app-insights';

describe('controllers/additional-evidence.js', () => {
  let req;
  let res;
  const next = sinon.stub();
  const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
  beforeEach(() => {
    req = {
      params: {
        action: ''
      },
      body: {}
    } as any;

    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;

    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  it('should render about evidence page', () => {
    getAboutEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/about-evidence.html');
  });

  it('should pass "options" as argument to view if param action empty', () => {
    getadditionalEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'options'
    });
  });

  it('should pass "upload" as argument to view if param action is "upload"', () => {
    req.params.action = 'upload';
    getadditionalEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'upload'
    });
  });

  it('should pass "statement" as argument to view if param action is "statement"', () => {
    req.params.action = 'statement';
    getadditionalEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'statement'
    });
  });

  it('should pass "post" as argument to view if param action is "post"', () => {
    req.params.action = 'post';
    getadditionalEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'post'
    });
  });

  it('should pass "options" as argument to view if param action is other', () => {
    req.params.action = 'no-valid-argument';
    getadditionalEvidence(req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', {
      action: 'options'
    });
  });

  describe('#postAdditionalEvidence', () => {
    it('should render the post additional info page.', () => {
      postAdditionalEvidence(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('additional-evidence/index.html', { action: req.body['additional-evidence-option'] });
    });
  });

  describe('#postEvidenceStatement', () => {
    let additionalEvidenceService;
    beforeEach(() => {
      additionalEvidenceService = {
        saveStatement: sinon.stub().resolves()
      };
    });

    afterEach(() => {
      res.redirect.reset();
    });

    it('should call res.redirect when saving an statement and there are no errors', async() => {
      req.body['question-field'] = 'My amazing statement';
      await postEvidenceStatement(additionalEvidenceService)(req, res, next);
      expect(additionalEvidenceService.saveStatement).to.have.been.calledOnce.calledWith(req.body['question-field']);
      expect(res.redirect).to.have.been.calledWith(`${Paths.additionalEvidence}/confirm`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
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

});
