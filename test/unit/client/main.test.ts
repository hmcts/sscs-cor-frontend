import { expect, sinon } from 'test/chai-sinon';
import * as main from 'app/client/javascript/main';
import govUK from 'govuk-frontend';
import * as expandingTextBox from 'app/client/javascript/expanding-textbox';
import { DetailsTabIndexToggle } from '../../../app/client/javascript/details-toggle';
import { EvidenceUpload } from 'app/client/javascript/evidence-upload';
import { SessionInactivity } from 'app/client/javascript/session-inactivity';
import { EvidenceStatement } from 'app/client/javascript/evidence-statement';

const html = `<div id="app-cookie-banner" >`;

describe('client main js', function () {
  let body;
  beforeEach(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
  });
  afterEach(function () {
    sinon.restore();
  });
  it('onReady', function () {
    const govUKMock = sinon.stub(govUK, 'initAll');
    const expandingTextBoxMock = sinon.stub(expandingTextBox, 'init');
    const initEvidenceUploadMock = sinon.stub(EvidenceUpload.prototype, 'init');
    const initEvidenceStatementMock = sinon.stub(
      EvidenceStatement.prototype,
      'init'
    );
    const sessionInactivityMock = sinon.stub(
      SessionInactivity.prototype,
      'init'
    );
    const detailsToggleMock = sinon.stub(
      DetailsTabIndexToggle.prototype,
      'init'
    );

    main.onReady();
    expect(detailsToggleMock).to.have.been.calledOnce;
    expect(govUKMock).to.have.been.calledOnce;
    expect(expandingTextBoxMock).to.have.been.calledOnce;
    expect(initEvidenceStatementMock).to.have.been.calledTwice;
    expect(initEvidenceUploadMock).to.have.been.calledOnce;
    expect(sessionInactivityMock).to.have.been.calledOnce;
  });
});
