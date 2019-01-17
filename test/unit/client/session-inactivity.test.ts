import { expect, sinon } from 'test/chai-sinon';
import { SessionInactivity } from 'app/client/javascript/session-inactivity';
import * as moment from 'moment';
import axios from 'axios';

describe('Client/session-inactivity', () => {
  let sessionInactivity: SessionInactivity;
  let body: HTMLBodyElement;
  let target: HTMLElement;
  let extendSessionMock: any;
  let axiosSpy: any;

  before(() => {
    sessionInactivity = new SessionInactivity();
    extendSessionMock = sinon.stub(SessionInactivity.prototype, 'extendSession');
    axiosSpy = sinon.spy(axios, 'get');
    body = document.querySelector('body');
    body.innerHTML = `<form id="${sessionInactivity.ANSWER_FORM}"></form>`;
    target = document.getElementById(sessionInactivity.ANSWER_FORM);
  });

  describe('Class', () => {
    it('should initialize', () => {
      sessionInactivity.init();
      expect(sessionInactivity.answerFormEl).to.equal(target);
    });
  });

  describe('extendSession', () => {
    beforeEach(() => {
      extendSessionMock.restore();
      axiosSpy.reset();
    });

    it('should extendSession if first time', () => {
      sessionInactivity.lastReset = null;
      sessionInactivity.extendSession();
      expect(axiosSpy).to.have.been.called;
    });

    it('within the buffer  make an extension call', () => {
      sessionInactivity.lastReset = moment().subtract(sessionInactivity.sessionExtendBuffer - 10, 's');
      sessionInactivity.extendSession();
      expect(axiosSpy).to.not.have.been.called;
    });

    it('outside the buffer wait', () => {
      sessionInactivity.lastReset = moment().subtract(sessionInactivity.sessionExtendBuffer + 10, 's');
      sessionInactivity.extendSession();
      expect(axiosSpy).to.have.been.called;
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
  });

});
