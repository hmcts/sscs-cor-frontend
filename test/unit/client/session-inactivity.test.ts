import { expect, sinon } from 'test/chai-sinon';
import { SessionInactivity } from 'app/client/javascript/session-inactivity';
import * as moment from 'moment';
import { Session } from 'inspector';

describe('Client/session-inactivity', () => {
  let sessionInactivity: SessionInactivity;
  let target: HTMLElement;
  let modal: HTMLElement;
  let extendButton: HTMLElement;
  let cancelButton: HTMLElement;
  let extendSessionMock: any;
  let bindModalMock: any;
  let addListernersMock: sinon.SinonStub;

  before(() => {
    sessionInactivity = new SessionInactivity();
    extendSessionMock = sinon.stub(SessionInactivity.prototype, 'extendSession');
    bindModalMock = sinon.stub(SessionInactivity.prototype, 'bindModalButtonListeners');
    addListernersMock = sinon.stub(SessionInactivity.prototype, 'addListeners');
    document.body.innerHTML =
      `<form id="${sessionInactivity.ANSWER_FORM}"></form>
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

  describe('Class', () => {
    it('should initialize', () => {
      sessionInactivity.init();
      expect(sessionInactivity.answerFormEl).to.equal(target);
      expect(sessionInactivity.modal).to.equal(modal);
      expect(sessionInactivity.extend).to.equal(extendButton);
      expect(sessionInactivity.cancel).to.equal(cancelButton);

      expect(addListernersMock).to.have.been.called;
      expect(extendSessionMock).to.have.been.called;
    });
  });

  describe('extendSession', () => {
    beforeEach(() => {
      extendSessionMock.restore();
    });

    it('should extendSession if first time', () => {
      sessionInactivity.extendSession();
    });

    it('within the buffer  make an extension call', () => {
      sessionInactivity.extendSession();
    });

    it('outside the buffer wait', () => {
      sessionInactivity.extendSession();
    });

  });

  describe('Event listeners', () => {
    beforeEach(() => {
      extendSessionMock.reset();
    });

    it('should remove keystroke event', () => {
      sessionInactivity.removeKeyStrokeListener();
      target.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'a' }));
      expect(extendSessionMock).to.not.have.been.called;
    });

    it('should bind keystroke event', () => {
      sessionInactivity.bindKeyStrokeListener();
      target.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'a' }));
      expect(extendSessionMock).to.have.been.called;
    });

    it('should bind extend event', () => {
      sessionInactivity.bindModalButtonListeners();

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20
      });
      extendButton.dispatchEvent(evt);
      expect(bindModalMock).to.have.been.called;
    });

    it('should open modal', () => {
      sessionInactivity.openModal();

      const classes = document.getElementById('timeout-dialog').className;
      expect(classes).to.contain('modal--open');
    });

    it('should close modal', () => {
      sessionInactivity.closeModal();

      const classes = document.getElementById('timeout-dialog').className;
      expect(classes).to.not.contain('modal--open');
    });

  });

  describe('Counters', () => {
    let sandbox;
    let clock;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      sandbox.restore();
      clock.restore();
    });

    it('should restart counters', () => {
      const stopCountersStub = sandbox.stub(SessionInactivity.prototype, 'stopCounters');
      const startCountersStub = sandbox.stub(SessionInactivity.prototype, 'startCounters');

      sessionInactivity.restartCounters();

      expect(stopCountersStub).to.have.been.called;
      expect(startCountersStub).to.have.been.called;
    });

    it('should start Counters', () => {
      const startCountdownStub = sandbox.stub(SessionInactivity.prototype, 'startCountdown');
      const startSessionTimeOutStub = sandbox.stub(SessionInactivity.prototype, 'startSessionTimeOut');

      sessionInactivity.startCounters();

      expect(startCountdownStub).to.have.been.called;
      expect(startSessionTimeOutStub).to.have.been.called;
    });

    it('should stop counters', () => {
      sinon.spy(clock, 'clearTimeout');
      sinon.spy(clock, 'clearInterval');
      sessionInactivity.stopCounters();

      expect(clock.clearTimeout).to.have.been.calledTwice;
      expect(clock.clearInterval).to.have.been.calledOnce;
    });

    it('should start session timeOut', () => {
      const signOutStub = sandbox.stub(SessionInactivity.prototype, 'signOut');

      sessionInactivity.startSessionTimeOut(2000);
      clock.tick(2001);

      expect(signOutStub).to.have.been.called;
    });

    it('should start countDown', () => {
      const openModalSpy = sandbox.spy(SessionInactivity.prototype, 'openModal');
      const startModalIntervalSpy = sandbox.spy(SessionInactivity.prototype, 'startModalInterval');
      sessionInactivity.startCountdown(2000);
      clock.tick(2001);

      expect(openModalSpy).to.have.been.called;
      expect(startModalIntervalSpy).to.have.been.called;
    });

    it('should modify expiring message when interval starts', () => {
      sessionInactivity.startModalInterval();
      clock.tick(1001);

      const message = document.getElementById('expiring-in-message');
      expect(message.innerHTML).to.be.equal('Your session will expire in 2:00 minutes and you will be signed out.');
    });
  });
});
