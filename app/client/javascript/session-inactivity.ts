import * as moment from 'moment';
import axios from 'axios';
const i18n = require('../../../locale/en');

export class SessionInactivity {
  public sessionExtendBuffer: number = 10000;
  public sessionExpiry: moment.Moment = null;
  public lastReset: moment.Moment = null;
  public answerFormEl: HTMLElement = null;
  public modal: HTMLElement = null;
  public extend: HTMLElement = null;
  public cancel: HTMLElement = null;
  public ANSWER_FORM: string = 'answer-form';
  public EXTEND_BUTTON: string = 'extend';
  public CANCEL_BUTTON: string = 'cancel';
  public MODAL: string = 'timeout-dialog';
  public keyStrokeEventListener: any;
  public timeLeft: number = null;

  private timeOut: number;
  private modalInterval: number;
  private sessionTimeOut: number;

  init(): void {
    this.answerFormEl = document.getElementById(this.ANSWER_FORM);
    this.keyStrokeEventListener = this.extendSession.bind(this);

    this.modal = document.getElementById(this.MODAL);
    this.extend = document.getElementById(this.EXTEND_BUTTON);
    this.cancel = document.getElementById(this.CANCEL_BUTTON);

    this.addListeners();
    this.extendSession();
  }

  extendSession(): void {
    this.closeModal();
    this.restartCounters();
  }

  restartCounters(): void {
    this.stopCounters();
    this.startCounters();
  }

  startCounters(): void {
    this.startCountdown(10000);
    this.startSessionTimeOut(21000);
  }

  stopCounters(): void {
    clearInterval(this.modalInterval);
    clearTimeout(this.timeOut);
    clearTimeout(this.sessionTimeOut);
  }

  startSessionTimeOut(timeLeft: number) {
    this.sessionTimeOut = window.setTimeout(this.signOut, timeLeft);
  }

  startCountdown(timeLeft: number): void {
    this.timeOut = window.setTimeout(() => {
      this.openModal();
      this.startModalInterval();
    }, timeLeft);
  }

  startModalInterval(): void {
    let count = 0;
    this.modalInterval = window.setInterval(() => {
      const minutes: number = moment.duration((this.sessionExtendBuffer - count)).minutes();
      const seconds: string = moment.duration((this.sessionExtendBuffer - count)).seconds().toLocaleString('en-GB', { minimumIntegerDigits: 2 });
      const expiringMessage: string =
        `${i18n.cookieTimeOut.modal.body[0]} ${minutes}:${seconds} ${i18n.cookieTimeOut.modal.body[1]}`;

      document.getElementById('expiring-in-message').innerHTML = expiringMessage;
      count += 1000;
    }, 1000);
  }

  openModal() {
    this.modal.classList.add('modal--open');
  }

  closeModal() {
    this.modal.classList.remove('modal--open');
  }

  signOut() {
    window.location.assign('/sign-out');
  }

  addListeners() {
    this.bindModalButtonListeners();
    this.bindKeyStrokeListener();
  }

  removeListeners() {
    this.removeKeyStrokeListener();
    this.removeModalButtonListeners();
  }

  bindModalButtonListeners() {
    if (this.extend) this.extend.addEventListener('click', this.keyStrokeEventListener);
    if (this.cancel) this.cancel.addEventListener('click', this.signOut);
  }

  removeModalButtonListeners() {
    if (this.extend) this.extend.removeEventListener('click', this.keyStrokeEventListener);
    if (this.cancel) this.cancel.removeEventListener('click', this.closeModal);
  }

  bindKeyStrokeListener(): void {
    if (this.answerFormEl) this.answerFormEl.addEventListener('keydown', this.keyStrokeEventListener);
  }

  removeKeyStrokeListener(): void {
    if (this.answerFormEl) this.answerFormEl.removeEventListener('keydown', this.keyStrokeEventListener);
  }
}
