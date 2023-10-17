import { expect, sinon } from 'test/chai-sinon';
import { DetailsTabIndexToggle } from '../../../app/client/javascript/details-toggle';

const html = `
<details class="govuk-details contact-us">
  <summary class="govuk-details__summary" role="button" aria-controls="details-content-6830cb99-7579-4aa3-a7bc-6e2e11e6f6e1" aria-expanded="false">
    <span class="govuk-details__summary-text">
      Contact us for help
    </span>
  </summary>

  <div class="govuk-details__text" id="details-content-6830cb99-7579-4aa3-a7bc-6e2e11e6f6e1" aria-hidden="true">
    <div class="mya-contact__option">
      <h2 class="govuk-heading-m">Web chat</h2>
      <p>Get some help by chatting online to an agent.<br><a href="#">Start web chat (opens in a new window)</a>.<br>(Monday to Friday, 9.00am to 5.00pm)</p>
    </div>
    <div class="mya-contact__option">
      <h2 class="govuk-heading-m">Send us a message</h2>
      <p>You’ll get a response by email within 2 working days. <br><a href="#">Send message (opens in a new window)</a></p>
    </div>
    <div class="mya-contact__option">
      <h2 class="govuk-heading-m">Telephone</h2>
      <p>Talk to one of our agents now over the phone.</p>
      <h2 class="govuk-heading-s">Benefit appeals helpline (England and Wales)</h2>
      <p>Telephone: 0300 123 1142<br>Monday to Friday, 8:30am to 5pm<br><a href="#">Find out about call charges</a></p>
      <h2 class="govuk-heading-s">Benefit appeals helpline (Scotland)</h2>
      <p>Telephone: 0300 790 6234<br>Monday to Friday, 8:30am to 5pm<br><a href="#">Find out about call charges</a></p>
    </div>
  </div>
</details>`;

describe('detailsTabIndexToggle', function () {
  let detailsToggle: DetailsTabIndexToggle;
  before(function () {
    document.body.innerHTML = html;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should add tabindex to aria-hidden child element on load', function () {
    const attachListernersMock = sinon.stub(
      DetailsTabIndexToggle.prototype,
      'attachListeners'
    );
    detailsToggle = new DetailsTabIndexToggle();
    detailsToggle.init();
    expect(attachListernersMock).to.have.been.called;
    const value = document
      .querySelector('.govuk-details__text a')
      .getAttribute('tabindex');
    expect(value).to.equal('-1');
  });

  it('should remove tabindex attribute on init', function () {
    const removeAttributeMock = sinon.stub(
      document.querySelector('.govuk-details__text a'),
      'removeAttribute'
    );
    document.querySelector('details').open = true;
    detailsToggle.init();

    expect(removeAttributeMock).to.have.been.called.calledWith('tabindex');
  });

  it('should attach listeners', function () {
    const addEventListenerStub: sinon.SinonStub = sinon.stub(
      document.querySelector('details.govuk-details'),
      'addEventListener'
    );
    detailsToggle.attachListeners();

    expect(addEventListenerStub).to.have.been.called.calledWith('toggle');
  });

  it('should toggle tabindex attribute', function () {
    const selector: HTMLDetailsElement =
      document.querySelector('.govuk-details');
    const target = document.querySelector('.govuk-details__text');
    const removeAttributeMock = sinon.stub(
      target.querySelector('a'),
      'removeAttribute'
    );
    const setAttributeMock = sinon.stub(
      target.querySelector('a'),
      'setAttribute'
    );
    detailsToggle.toggleAttribute(selector, target);

    expect(removeAttributeMock).to.have.been.called;

    selector.open = false;
    detailsToggle.toggleAttribute(selector, target);
    expect(setAttributeMock).to.have.been.called;
  });
});
