import { expect, sinon } from 'test/chai-sinon';
import { SessionInactivity } from 'app/client/javascript/session-inactivity';
import moment from 'moment';
import { SinonSpy, SinonStub } from 'sinon';

describe('Client/session-inactivity', function () {
  let sessionInactivity: SessionInactivity;
  let target: HTMLElement;
  let modal: HTMLElement;
  let extendButton: HTMLElement;
  let cancelButton: HTMLElement;
  let extendSessionMock: SinonStub;
  let bindModalMock: SinonStub;
  let addListernersMock: SinonStub;
  let fetchStub: SinonStub;

  before(function () {
    sessionInactivity = new SessionInactivity();
    extendSessionMock = sinon.stub(
      SessionInactivity.prototype,
      'extendSession'
    );
    bindModalMock = sinon.stub(
      SessionInactivity.prototype,
      'bindModalButtonListeners'
    );
    addListernersMock = sinon.stub(SessionInactivity.prototype, 'addListeners');
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub.resolves({
      json: sinon.stub().resolves({
        data: { expireInSeconds: 1200000 },
      }),
    });
    document.body.innerHTML = `<form id="${sessionInactivity.ANSWER_FORM}"></form>
      <div id="timeout-dialog" class="modal">
      <button id="extend">Extend</button>
      <button id="cancel">Cancel</button>
      <p id="expiring-in-message"></p>
      </div>`;

    target = document.getElementById(sessionInactivity.ANSWER_FORM);
    modal = document.getElementById(sessionInactivity.MODAL);
    extendButton = document.getElementById(sessionInactivity.EXTEND_BUTTON);
    cancelButton = document.getElementById(sessionInactivity.CANCEL_BUTTON);
  });

  after(function () {
    fetchStub.restore();
  });

  describe('Class', function () {
    it('should initialize', function () {
      sessionInactivity.init();
      expect(sessionInactivity.answerFormEl).to.equal(target);
      expect(sessionInactivity.modal).to.equal(modal);
      expect(sessionInactivity.extend).to.equal(extendButton);
      expect(sessionInactivity.cancel).to.equal(cancelButton);

      expect(addListernersMock).to.have.been.called;
      expect(extendSessionMock).to.have.been.called;
    });
  });

  describe('extendSession', function () {
    beforeEach(function () {
      extendSessionMock.restore();
    });

    it('should extendSession if first time', function () {
      sessionInactivity.lastReset = null;
      sessionInactivity.extendSession();
      expect(fetchStub.calledOnce).to.be.true;
    });

    it('within the buffer  make an extension call', function () {
      sessionInactivity.lastReset = moment().subtract(
        sessionInactivity.sessionExtendBuffer - 10,
        's'
      );
      sessionInactivity.sessionExpiry = moment().add(2000, 's');
      sessionInactivity.extendSession();
      expect(fetchStub.calledOnce).to.be.true;
    });

    it('outside the buffer wait', function () {
      sessionInactivity.sessionExpiry = moment().add(20, 's');
      sessionInactivity.extendSession();
      expect(fetchStub.calledOnce).to.be.false;
    });
  });

  describe('Event listeners', function () {
    beforeEach(function () {
      extendSessionMock.reset();
    });

    it('should remove keystroke event', function () {
      sessionInactivity.removeKeyStrokeListener();
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(extendSessionMock).to.not.have.been.called;
    });

    it('should bind keystroke event', function () {
      sessionInactivity.bindKeyStrokeListener();
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(extendSessionMock).to.have.been.called;
    });

    it('should bind extend event', function () {
      sessionInactivity.bindModalButtonListeners();

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20,
      });
      extendButton.dispatchEvent(evt);
      expect(bindModalMock).to.have.been.called;
    });

    it('should open modal', function () {
      sessionInactivity.openModal();

      const classes = document.getElementById('timeout-dialog').className;
      expect(classes).to.contain('modal--open');
    });

    it('should close modal', function () {
      sessionInactivity.closeModal();

      const classes = document.getElementById('timeout-dialog').className;
      expect(classes).to.not.contain('modal--open');
    });
  });

  describe('Counters', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      sinon.restore();
      clock.restore();
    });

    it('should restart counters', function () {
      const stopCountersStub = sinon.stub(
        SessionInactivity.prototype,
        'stopCounters'
      );
      const startCountersStub = sinon.stub(
        SessionInactivity.prototype,
        'startCounters'
      );

      sessionInactivity.restartCounters();

      expect(stopCountersStub).to.have.been.called;
      expect(startCountersStub).to.have.been.called;
    });

    it('should start Counters', function () {
      const startCountdownStub = sinon.stub(
        SessionInactivity.prototype,
        'startCountdown'
      );
      const startSessionTimeOutStub = sinon.stub(
        SessionInactivity.prototype,
        'startSessionTimeOut'
      );

      sessionInactivity.startCounters();

      expect(startCountdownStub).to.have.been.called;
      expect(startSessionTimeOutStub).to.have.been.called;
    });

    it('should stop counters', function () {
      sinon.spy(clock, 'clearTimeout');
      sinon.spy(clock, 'clearInterval');
      sessionInactivity.stopCounters();

      expect(clock.clearTimeout).to.have.been.calledTwice;
      expect(clock.clearInterval).to.have.been.calledOnce;
    });

    it('should start session timeOut', function () {
      const signOutStub = sinon.stub(SessionInactivity.prototype, 'signOut');

      sessionInactivity.startSessionTimeOut(2000);
      clock.tick(2001);

      expect(signOutStub).to.have.been.called;
    });

    it('should start countDown', function () {
      const openModalSpy = sinon.spy(SessionInactivity.prototype, 'openModal');
      const startModalIntervalSpy = sinon.spy(
        SessionInactivity.prototype,
        'startModalInterval'
      );
      sessionInactivity.startCountdown(2000);
      clock.tick(2001);

      expect(openModalSpy).to.have.been.called;
      expect(startModalIntervalSpy).to.have.been.called;
    });

    it('should modify expiring message when interval starts', function () {
      sessionInactivity.startModalInterval();
      clock.tick(1001);

      const message = document.getElementById('expiring-in-message');
      expect(message.innerHTML).to.be.equal(
        'Your session will expire in 2:00 minutes and you will be signed out.'
      );
    });
  });
});
