import { getadditionalEvidence } from 'app/server/controllers/additional-evidence';

const { expect, sinon } = require('test/chai-sinon');

describe('controllers/additional-evidence.js', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      params: {
        action: ''
      }
    } as any;

    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
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
});
