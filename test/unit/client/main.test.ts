import { expect, sinon } from 'test/chai-sinon';
import * as main from 'app/client/javascript/main';
import * as govUK from 'govuk-frontend';
import * as expandingTextBox from 'app/client/javascript/expanding-textbox';
import { DetailsTabIndexToggle } from 'app/client/javascript/detailsToggle';
import { CheckCookies } from 'app/client/javascript/check-cookies';
import { EvidenceUpload } from 'app/client/javascript/evidence-upload';
import { SessionInactivity } from 'app/client/javascript/session-inactivity';

describe('client main js', () => {
  let sandbox;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function () {
    sandbox.restore();
  });
  it('onReady', () => {
    const govUKMock = sandbox.stub(govUK, 'initAll');
    const expandingTextBoxMock = sandbox.stub(expandingTextBox, 'init');
    const checkCookiesMock = sandbox.stub(CheckCookies.prototype, 'init');
    const initEvidenceUploadMock = sandbox.stub(EvidenceUpload.prototype, 'init');
    const sessionInactivityMock = sandbox.stub(SessionInactivity.prototype, 'init');
    const detailsToggleMock = sandbox.stub(DetailsTabIndexToggle.prototype, 'init');

    main.onReady();
    expect(detailsToggleMock).to.have.been.calledOnce;
    expect(govUKMock).to.have.been.calledOnce;
    expect(expandingTextBoxMock).to.have.been.calledOnce;
    expect(checkCookiesMock).to.have.been.calledOnce;
    expect(initEvidenceUploadMock).to.have.been.calledOnce;
    expect(sessionInactivityMock).to.have.been.calledOnce;
  });
});
